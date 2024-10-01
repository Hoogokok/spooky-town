import { BaseMovieDetailResponseDto } from "./base-movie-detail-response.dto";

export class ExpiringMovieDetailResponseDto extends BaseMovieDetailResponseDto {
    expiringDate: string;
}