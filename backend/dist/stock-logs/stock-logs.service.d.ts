import { Repository } from 'typeorm';
import { StockLog, StockLogType } from './entities/stock-log.entity';
import { CreateStockLogDto } from './dto/create-stock-log.dto';
import { Product } from '../products/entities/product.entity';
export declare class StockLogsService {
    private stockLogsRepository;
    private productsRepository;
    constructor(stockLogsRepository: Repository<StockLog>, productsRepository: Repository<Product>);
    create(createStockLogDto: CreateStockLogDto): Promise<StockLog>;
    findByProduct(productId: number): Promise<StockLog[]>;
    findAll(page?: number, limit?: number): Promise<{
        data: StockLog[];
        total: number;
    }>;
    findOne(id: number): Promise<StockLog>;
    logStockMovement(productId: number, quantity: number, type: StockLogType, note?: string): Promise<void>;
}
