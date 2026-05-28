import { StockLogType } from '../entities/stock-log.entity';
export declare class CreateStockLogDto {
    product_id: number;
    type: StockLogType;
    quantity: number;
    note?: string;
}
