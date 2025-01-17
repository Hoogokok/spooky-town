import { Controller, Get, Query, Param, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MovieQueryDto } from './dto/movie-query.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { MovieDetailResponseDto } from './dto/movie-detail-response.dto';
import { ExpiringMovieResponseDto } from './dto/expiring-movie-response.dto';
import { ExpiringMovieDetailResponseDto } from './dto/expiring-movie-detail-response.dto';
import { Failure } from 'src/common/result';
import { StreamingPageResponseDto } from './dto/streaming-page-response.dto';
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('streaming')
  async getStreamingMovies(@Query() query: MovieQueryDto): Promise<StreamingPageResponseDto> {
    return this.moviesService.getStreamingMovies(query);
  }

  @Get('streaming/:id')
  async getStreamingMovieDetail(@Param('id', ParseIntPipe) id: number): Promise<MovieDetailResponseDto> {
    const result = await this.moviesService.getStreamingMovieDetail(id);
    if (result.success) {
      return result.data;
    } else {
      throw new NotFoundException((result as Failure<string>).error);
    }
  }

  @Get('provider/:providerId')
  async getProviderMovies(@Param('providerId', ParseIntPipe) providerId: number): Promise<MovieResponseDto[]> {
    return this.moviesService.getProviderMovies(providerId);
  }

  @Get('expiring-horror')
  async getExpiringHorrorMovies(): Promise<ExpiringMovieResponseDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.moviesService.getExpiringHorrorMovies(today);
  }

  @Get('expiring-horror/:id')
  async getExpiringHorrorMovieDetail(@Param('id', ParseIntPipe) id: number): Promise<ExpiringMovieDetailResponseDto> {
    const result = await this.moviesService.getExpiringHorrorMovieDetail(id);
    if (result.success) {
      return result.data;
    } else {
      throw new NotFoundException((result as Failure<string>).error);
    }
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
    const result = await this.moviesService.findTheatricalMovieDetail(id);
    if (result.success) {
      return result.data;
    } else {
      throw new NotFoundException((result as Failure<string>).error);
    }
  }

}