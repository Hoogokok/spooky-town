export class MovieResponseDto {
  id: number;
  title: string;
  releaseDate: string;
  posterPath: string;
}

export class MovieDetailResponseDto {
  id: number;
  title: string;
  releaseDate: string;
  posterPath: string;
  overview: string;
  voteAverage: number;
  voteCount: number;
}
