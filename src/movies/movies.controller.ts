import { Controller, Get, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MovieQueryDto } from './dto/movie-query.dto';
import { MovieResponseDto } from './dto/movie-response.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('streaming')
  async getStreamingMovies(@Query() query: MovieQueryDto): Promise<MovieResponseDto[]> {
    return this.moviesService.getStreamingMovies(query);
  }
}
