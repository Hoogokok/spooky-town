import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { MovieProvider } from './entities/movie-provider.entity';
import { MovieResponseDto } from './dto/movie-response.dto';
import { MovieQueryDto } from './dto/movie-query.dto';
import { MovieDetailResponseDto } from './dto/movie-detail-response.dto';
import { NetflixHorrorExpiring } from './entities/netflix-horror-expiring.entity';
import { ExpiringMovieResponseDto } from './dto/expiring-movie-response.dto';
import { ExpiringMovieDetailResponseDto } from './dto/expiring-movie-detail-response.dto';
import { MoreThan, LessThanOrEqual } from 'typeorm';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(MovieProvider)
    private movieProviderRepository: Repository<MovieProvider>,
    @InjectRepository(NetflixHorrorExpiring)
    private netflixHorrorExpiringRepository: Repository<NetflixHorrorExpiring>
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

  async getStreamingMovieDetail(id: number): Promise<MovieDetailResponseDto> {
    const movie = await this.movieRepository.findOne({
      where: { id, isTheatricalRelease: false },
      relations: ['movieProviders', 'reviews']
    });

    if (!movie) {
      throw new NotFoundException(`스트리밍 영화 ID ${id}를 찾을 수 없습니다.`);
    }

    return {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      overview: movie.overview,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      providers: movie.movieProviders.map(mp => 
        mp.theProviderId === 1 ? "넷플릭스" : "디즈니플러스"
      ),
      theMovieDbId: movie.theMovieDbId,
      reviews: movie.reviews.map(review => ({
        id: review.id,
        content: review.reviewContent,
        createdAt: review.created_at.toISOString()
      }))
    };
  }

  async getProviderMovies(providerId: number): Promise<MovieResponseDto[]> {
    const movies = await this.movieRepository
      .createQueryBuilder('movie')
      .innerJoinAndSelect('movie.movieProviders', 'movieProvider')
      .innerJoinAndSelect('movie.reviews', 'review')
      .where('movie.isTheatricalRelease = :isTheatrical', { isTheatrical: false })
      .andWhere('movieProvider.theProviderId = :providerId', { providerId })
      .orderBy('movie.release_date', 'DESC')
      .getMany();

    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      providers: providerId === 1 ? "넷플릭스" : "디즈니플러스"
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

  async getExpiringHorrorMovieDetail(id: number): Promise<ExpiringMovieDetailResponseDto> {
    const movie = await this.movieRepository.findOne({
      where: { id },
      relations: ['movieProviders', 'reviews']
    });

    if (!movie) {
      throw new NotFoundException(`영화 ID ${id}를 찾을 수 없습니다.`);
    }

    const expiringMovie = await this.netflixHorrorExpiringRepository.findOne({
      where: { theMovieDbId: movie.theMovieDbId }
    });

    if (!expiringMovie) {
      throw new NotFoundException(`만료 예정인 영화 ID ${id}를 찾을 수 없습니다.`);
    }

    return {
      id: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      expiringDate: expiringMovie.expiredDate.toISOString().split('T')[0],
      overview: movie.overview,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      providers: movie.movieProviders.map(mp => 
        mp.theProviderId === 1 ? "넷플릭스" : "디즈니플러스"
      ),
      theMovieDbId: movie.theMovieDbId,
      reviews: movie.reviews.map(review => ({
        id: review.id,
        content: review.reviewContent,
        createdAt: review.created_at.toISOString()
      }))
    };
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
    });
    return movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      releaseDate: movie.release_date,
      posterPath: movie.poster_path,
    }));
  }

  async findTheatricalMovieDetail(id: number): Promise<MovieDetailResponseDto> {
    const movie = await this.movieRepository.findOne({
      where: { id, isTheatricalRelease: true },
      relations: ['movieTheaters', 'movieTheaters.theater', 'reviews']
    });
    console.log('movie', movie);
    if (!movie) {
      throw new NotFoundException(`극장 개봉 영화 ID ${id}를 찾을 수 없습니다.`);
    }

    return {
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
  }
}