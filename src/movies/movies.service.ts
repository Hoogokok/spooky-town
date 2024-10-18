import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { ExpiringMovieDetailResponseDto } from './dto/expiring-movie-detail-response.dto';
import { ExpiringMovieResponseDto } from './dto/expiring-movie-response.dto';
import { MovieDetailResponseDto } from './dto/movie-detail-response.dto';
import { MovieQueryDto } from './dto/movie-query.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { MovieProvider } from './entities/movie-provider.entity';
import { Movie } from './entities/movie.entity';
import { NetflixHorrorExpiring } from './entities/netflix-horror-expiring.entity';
import { Result, success, failure } from '../common/result';
import { MovieTheater } from './entities/movie-theater.entity';
import { Theater } from './entities/theater.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(MovieProvider)
    private movieProviderRepository: Repository<MovieProvider>,
    @InjectRepository(NetflixHorrorExpiring)
    private netflixHorrorExpiringRepository: Repository<NetflixHorrorExpiring>,
    @InjectRepository(MovieTheater)
    private movieTheaterRepository: Repository<MovieTheater>,
    @InjectRepository(Theater)
    private theaterRepository: Repository<Theater>
  ) {}

  async getStreamingMovies(query: MovieQueryDto): Promise<MovieResponseDto[]> {
    Logger.log(query);
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
      const providerId = provider === "netflix" ? 1 : provider === "disney" ? 2 : provider === "wavve" ? 3 : provider === "naver" ? 4 : provider === "googleplay" ? 5 : 0;
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
      providers: this.getProviderName(movie.movieProviders[0].theProviderId)
    }));
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

  async getTotalStreamingPages(query: MovieQueryDto): Promise<number> {
    const { provider } = query;
    const itemsPerPage = 6;
  
    const queryBuilder = this.movieProviderRepository
      .createQueryBuilder('movieProvider')
      .innerJoin('movieProvider.movie', 'movie')
      .where('movie.isTheatricalRelease = :isTheatrical', { isTheatrical: false });
  
    if (provider) {
      const providerId = provider === "netflix" ? 1 : provider === "disney" ? 2 : 0;
      if (providerId !== 0) {
        queryBuilder.andWhere('movieProvider.theProviderId = :providerId', { providerId });
      }
    }
  
    const totalCount = await queryBuilder.getCount();
    return Math.ceil(totalCount / itemsPerPage);
  }

  async getStreamingMovieDetail(id: number): Promise<Result<MovieDetailResponseDto, string>> {
    const movie = await this.movieRepository.findOne({
      where: { id, isTheatricalRelease: false },
      relations: ['movieProviders', 'reviews']
    });

    if (!movie) {
      return failure(`스트리밍 영화 ID ${id}를 찾을 수 없습니다.`);
    }

    const result: MovieDetailResponseDto = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      overview: movie.overview,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      providers: movie.movieProviders.map(mp => 
        this.getProviderName(mp.theProviderId)
      ),
      theMovieDbId: movie.theMovieDbId,
      reviews: movie.reviews.map(review => ({
        id: review.id,
        content: review.reviewContent,
        createdAt: review.created_at.toISOString()
      }))
    };

    return success(result);
  }

  async getProviderMovies(providerId: number): Promise<MovieResponseDto[]> {
    const movies = await this.movieRepository
      .createQueryBuilder('movie')
      .innerJoinAndSelect('movie.movieProviders', 'movieProvider')
      .leftJoinAndSelect('movie.reviews', 'review')
      .where('movie.isTheatricalRelease = :isTheatrical', { isTheatrical: false })
      .andWhere('movieProvider.theProviderId = :providerId', { providerId })
      .orderBy('movie.release_date', 'DESC')
      .getMany();

    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      providers: this.getProviderName(providerId)
    }));
  }

  async getExpiringHorrorMovies(): Promise<ExpiringMovieResponseDto[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiringMovies = await this.netflixHorrorExpiringRepository.find({
      where: {
        expiredDate: MoreThanOrEqual(today)
      },
      order: {
        expiredDate: 'ASC'
      }
    });

    if (expiringMovies.length === 0) {
      return [];
    }

    const movieIds = expiringMovies.map(em => em.theMovieDbId);

    const movies = await this.movieRepository
      .createQueryBuilder('movie')
      .where('movie.theMovieDbId IN (:...movieIds)', { movieIds })
      .getMany();

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
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['movieProviders', 'reviews']
    });

    if (!movie) {
      return failure(`영화 ID ${id}를 찾을 수 없습니다.`);
    }

    const expiringMovie = await this.netflixHorrorExpiringRepository.findOne({
      where: { theMovieDbId: movie.theMovieDbId }
    });

    if (!expiringMovie) {
      return failure(`만료 예정인 영화 ID ${id}를 찾을 수 없습니다.`);
    }

    const result: ExpiringMovieDetailResponseDto = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      expiringDate: expiringMovie.expiredDate instanceof Date 
        ? expiringMovie.expiredDate.toISOString().split('T')[0]
        : expiringMovie.expiredDate,
      overview: movie.overview,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      providers: movie.movieProviders.map(mp => 
        mp.theProviderId.toString() === "1" ? "넷플릭스" : "디즈니플러스"
      ),
      theMovieDbId: movie.theMovieDbId,
      reviews: movie.reviews.map(review => ({
        id: review.id,
        content: review.reviewContent,
        createdAt: review.created_at.toISOString()
      }))
    };

    return success(result);
  }

  async findUpcomingMovies(today: string = new Date().toISOString()): Promise<MovieResponseDto[]> {
    const movies = await this.movieRepository.find({
      where: { 
        release_date: MoreThan(today),
        isTheatricalRelease: true
      },
      relations: ['movieTheaters', 'movieTheaters.theater'],
      order: { release_date: 'ASC' },
    });
    return movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      releaseDate: movie.release_date,
      posterPath: movie.poster_path,
    }));
  }

  async findReleasedMovies(today: string = new Date().toISOString()): Promise<MovieResponseDto[]> {
    const movies = await this.movieRepository.find({
      where: { 
        release_date: LessThanOrEqual(today),
        isTheatricalRelease: true
      },
      order: { release_date: 'DESC' },
      relations: ['movieTheaters', 'movieTheaters.theater'],
    });
    const filteredMovies = movies.filter(movie => movie.movieTheaters && movie.movieTheaters.length > 0);
    return filteredMovies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      releaseDate: movie.release_date,
      posterPath: movie.poster_path,
    }));
  }

  async findTheatricalMovieDetail(id: number): Promise<Result<MovieDetailResponseDto, string>> {
    const movie = await this.movieRepository.findOne({
      where: { id, isTheatricalRelease: true },
      relations: ['movieTheaters', 'movieTheaters.theater', 'reviews']
    });

    if (!movie) {
      return failure(`극장 개봉 영화 ID ${id}를 찾을 수 없습니다.`);
    }

    const result: MovieDetailResponseDto = {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      overview: movie.overview,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      providers: movie.movieTheaters.map(mt => mt.theater.name),
      theMovieDbId: movie.theMovieDbId,
      reviews: movie.reviews.map(review => ({
        id: review.id,
        content: review.reviewContent,
        createdAt: review.created_at.toISOString()
      }))
    };

    return success(result);
  }
}
