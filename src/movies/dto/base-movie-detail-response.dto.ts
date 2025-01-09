export class BaseMovieDetailResponseDto {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  voteAverage: number;
  voteCount: number;
  watchProviders: string[];
  theMovieDbId: number;
}
