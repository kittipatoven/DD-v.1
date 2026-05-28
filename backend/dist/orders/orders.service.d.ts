import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Product } from '../products/entities/product.entity';
import { StockLogsService } from '../stock-logs/stock-logs.service';
export declare class OrdersService {
    private ordersRepository;
    private orderItemsRepository;
    private productsRepository;
    private stockLogsService;
    constructor(ordersRepository: Repository<Order>, orderItemsRepository: Repository<OrderItem>, productsRepository: Repository<Product>, stockLogsService: StockLogsService);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(userId?: number, page?: number, limit?: number): Promise<{
        data: Order[];
        total: number;
    }>;
    findOne(id: number): Promise<Order>;
    findByUser(userId: number): Promise<Order[]>;
    update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order>;
    remove(id: number): Promise<void>;
    getStats(): Promise<any>;
}
