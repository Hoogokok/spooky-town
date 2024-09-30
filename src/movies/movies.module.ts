import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { MovieProvider } from './entities/movie-provider.entity';
import { MovieTheater } from './entities/movie-theater.entity';
import { Theater } from './entities/theater.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, MovieProvider, MovieTheater, Theater])],
  controllers: [],
  providers: []
})
export class MoviesModule {}
