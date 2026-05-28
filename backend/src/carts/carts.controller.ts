import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  // ดึง cart ของ user
  @Get('user/:userId')
  async getUserCart(@Param('userId') userId: string) {
    return await this.cartsService.getUserCart(+userId);
  }

  // เพิ่มสินค้าลงใน cart
  @Post('user/:userId/add')
  async addToCart(
    @Param('userId') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return await this.cartsService.addToCart(+userId, addToCartDto);
  }

  // อัปเดต quantity ของ cart item
  @Put('items/:itemId')
  async updateCartItem(
    @Param('itemId') itemId: string,
    @Body() updateDto: AddToCartDto,
  ) {
    return await this.cartsService.updateCartItem(+itemId, updateDto);
  }

  // ลบ cart item
  @Delete('items/:itemId')
  async removeCartItem(@Param('itemId') itemId: string) {
    await this.cartsService.removeCartItem(+itemId);
    return { message: 'Cart item removed successfully' };
  }

  // ล้าง cart
  @Delete('user/:userId/clear')
  async clearCart(@Param('userId') userId: string) {
    await this.cartsService.clearCart(+userId);
    return { message: 'Cart cleared successfully' };
  }

  // คำนวณราคารวมใน cart
  @Get('user/:userId/total')
  async getCartTotal(@Param('userId') userId: string) {
    const total = await this.cartsService.getCartTotal(+userId);
    return { total };
  }
}
