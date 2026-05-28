import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Product } from '../products/entities/product.entity';
import { StockLogsService } from '../stock-logs/stock-logs.service';
import { StockLogType } from '../stock-logs/entities/stock-log.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private stockLogsService: StockLogsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Validate all products exist and have sufficient stock
    for (const item of createOrderDto.items) {
      const product = await this.productsRepository.findOne({
        where: { id: item.product_id },
      });
      
      if (!product) {
        throw new NotFoundException(`Product with ID ${item.product_id} not found`);
      }
      
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product.name}`);
      }
    }

    // Create order
    const order = this.ordersRepository.create({
      user_id: createOrderDto.user_id,
      total_price: createOrderDto.total_price,
      status: createOrderDto.status || OrderStatus.PENDING,
      shipping_address: createOrderDto.shipping_address,
      phone: createOrderDto.phone,
      notes: createOrderDto.notes,
    });
    
    const savedOrder = await this.ordersRepository.save(order);

    // Create order items and update stock
    for (const item of createOrderDto.items) {
      const orderItem = this.orderItemsRepository.create({
        order_id: savedOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      });
      await this.orderItemsRepository.save(orderItem);

      // Update product stock
      await this.productsRepository.decrement(
        { id: item.product_id },
        'stock',
        item.quantity,
      );

      // Log stock movement
      await this.stockLogsService.logStockMovement(
        item.product_id,
        item.quantity,
        StockLogType.OUT,
        `Order #${savedOrder.id} created`,
      );
    }

    return this.findOne(savedOrder.id);
  }

  async findAll(userId?: number, page = 1, limit = 10): Promise<{ data: Order[]; total: number }> {
    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('order.created_at', 'DESC');

    if (userId) {
      queryBuilder.andWhere('order.user_id = :userId', { userId });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByUser(userId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user_id: userId },
      relations: ['items', 'items.product'],
      order: { created_at: 'DESC' },
    });
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // If order is being cancelled, restore stock and log movement
    if (updateOrderDto.status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await this.productsRepository.increment(
          { id: item.product_id },
          'stock',
          item.quantity,
        );

        // Log stock movement
        await this.stockLogsService.logStockMovement(
          item.product_id,
          item.quantity,
          StockLogType.IN,
          `Order #${order.id} cancelled`,
        );
      }
    }

    Object.assign(order, updateOrderDto);
    return this.ordersRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    
    // Restore stock if order is not cancelled and log movement
    if (order.status !== OrderStatus.CANCELLED) {
      for (const item of order.items) {
        await this.productsRepository.increment(
          { id: item.product_id },
          'stock',
          item.quantity,
        );

        // Log stock movement
        await this.stockLogsService.logStockMovement(
          item.product_id,
          item.quantity,
          StockLogType.IN,
          `Order #${order.id} deleted`,
        );
      }
    }
    
    await this.ordersRepository.remove(order);
  }

  async getStats(): Promise<any> {
    const totalOrders = await this.ordersRepository.count();
    const pendingOrders = await this.ordersRepository.count({ where: { status: OrderStatus.PENDING } });
    const completedOrders = await this.ordersRepository.count({ where: { status: OrderStatus.COMPLETED } });
    
    const totalRevenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_price)', 'total')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .getRawOne();

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue?.total || 0,
    };
  }
}
