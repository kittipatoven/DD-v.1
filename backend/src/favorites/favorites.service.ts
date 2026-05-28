import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
  ) {}

  async addFavorite(userId: number, productId: number): Promise<Favorite> {
    const existing = await this.favoritesRepository.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existing) {
      return existing;
    }

    const favorite = this.favoritesRepository.create({
      user_id: userId,
      product_id: productId,
    });

    return this.favoritesRepository.save(favorite);
  }

  async removeFavorite(userId: number, productId: number): Promise<void> {
    const favorite = await this.favoritesRepository.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    await this.favoritesRepository.remove(favorite);
  }

  async getUserFavorites(userId: number): Promise<Favorite[]> {
    return this.favoritesRepository.find({
      where: { user_id: userId },
      relations: ['product', 'product.images', 'product.category'],
      order: { created_at: 'DESC' },
    });
  }

  async checkFavorite(userId: number, productId: number): Promise<boolean> {
    const favorite = await this.favoritesRepository.findOne({
      where: { user_id: userId, product_id: productId },
    });
    return !!favorite;
  }
}
