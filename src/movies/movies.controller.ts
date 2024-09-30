import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MovieQueryDto } from './dto/movie-query.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { MovieDetailResponseDto } from './dto/movie-detail-response.dto';
import { ExpiringMovieResponseDto } from './dto/expiring-movie-response.dto';
import { ExpiringMovieDetailResponseDto } from './dto/expiring-movie-detail-response.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('streaming')
  async getStreamingMovies(@Query() query: MovieQueryDto): Promise<MovieResponseDto[]> {
    return this.moviesService.getStreamingMovies(query);
  }

  @Get('streaming/pages')
  async getTotalStreamingPages(@Query() query: MovieQueryDto): Promise<{ totalPages: number }> {
    const totalPages = await this.moviesService.getTotalStreamingPages(query);
    return { totalPages };
  }

  @Get('streaming/:id')
  async getStreamingMovieDetail(@Param('id', ParseIntPipe) id: number): Promise<MovieDetailResponseDto> {
    return this.moviesService.getStreamingMovieDetail(id);
  }

  @Get('provider/:providerId')
  async getProviderMovies(@Param('providerId', ParseIntPipe) providerId: number): Promise<MovieResponseDto[]> {
    return this.moviesService.getProviderMovies(providerId);
  }

  @Get('expiring-horror')
  async getExpiringHorrorMovies(): Promise<ExpiringMovieResponseDto[]> {
    return this.moviesService.getExpiringHorrorMovies();
  }

  @Get('expiring-horror/:id')
  async getExpiringHorrorMovieDetail(@Param('id', ParseIntPipe) id: number): Promise<ExpiringMovieDetailResponseDto> {
    return this.moviesService.getExpiringHorrorMovieDetail(id);
  }

  @Get('theater/upcoming')
  async getUpcomingMovies(): Promise<MovieResponseDto[]> {
    return this.moviesService.findUpcomingMovies();
  }

  @Get('theater/released')
  async getReleasedMovies(): Promise<MovieResponseDto[]> {
    return this.moviesService.findReleasedMovies();
  }

  @Get('theater/:id')
  async getTheaterMovieDetail(@Param('id', ParseIntPipe) id: number): Promise<MovieDetailResponseDto> {
    return this.moviesService.findTheatricalMovieDetail(id);
  }
}