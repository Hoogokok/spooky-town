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
    reviews: ReviewDto[];
}

export class ReviewDto {
    id: number;
    content: string;
    createdAt: string; // ISO 8601 형식의 문자열
}