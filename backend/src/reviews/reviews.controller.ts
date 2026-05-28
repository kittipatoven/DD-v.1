import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(@Param('productId') productId?: string) {
    return this.reviewsService.findAll(productId ? +productId : undefined);
  }

  @Get('product/:productId')
  getProductReviews(@Param('productId') productId: string) {
    return this.reviewsService.findAll(+productId);
  }

  @Get('product/:productId/average')
  getProductAverageRating(@Param('productId') productId: string) {
    return this.reviewsService.getProductAverageRating(+productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('product/:productId')
  create(@Param('productId') productId: string, @Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(req.user.id, +productId, createReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(+id, req.user.id);
  }
}
