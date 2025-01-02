import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { MovieProvider } from './entities/movie-provider.entity';
import { MovieTheater } from './entities/movie-theater.entity';
import { Theater } from './entities/theater.entity';
import { NetflixHorrorExpiring } from './entities/netflix-horror-expiring.entity';
import { Review } from './entities/review.entity';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { MovieRepository } from './repositories/movie.repository';
import { NetflixHorrorExpiringRepository } from './repositories/netflix-horror-expiring.repository';
import { ReviewsController } from './controllers/reviews.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, MovieProvider, MovieTheater, Theater, NetflixHorrorExpiring, Review])],
  controllers: [MoviesController, ReviewsController],
  providers: [MoviesService, MovieRepository, NetflixHorrorExpiringRepository],
  exports: [MoviesService]
})
export class MoviesModule {}
