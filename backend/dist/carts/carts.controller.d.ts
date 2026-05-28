import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
export declare class CartsController {
    private readonly cartsService;
    constructor(cartsService: CartsService);
    getUserCart(userId: string): Promise<import("./entities/cart.entity").Cart>;
    addToCart(userId: string, addToCartDto: AddToCartDto): Promise<import("./entities/cart-item.entity").CartItem>;
    updateCartItem(itemId: string, updateDto: AddToCartDto): Promise<import("./entities/cart-item.entity").CartItem>;
    removeCartItem(itemId: string): Promise<{
        message: string;
    }>;
    clearCart(userId: string): Promise<{
        message: string;
    }>;
    getCartTotal(userId: string): Promise<{
        total: number;
    }>;
}
