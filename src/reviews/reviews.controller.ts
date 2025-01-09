import { Controller, Post, Get, Body, Query, UseGuards, Req, Param, Patch, Put, Delete } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { SupabaseGuard } from '../auth/supabase.guard';
import { ReviewsService } from './reviews.service';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post('movie/:movieId')
    @UseGuards(SupabaseGuard)
    async createReview(
        @Param('movieId') movieId: number,
        @Req() req,
        @Body() createReviewDto: CreateReviewDto
    ) {
        return this.reviewsService.createReview(
            req.user.id,
            req.user.metadata.name,
            movieId,
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

    @Put('movie/:reviewId')
    @UseGuards(SupabaseGuard)
    async updateReview(
        @Param('reviewId') reviewId: number,
        @Req() req,
        @Body() updateReviewDto: UpdateReviewDto
    ) {
        return this.reviewsService.updateReview(
            reviewId,
            req.user.id,
            updateReviewDto
        );
    }

    @Delete('movie/:reviewId')
    @UseGuards(SupabaseGuard)
    async deleteReview(
        @Param('reviewId') reviewId: number,
        @Req() req
    ) {
        return this.reviewsService.deleteReview(reviewId, req.user.id);
    }
} 