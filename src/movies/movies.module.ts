import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { MovieProvider } from './entities/movie-provider.entity';
import { MovieTheater } from './entities/movie-theater.entity';
import { Theater } from './entities/theater.entity';
import { NetflixHorrorExpiring } from './entities/netflix-horror-expiring.entity';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { Review } from './entities/review.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Movie, MovieProvider, MovieTheater, Theater, NetflixHorrorExpiring, Review])],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService]
})
export class MoviesModule {}
