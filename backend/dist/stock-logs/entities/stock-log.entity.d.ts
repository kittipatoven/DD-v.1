export declare enum StockLogType {
    IN = "in",
    OUT = "out"
}
export declare class StockLog {
    id: number;
    product: any;
    product_id: number;
    type: StockLogType;
    quantity: number;
    note: string;
    created_at: Date;
}
