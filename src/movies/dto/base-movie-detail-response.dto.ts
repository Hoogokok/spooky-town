import { ReviewDto } from "./review.dto";

export class BaseMovieDetailResponseDto {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  voteAverage: number;
  voteCount: number;
  providers: string[];
  theMovieDbId: number;
  recentReviews: ReviewDto[];
  totalReviews: number;
}
