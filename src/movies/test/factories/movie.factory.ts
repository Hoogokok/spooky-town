import { Movie } from '../../entities/movie.entity';
import { MovieProvider } from '../../entities/movie-provider.entity';

export function createTestMovie(overrides: Partial<Movie> = {}): Movie {
  return {
    title: '테스트 영화',
    poster_path: '/path/to/poster.jpg',
    release_date: '2023-01-01',
    isTheatricalRelease: false,
    theMovieDbId: 12345,
    overview: '테스트 개요',
    vote_average: 8.5,
    vote_count: 1000,
    movieProviders: [],
    reviews: [],
    ...overrides
  } as Movie;
}

export function createTestMovieProvider(overrides: Partial<MovieProvider> = {}): MovieProvider {
  const movie = overrides.movie || createTestMovie();
  return {
    theProviderId: 1,
    movie: movie,
    ...overrides
  } as MovieProvider;
}
