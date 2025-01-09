import { Controller, Post, Get, Body, Query, UseGuards, Req, Param } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @UseGuards(SupabaseGuard)
    async createReview(
        @Req() req,
        @Body() createReviewDto: CreateReviewDto
    ) {
        return this.reviewsService.createReview(
            req.user.id,
            req.user.metadata.name,
            createReviewDto
        );
    }

    @Get('movie/:movieId')
    async getMovieReviews(
        @Param('movieId') movieId: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.reviewsService.getMovieReviews(movieId, {
            page,
            limit
        });
    }
} 