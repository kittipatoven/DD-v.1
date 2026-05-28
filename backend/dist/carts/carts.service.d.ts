import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
export declare class CartsService {
    private cartRepository;
    private cartItemRepository;
    constructor(cartRepository: Repository<Cart>, cartItemRepository: Repository<CartItem>);
    createCart(createCartDto: CreateCartDto): Promise<Cart>;
    getUserCart(userId: number): Promise<Cart>;
    addToCart(userId: number, addToCartDto: AddToCartDto): Promise<CartItem>;
    updateCartItem(cartItemId: number, updateDto: AddToCartDto): Promise<CartItem>;
    removeCartItem(cartItemId: number): Promise<void>;
    clearCart(userId: number): Promise<void>;
    getCartTotal(userId: number): Promise<number>;
}
