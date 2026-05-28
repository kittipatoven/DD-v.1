import { CartItem } from './cart-item.entity';
export declare class Cart {
    id: number;
    user_id: number;
    user: any;
    created_at: Date;
    items: CartItem[];
}
