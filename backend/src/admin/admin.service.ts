import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductView } from './entities/product-view.entity';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ProductView)
    private productViewsRepository: Repository<ProductView>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.usersService.findAll(1, 1000);
    const totalProducts = await this.productsService.findAll(1, 1000);
    const totalViews = await this.productViewsRepository.count();

    return {
      totalUsers: totalUsers.total,
      totalProducts: totalProducts.total,
      totalViews,
    };
  }

  async trackProductView(productId: number, userId: number): Promise<ProductView> {
    const view = this.productViewsRepository.create({
      product_id: productId,
      user_id: userId,
    });

    return this.productViewsRepository.save(view);
  }

  async getProductViews(productId: number): Promise<ProductView[]> {
    return this.productViewsRepository.find({
      where: { product_id: productId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 100,
    });
  }

  async getRecentActivity() {
    const recentViews = await this.productViewsRepository.find({
      relations: ['product', 'user'],
      order: { created_at: 'DESC' },
      take: 10,
    });

    return {
      recentViews,
    };
  }
}
