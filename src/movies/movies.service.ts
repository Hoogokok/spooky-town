import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpiringMovieDetailResponseDto } from './dto/expiring-movie-detail-response.dto';
import { ExpiringMovieResponseDto } from './dto/expiring-movie-response.dto';
import { MovieDetailResponseDto } from './dto/movie-detail-response.dto';
import { MovieQueryDto } from './dto/movie-query.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { MovieProvider } from './entities/movie-provider.entity';
import { Result, success, failure } from '../common/result';
import { MovieRepository } from './repositories/movie.repository';
import { NetflixHorrorExpiringRepository } from './repositories/netflix-horror-expiring.repository';
import { ReviewRawData } from './types/review-raw-data.interface';
import { StreamingPageResponseDto } from './dto/streaming-page-response.dto';

@Injectable()
export class MoviesService {
  private readonly ITEMS_PER_PAGE = 24;

  constructor(
    private movieRepository: MovieRepository,
    @InjectRepository(MovieProvider)
    private movieProviderRepository: Repository<MovieProvider>,
    private netflixHorrorExpiringRepository: NetflixHorrorExpiringRepository
  ) { }

  async getStreamingMovies(query: MovieQueryDto): Promise<StreamingPageResponseDto> {
    const { provider, page = 1, search } = query;
    const skip = (page - 1) * this.ITEMS_PER_PAGE;

    const [movies, totalCount] = await Promise.all([
      this.movieRepository.getStreamingMovies(provider, this.ITEMS_PER_PAGE, skip, search),
      this.movieRepository.getTotalStreamingMoviesCount(provider, search)
    ]);

    return {
      movies: movies.map(movie => ({
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        releaseDate: movie.release_date,
        providers: this.getProviderName(movie.movieProviders[0].theProviderId)
      })),
      totalPages: Math.ceil(totalCount / this.ITEMS_PER_PAGE),
      currentPage: page
    };
  }

  private getProviderName(providerId: number): string {
    switch (providerId.toString()) {
      case "1":
        return "넷플릭스";
      case "2":
        return "디즈니플러스";
      case "3":
        return "웨이브";
      case "4":
        return "네이버";
      case "5":
        return "구글 플레이";
      default:
        return "알 수 없음";
    }
  }

  async getStreamingMovieDetail(id: number): Promise<Result<MovieDetailResponseDto, string>> {
    const result = await this.movieRepository.findMovieWithProvidersAndReviews(id);

    if (!result) {
      return failure(`스트리밍 영화 ID ${id}를 찾을 수 없습니다.`);
    }

    const { movie } = result;

    const response: MovieDetailResponseDto = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      overview: movie.overview,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      watchProviders: movie.movieProviders.map(mp =>
        this.getProviderName(mp.theProviderId)
      ),
      theMovieDbId: movie.theMovieDbId,
    };

    return success(response);
  }

  async getProviderMovies(providerId: number): Promise<MovieResponseDto[]> {
    const movies = await this.movieRepository.findMoviesByProviderId(providerId);

    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      providers: this.getProviderName(providerId)
    }));
  }

  async getExpiringHorrorMovies(today: Date): Promise<ExpiringMovieResponseDto[]> {

    const expiringMovies = await this.netflixHorrorExpiringRepository.findExpiringMovies(today);

    if (expiringMovies.length === 0) {
      return [];
    }

    const movieIds = expiringMovies.map(em => em.theMovieDbId);
    const movies = await this.movieRepository.findMoviesByTheMovieDbIds(movieIds);

    return movies.map(movie => {
      const expiringMovie = expiringMovies.find(em => em.theMovieDbId === movie.theMovieDbId);
      return {
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        expiringDate: expiringMovie.expiredDate instanceof Date
          ? expiringMovie.expiredDate.toISOString().split('T')[0]
          : expiringMovie.expiredDate,
        providers: "넷플릭스"
      };
    });
  }

  async getExpiringHorrorMovieDetail(id: number): Promise<Result<ExpiringMovieDetailResponseDto, string>> {
    const result = await this.movieRepository.findMovieWithProvidersAndReviews(id);

    if (!result) {
      return failure(`영화 ID ${id}를 찾을 수 없습니다.`);
    }

    const { movie, reviewsRaw } = result;
    const expiringMovie = await this.netflixHorrorExpiringRepository.findByTheMovieDbId(movie.theMovieDbId);

    if (!expiringMovie) {
      return failure(`만료 예정인 영화 ID ${id}를 찾을 수 없습니다.`);
    }

    const response: ExpiringMovieDetailResponseDto = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      expiringDate: expiringMovie.expiredDate instanceof Date
        ? expiringMovie.expiredDate.toISOString().split('T')[0]
        : expiringMovie.expiredDate,
      overview: movie.overview,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      watchProviders: movie.movieProviders.map(mp =>
        mp.theProviderId.toString() === "1" ? "넷플릭스" : "디즈니플러스"
      ),
      theMovieDbId: movie.theMovieDbId,
    };

    return success(response);
  }

  async findUpcomingMovies(today: string = new Date().toISOString()): Promise<MovieResponseDto[]> {
    const movies = await this.movieRepository.findUpcomingMovies(today);
    return movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      releaseDate: movie.release_date,
      posterPath: movie.poster_path,
    }));
  }

  async findReleasedMovies(today: string = new Date().toISOString()): Promise<MovieResponseDto[]> {
    const movies = await this.movieRepository.findReleasedMovies(today);
    const filteredMovies = movies.filter(movie => movie.movieTheaters && movie.movieTheaters.length > 0);
    return filteredMovies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      releaseDate: movie.release_date,
      posterPath: movie.poster_path,
    }));
  }

  async findTheatricalMovieDetail(id: number): Promise<Result<MovieDetailResponseDto, string>> {
    const result = await this.movieRepository.findTheatricalMovieById(id);

    if (!result) {
      return failure(`극장 개봉 영화 ID ${id}를 찾을 수 없습니다.`);
    }

    const { movie, reviewsRaw, totalReviews } = result;

    const response: MovieDetailResponseDto = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      overview: movie.overview,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      watchProviders: movie.movieTheaters.map(mt => mt.theater.name),
      theMovieDbId: movie.theMovieDbId,
    };

    return success(response);
  }

  async findMovieDetail(id: number): Promise<Result<MovieDetailResponseDto, string>> {
    const result = await this.movieRepository.findMovieWithProvidersAndReviews(id);

    if (!result) {
      return failure(`영화 ID ${id}를 찾을 수 없습니다.`);
    }

    const { movie, reviewsRaw, totalReviews } = result;

    const response: MovieDetailResponseDto = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      overview: movie.overview,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      watchProviders: movie.movieProviders.map(mp =>
        this.getProviderName(mp.theProviderId)
      ),
      theMovieDbId: movie.theMovieDbId,
    };

    return success(response);
  }
}
