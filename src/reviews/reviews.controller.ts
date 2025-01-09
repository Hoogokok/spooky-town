import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { SupabaseGuard } from '../auth/supabase.guard';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @UseGuards(SupabaseGuard)
    async createReview(
        @Body() createReviewDto: CreateReviewDto
    ) {
        return this.reviewsService.createReview(createReviewDto);
    }
} 