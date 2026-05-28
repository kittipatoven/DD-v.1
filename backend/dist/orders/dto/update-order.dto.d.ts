import { OrderStatus } from '../entities/order.entity';
export declare class UpdateOrderDto {
    status?: OrderStatus;
    shipping_address?: string;
    phone?: string;
    notes?: string;
}
