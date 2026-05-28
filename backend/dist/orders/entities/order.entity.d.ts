export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    SHIPPED = "shipped",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Order {
    id: number;
    user: any;
    user_id: number;
    total_price: number;
    status: OrderStatus;
    shipping_address: string;
    phone: string;
    notes: string;
    created_at: Date;
    updated_at: Date;
    items: any[];
}
