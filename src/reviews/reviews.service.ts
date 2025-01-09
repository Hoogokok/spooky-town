import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private reviewsRepository: Repository<Review>
    ) { }

    async createReview(userId: string, userName: string, createReviewDto: CreateReviewDto) {
        try {
            const review = this.reviewsRepository.create({
                userId,
                userName,
                movieId: createReviewDto.movieId,
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
} 