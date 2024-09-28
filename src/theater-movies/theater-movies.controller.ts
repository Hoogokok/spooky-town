import { Controller, Get, Param } from '@nestjs/common';
import { TheaterMoviesService } from './theater-movies.service';

@Controller('movies/theater')
export class TheaterMoviesController {
  constructor(private readonly theaterMoviesService: TheaterMoviesService) {}


@Get('released')
async getReleasedMovies() {
  return this.theaterMoviesService.findReleasedMovies();
}

}
