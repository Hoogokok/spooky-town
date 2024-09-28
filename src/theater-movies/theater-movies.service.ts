import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { Theater } from './entities/theater.entity';
import { MovieTheater } from './entities/movie-theater.entity';
import { MovieResponseDto } from './dto/movie-response.dto';

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
}
