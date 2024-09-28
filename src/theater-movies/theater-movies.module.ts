import { Module } from '@nestjs/common';
import { TheaterMoviesController } from './theater-movies.controller';

@Module({
  controllers: [TheaterMoviesController]
})
export class TheaterMoviesModule {}
