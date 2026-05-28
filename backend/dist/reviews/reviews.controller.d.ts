import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findAll(productId?: string): Promise<import("./entities/review.entity").Review[]>;
    getProductReviews(productId: string): Promise<import("./entities/review.entity").Review[]>;
    getProductAverageRating(productId: string): Promise<number>;
    create(productId: string, createReviewDto: CreateReviewDto, req: any): Promise<import("./entities/review.entity").Review>;
    remove(id: string, req: any): Promise<void>;
}
