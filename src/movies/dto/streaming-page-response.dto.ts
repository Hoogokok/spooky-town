import { MovieResponseDto } from "./movie-response.dto";

export class StreamingPageResponseDto {
  movies: MovieResponseDto[];
  totalPages: number;
  currentPage: number;
}
