import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { MovieResponseDto } from './dto/movie-response.dto';
import { MovieTheater } from './entities/movie-theater.entity';
import { Movie } from './entities/movie.entity';
import { Theater } from './entities/theater.entity';

@Injectable()
export class TheaterMoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Theater)
    private readonly theaterRepository: Repository<Theater>,
    @InjectRepository(MovieTheater)
    private readonly movieTheaterRepository: Repository<MovieTheater>,
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
}
