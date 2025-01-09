import { ReviewDto } from "./review.dto";

export class BaseMovieDetailResponseDto {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  voteAverage: number;
  voteCount: number;
  watchProviders: string[];
  theMovieDbId: number;
  reviews: ReviewDto[];
  totalReviews: number;
}
