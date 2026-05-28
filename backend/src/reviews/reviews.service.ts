import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
  ) {}

  async create(userId: number, productId: number, createReviewDto: CreateReviewDto): Promise<Review> {
    // Validate rating range
    if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if user already reviewed this product
    const existing = await this.reviewsRepository.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (existing) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = this.reviewsRepository.create({
      user_id: userId,
      product_id: productId,
      ...createReviewDto,
    });

    return this.reviewsRepository.save(review);
  }

  async findAll(productId?: number): Promise<Review[]> {
    const query = this.reviewsRepository.createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product');

    if (productId) {
      query.andWhere('review.product_id = :productId', { productId });
    }

    return query.orderBy('review.created_at', 'DESC').getMany();
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async remove(id: number, userId: number): Promise<void> {
    const review = await this.findOne(id);

    if (review.user_id !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    await this.reviewsRepository.remove(review);
  }

  async getProductAverageRating(productId: number): Promise<number> {
    const reviews = await this.reviewsRepository.find({
      where: { product_id: productId },
    });

    if (reviews.length === 0) {
      return 0;
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }
}
