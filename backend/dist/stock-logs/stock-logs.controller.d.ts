import { StockLogsService } from './stock-logs.service';
import { CreateStockLogDto } from './dto/create-stock-log.dto';
export declare class StockLogsController {
    private readonly stockLogsService;
    constructor(stockLogsService: StockLogsService);
    create(createStockLogDto: CreateStockLogDto): Promise<import("./entities/stock-log.entity").StockLog>;
    findAll(): Promise<{
        data: import("./entities/stock-log.entity").StockLog[];
        total: number;
    }>;
    findByProduct(productId: string): Promise<import("./entities/stock-log.entity").StockLog[]>;
    findOne(id: string): Promise<import("./entities/stock-log.entity").StockLog>;
}
