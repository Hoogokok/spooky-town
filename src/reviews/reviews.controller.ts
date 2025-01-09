import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
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
} 