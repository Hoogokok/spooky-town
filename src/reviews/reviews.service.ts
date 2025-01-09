import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import { ReviewResponseDto } from './dto/review-response.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewsRepository: Repository<Review>
    ) { }

    async createReview(userId: string, userName: string, movieId: number, createReviewDto: CreateReviewDto) {
        try {
            const review = this.reviewsRepository.create({
                userId,
                userName,
                movieId,
                content: createReviewDto.content,
                rating: createReviewDto.rating
            });

            await this.reviewsRepository.save(review);

            return {
                message: '리뷰가 성공적으로 작성되었습니다.'
            };
        } catch (error) {
            if (error.code === '23505') { // 유니크 제약조건 위반
                throw new BadRequestException('이미 이 영화에 대한 리뷰를 작성했습니다.');
            }
            throw new BadRequestException('리뷰 작성에 실패했습니다.');
        }
    }

    async getMovieReviews(movieId: number, options: { page: number; limit: number }) {
        const [reviews, total] = await this.reviewsRepository.findAndCount({
            where: { movieId },
            order: { createdAt: 'DESC' },
            skip: (options.page - 1) * options.limit,
            take: options.limit
        });

        const reviewResponses = reviews.map(review => new ReviewResponseDto({
            id: review.id,
            movieId: review.movieId,
            userId: review.userId,
            userName: review.userName,
            rating: review.rating,
            content: review.content,
            createdAt: review.createdAt
        }));

        return {
            reviews: reviewResponses,
            totalCount: total,
            currentPage: options.page,
            totalPages: Math.ceil(total / options.limit)
        };
    }
} 