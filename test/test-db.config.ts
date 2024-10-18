import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Movie } from '../src/movies/entities/movie.entity';
import { MovieProvider } from '../src/movies/entities/movie-provider.entity';
import { NetflixHorrorExpiring } from '../src/movies/entities/netflix-horror-expiring.entity';

export const testDbConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  entities: [Movie, MovieProvider, NetflixHorrorExpiring],
  synchronize: true,
  logging: false,
};

