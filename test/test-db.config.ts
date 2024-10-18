import { DataSourceOptions } from 'typeorm';
import { Movie } from '../src/movies/entities/movie.entity';
import { MovieProvider } from '../src/movies/entities/movie-provider.entity';
import { NetflixHorrorExpiring } from '../src/movies/entities/netflix-horror-expiring.entity';
import { MovieTheater } from '../src/movies/entities/movie-theater.entity';
import { Theater } from '../src/movies/entities/theater.entity';
import { Review } from '../src/movies/entities/review.entity';

export const testDbConfig: DataSourceOptions = {
  type: 'better-sqlite3',
  database: ':memory:',
  entities: [Movie, MovieProvider, NetflixHorrorExpiring, MovieTheater, Theater, Review],
  synchronize: true,
  logging: false,
  extra: {
    foreign_keys: true,
    dateStrings: true,
  },
};
