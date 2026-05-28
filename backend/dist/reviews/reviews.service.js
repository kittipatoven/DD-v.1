"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./entities/review.entity");
let ReviewsService = class ReviewsService {
    constructor(reviewsRepository) {
        this.reviewsRepository = reviewsRepository;
    }
    async create(userId, productId, createReviewDto) {
        if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        }
        const existing = await this.reviewsRepository.findOne({
            where: { user_id: userId, product_id: productId },
        });
        if (existing) {
            throw new common_1.BadRequestException('You have already reviewed this product');
        }
        const review = this.reviewsRepository.create({
            user_id: userId,
            product_id: productId,
            ...createReviewDto,
        });
        return this.reviewsRepository.save(review);
    }
    async findAll(productId) {
        const query = this.reviewsRepository.createQueryBuilder('review')
            .leftJoinAndSelect('review.user', 'user')
            .leftJoinAndSelect('review.product', 'product');
        if (productId) {
            query.andWhere('review.product_id = :productId', { productId });
        }
        return query.orderBy('review.created_at', 'DESC').getMany();
    }
    async findOne(id) {
        const review = await this.reviewsRepository.findOne({
            where: { id },
            relations: ['user', 'product'],
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    async remove(id, userId) {
        const review = await this.findOne(id);
        if (review.user_id !== userId) {
            throw new common_1.BadRequestException('You can only delete your own reviews');
        }
        await this.reviewsRepository.remove(review);
    }
    async getProductAverageRating(productId) {
        const reviews = await this.reviewsRepository.find({
            where: { product_id: productId },
        });
        if (reviews.length === 0) {
            return 0;
        }
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / reviews.length;
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map