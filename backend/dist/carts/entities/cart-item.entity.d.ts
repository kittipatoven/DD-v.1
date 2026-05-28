import { Cart } from './cart.entity';
export declare class CartItem {
    id: number;
    cart_id: number;
    cart: Cart;
    product_id: number;
    product: any;
    quantity: number;
}
