import { ReviewDto } from './review.dto';

export class ReviewPageResponseDto {
    reviews: ReviewDto[];
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
}
