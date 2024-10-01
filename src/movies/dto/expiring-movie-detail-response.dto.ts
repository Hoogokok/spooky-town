import { ReviewDto } from "./movie-detail-response.dto";

export class ExpiringMovieDetailResponseDto {
    id: number;
    title: string;
    posterPath: string;
    expiringDate: string;
    overview: string;
    voteAverage: number;
    voteCount: number;
    providers: string[];
    theMovieDbId: number;
    reviews: ReviewDto[];
  }