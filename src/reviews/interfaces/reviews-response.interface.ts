import { ReviewResponseDto } from '../dto/review-response.dto';

export interface ReviewsResponse {
    reviews: ReviewResponseDto[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
} 