import { OrderStatus } from '../entities/order.entity';
export declare class OrderItemDto {
    product_id: number;
    quantity: number;
    price: number;
}
export declare class CreateOrderDto {
    user_id: number;
    total_price: number;
    status?: OrderStatus;
    shipping_address?: string;
    phone?: string;
    notes?: string;
    items: OrderItemDto[];
}
