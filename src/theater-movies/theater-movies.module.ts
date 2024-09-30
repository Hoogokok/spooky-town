import { Module } from '@nestjs/common';
import { TheaterMoviesController } from './theater-movies.controller';
import { TheaterMoviesService } from './theater-movies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TheaterMovie } from './entities/theater-movie.entity';
import { Theater } from './entities/theater.entity';
import { MovieTheater } from './entities/movie-theater.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TheaterMovie, Theater, MovieTheater])],
  controllers: [TheaterMoviesController],
  providers: [TheaterMoviesService]
})
export class TheaterMoviesModule {}
