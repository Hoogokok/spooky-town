export class MovieDetailResponseDto {
    id: number;
    title: string;
    overview: string;
    releaseDate: string;
    posterPath: string;
    voteAverage: number;
    voteCount: number;
    providers?: string[];
    theMovieDbId: number;
  }