"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const product_entity_1 = require("../products/entities/product.entity");
const stock_logs_service_1 = require("../stock-logs/stock-logs.service");
const stock_log_entity_1 = require("../stock-logs/entities/stock-log.entity");
let OrdersService = class OrdersService {
    constructor(ordersRepository, orderItemsRepository, productsRepository, stockLogsService) {
        this.ordersRepository = ordersRepository;
        this.orderItemsRepository = orderItemsRepository;
        this.productsRepository = productsRepository;
        this.stockLogsService = stockLogsService;
    }
    async create(createOrderDto) {
        for (const item of createOrderDto.items) {
            const product = await this.productsRepository.findOne({
                where: { id: item.product_id },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product with ID ${item.product_id} not found`);
            }
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for product ${product.name}`);
            }
        }
        const order = this.ordersRepository.create({
            user_id: createOrderDto.user_id,
            total_price: createOrderDto.total_price,
            status: createOrderDto.status || order_entity_1.OrderStatus.PENDING,
            shipping_address: createOrderDto.shipping_address,
            phone: createOrderDto.phone,
            notes: createOrderDto.notes,
        });
        const savedOrder = await this.ordersRepository.save(order);
        for (const item of createOrderDto.items) {
            const orderItem = this.orderItemsRepository.create({
                order_id: savedOrder.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
            });
            await this.orderItemsRepository.save(orderItem);
            await this.productsRepository.decrement({ id: item.product_id }, 'stock', item.quantity);
            await this.stockLogsService.logStockMovement(item.product_id, item.quantity, stock_log_entity_1.StockLogType.OUT, `Order #${savedOrder.id} created`);
        }
        return this.findOne(savedOrder.id);
    }
    async findAll(userId, page = 1, limit = 10) {
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
    async findOne(id) {
        const order = await this.ordersRepository.findOne({
            where: { id },
            relations: ['items', 'items.product', 'user'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }
    async findByUser(userId) {
        return this.ordersRepository.find({
            where: { user_id: userId },
            relations: ['items', 'items.product'],
            order: { created_at: 'DESC' },
        });
    }
    async update(id, updateOrderDto) {
        const order = await this.findOne(id);
        if (updateOrderDto.status === order_entity_1.OrderStatus.CANCELLED && order.status !== order_entity_1.OrderStatus.CANCELLED) {
            for (const item of order.items) {
                await this.productsRepository.increment({ id: item.product_id }, 'stock', item.quantity);
                await this.stockLogsService.logStockMovement(item.product_id, item.quantity, stock_log_entity_1.StockLogType.IN, `Order #${order.id} cancelled`);
            }
        }
        Object.assign(order, updateOrderDto);
        return this.ordersRepository.save(order);
    }
    async remove(id) {
        const order = await this.findOne(id);
        if (order.status !== order_entity_1.OrderStatus.CANCELLED) {
            for (const item of order.items) {
                await this.productsRepository.increment({ id: item.product_id }, 'stock', item.quantity);
                await this.stockLogsService.logStockMovement(item.product_id, item.quantity, stock_log_entity_1.StockLogType.IN, `Order #${order.id} deleted`);
            }
        }
        await this.ordersRepository.remove(order);
    }
    async getStats() {
        const totalOrders = await this.ordersRepository.count();
        const pendingOrders = await this.ordersRepository.count({ where: { status: order_entity_1.OrderStatus.PENDING } });
        const completedOrders = await this.ordersRepository.count({ where: { status: order_entity_1.OrderStatus.COMPLETED } });
        const totalRevenue = await this.ordersRepository
            .createQueryBuilder('order')
            .select('SUM(order.total_price)', 'total')
            .where('order.status = :status', { status: order_entity_1.OrderStatus.COMPLETED })
            .getRawOne();
        return {
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue: totalRevenue?.total || 0,
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        stock_logs_service_1.StockLogsService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map