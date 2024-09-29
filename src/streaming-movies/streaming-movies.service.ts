import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StreamingMovie } from './entities/streaming-movie.entity'
import { MovieProvider } from './entities/movie-provider.entity'
import { StreamingPageResponseDto } from './dto/streaming-page-response.dto';

@Injectable()
export class StreamingMoviesService {
  constructor(
    @InjectRepository(StreamingMovie)
    private streamingMovieRepository: Repository<StreamingMovie>,
    @InjectRepository(MovieProvider)
    private movieProviderRepository: Repository<MovieProvider>,
  ) {}

  async getStreamingMovies(query: string, page: number): Promise<StreamingPageResponseDto[]> {
    const providerId = query === "netflix" ? 1 : query === "disney" ? 2 : 0;
    const itemsPerPage = 6;
    const skip = (page - 1) * itemsPerPage;

    const queryBuilder = this.streamingMovieRepository
      .createQueryBuilder('movie')
      .innerJoinAndSelect('movie.movieProviders', 'movieProvider')
      .orderBy('movie.release_date', 'DESC')
      .take(itemsPerPage)
      .skip(skip);

    if (providerId !== 0) {
      queryBuilder.where('movieProvider.theProviderId = :providerId', { providerId });
    }

    const movies = await queryBuilder.getMany();

    return movies.map(movie => ({
      title: movie.title,
      poster_path: movie.poster_path,
      id: movie.id.toString(),
      release_date: movie.release_date,
      providers: movie.movieProviders[0].theProviderId === 1 ? "넷플릭스" : "디즈니플러스"
    }));
  }

async getTotalPages(query: string): Promise<number> {
    const providerId = query === "netflix" ? 1 : query === "disney" ? 2 : 0;
    const itemsPerPage = 6;
  
    const queryBuilder = this.movieProviderRepository
    .createQueryBuilder('movieProvider');
  
    if (providerId !== 0) {
      queryBuilder.where('movieProvider.theProviderId = :providerId', { providerId });
    }
  
    const totalCount = await queryBuilder.getCount();
    return Math.ceil(totalCount / itemsPerPage);
  }
}