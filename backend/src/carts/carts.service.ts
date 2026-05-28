import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  // สร้าง cart ใหม่
  async createCart(createCartDto: CreateCartDto): Promise<Cart> {
    const cart = this.cartRepository.create(createCartDto);
    return await this.cartRepository.save(cart);
  }

  // ดึง cart ของ user
  async getUserCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = await this.createCart({ user_id: userId });
    }

    return cart;
  }

  // เพิ่มสินค้าลงใน cart
  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<CartItem> {
    const cart = await this.getUserCart(userId);

    // เช็คว่ามีสินค้านี้ใน cart อยู่แล้วหรือไม่
    let cartItem = await this.cartItemRepository.findOne({
      where: { cart_id: cart.id, product_id: addToCartDto.product_id },
      relations: ['product'],
    });

    if (cartItem) {
      // ถ้ามีแล้วให้เพิ่ม quantity
      cartItem.quantity += addToCartDto.quantity;
      return await this.cartItemRepository.save(cartItem);
    }

    // ถ้ายังไม่มีให้สร้างใหม่
    cartItem = this.cartItemRepository.create({
      cart_id: cart.id,
      ...addToCartDto,
    });
    return await this.cartItemRepository.save(cartItem);
  }

  // อัปเดต quantity ของ cart item
  async updateCartItem(cartItemId: number, updateDto: AddToCartDto): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({ where: { id: cartItemId } });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    cartItem.quantity = updateDto.quantity;
    return await this.cartItemRepository.save(cartItem);
  }

  // ลบ cart item
  async removeCartItem(cartItemId: number): Promise<void> {
    const cartItem = await this.cartItemRepository.findOne({ where: { id: cartItemId } });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartItemRepository.remove(cartItem);
  }

  // ล้าง cart
  async clearCart(userId: number): Promise<void> {
    const cart = await this.getUserCart(userId);
    await this.cartItemRepository.delete({ cart_id: cart.id });
  }

  // คำนวณราคารวมใน cart
  async getCartTotal(userId: number): Promise<number> {
    const cart = await this.getUserCart(userId);
    let total = 0;
    for (const item of cart.items) {
      if (item.product) {
        total += Number(item.product.price) * item.quantity;
      }
    }
    return total;
  }
}
