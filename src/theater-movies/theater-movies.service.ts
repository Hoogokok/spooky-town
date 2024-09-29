import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { MovieDetailResponseDto, MovieResponseDto } from './dto/movie-response.dto';
import { Movie } from './entities/movie.entity';

@Injectable()
export class TheaterMoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>
  ) {} 

async findUpcomingMovies(today: string = new Date().toISOString())  : Promise<MovieResponseDto[]>{
     const movies = await this.movieRepository.find({
      where: { releaseDate: MoreThan(today) },
      relations: ['movieTheaters', 'movieTheaters.theater'],
      order: { releaseDate: 'ASC' },
    });
    return movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      releaseDate: movie.releaseDate,
      posterPath: movie.posterPath,
    }));
  }

  async findReleasedMovies(today: string = new Date().toISOString()): Promise<MovieResponseDto[]> {
    const movies = await this.movieRepository.find({
      where: { releaseDate: LessThanOrEqual(today) },
      relations: ['movieTheaters', 'movieTheaters.theater'],
      order: { releaseDate: 'DESC' },
    });
    return movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      releaseDate: movie.releaseDate,
      posterPath: movie.posterPath,
    }));
  }

  async findMovieDetail(id: number): Promise<MovieDetailResponseDto> {
    const movie = await this.movieRepository.findOne({ where: { id }, relations: ['movieTheaters', 'movieTheaters.theater'] });
    if (!movie) {
      throw new NotFoundException('영화를 찾을 수 없습니다');
    }
    return {
      id: movie.id,
      title: movie.title,
      releaseDate: movie.releaseDate,
      posterPath: movie.posterPath,
      overview: movie.overview,
      voteAverage: movie.voteAverage,
      voteCount: movie.voteCount,
      providers: movie.movieTheaters.map((movieTheater) => movieTheater.theater.name),
      theMovieDbId: movie.theMovieDbId,
    };
  }
}
