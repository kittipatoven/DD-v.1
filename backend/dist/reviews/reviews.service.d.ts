import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsService {
    private reviewsRepository;
    constructor(reviewsRepository: Repository<Review>);
    create(userId: number, productId: number, createReviewDto: CreateReviewDto): Promise<Review>;
    findAll(productId?: number): Promise<Review[]>;
    findOne(id: number): Promise<Review>;
    remove(id: number, userId: number): Promise<void>;
    getProductAverageRating(productId: number): Promise<number>;
}
