import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { MovieResponseDto } from './dto/movie-response.dto';
import { MovieQueryDto } from './dto/movie-query.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>
  ) {}

  async getStreamingMovies(query: MovieQueryDto): Promise<MovieResponseDto[]> {
    const { provider, page = 1 } = query;
    const itemsPerPage = 6;
    const skip = (page - 1) * itemsPerPage;

    const queryBuilder = this.movieRepository
      .createQueryBuilder('movie')
      .innerJoinAndSelect('movie.movieProviders', 'movieProvider')
      .where('movie.isTheatricalRelease = :isTheatrical', { isTheatrical: false })
      .orderBy('movie.release_date', 'DESC')
      .take(itemsPerPage)
      .skip(skip);

    if (provider) {
      const providerId = provider === "netflix" ? 1 : provider === "disney" ? 2 : 0;
      if (providerId !== 0) {
        queryBuilder.andWhere('movieProvider.theProviderId = :providerId', { providerId });
      }
    }

    const movies = await queryBuilder.getMany();

    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      providers: movie.movieProviders[0].theProviderId === 1 ? "넷플릭스" : "디즈니플러스"
    }));
  }
}