import { Module } from '@nestjs/common';
import { TheaterMoviesController } from './theater-movies.controller';
import { TheaterMoviesService } from './theater-movies.service';

@Module({
  controllers: [TheaterMoviesController],
  providers: [TheaterMoviesService]
})
export class TheaterMoviesModule {}
