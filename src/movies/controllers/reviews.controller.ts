import { Controller, Get, Query, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { MoviesService } from '../movies.service';
import { ReviewPageResponseDto } from '../dto/review-page-response.dto';
import { Failure } from '../../common/result';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly moviesService: MoviesService) { }

    @Get()
    async getReviews(
        @Query('category') category: string,
        @Query('movieId', ParseIntPipe) movieId: number,
        @Query('page', ParseIntPipe) page: number = 1
    ): Promise<ReviewPageResponseDto> {
        const result = await this.moviesService.getMovieReviews(category, movieId, { page });
        if (result.success) {
            return result.data;
        }
        throw new NotFoundException((result as Failure<string>).error);
    }
} 