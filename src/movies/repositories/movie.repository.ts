import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { Review } from '../entities/review.entity';
import { ReviewRawData } from '../types/review-raw-data.interface';
import { MoreThan } from 'typeorm';
import { REVIEW_ORDER, REVIEW_SELECT_FIELDS } from '../constants/review.constants';

@Injectable()
export class MovieRepository {
  constructor(
    @InjectRepository(Movie)
    private readonly repository: Repository<Movie>,
  ) {}

  async getStreamingMovies(provider: string | undefined, take: number, skip: number): Promise<Movie[]> {
    const queryBuilder = this.repository.createQueryBuilder('movie')
      .innerJoinAndSelect('movie.movieProviders', 'movieProvider')
      .where('movie.isTheatricalRelease = :isTheatrical', { isTheatrical: false })
      .orderBy('movie.release_date', 'DESC')
      .take(take)
      .skip(skip);

    if (provider) {
      const providerId = provider === "netflix" ? 1 : provider === "disney" ? 2 : provider === "wavve" ? 3 : provider === "naver" ? 4 : provider === "googleplay" ? 5 : 0;
      if (providerId !== 0) {
        queryBuilder.andWhere('movieProvider.theProviderId = :providerId', { providerId });
      }
    }

    return queryBuilder.getMany();
  }

  async save(movie: Partial<Movie>): Promise<Movie> {
    return this.repository.save(movie);
  }

  async getTotalStreamingMoviesCount(provider?: string): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('movie')
      .innerJoin('movie.movieProviders', 'movieProvider')
      .where('movie.isTheatricalRelease = :isTheatrical', { isTheatrical: false });

    if (provider) {
      const providerId = provider === "netflix" ? 1 : provider === "disney" ? 2 : provider === "wavve" ? 3 : provider === "naver" ? 4 : provider === "googleplay" ? 5 : 0;
      if (providerId !== 0) {
        queryBuilder.andWhere('movieProvider.theProviderId = :providerId', { providerId });
      }
    }

    return queryBuilder.getCount();
  }

  async findMoviesByProviderId(providerId: number): Promise<Movie[]> {
    return this.repository.createQueryBuilder('movie')
      .innerJoinAndSelect('movie.movieProviders', 'movieProvider')
      .where('movie.isTheatricalRelease = :isTheatrical', { isTheatrical: false })
      .andWhere('movieProvider.theProviderId = :providerId', { providerId })
      .orderBy('movie.release_date', 'DESC')
      .getMany();
  }

  async findMoviesByTheMovieDbIds(theMovieDbIds: number[]): Promise<Movie[]> {
    return this.repository
      .createQueryBuilder('movie')
      .where('movie.theMovieDbId IN (:...theMovieDbIds)', { theMovieDbIds })
      .getMany();
  }

  async findMovieWithProvidersAndReviews(id: number): Promise<{ movie: Movie; reviewsRaw: ReviewRawData[] } | undefined> {
    const movie = await this.repository.findOne({
      where: { id },
      relations: ['movieProviders']
    });

    if (!movie) {
      return undefined;
    }

    const reviewsRaw = await this.findReviewsByMovieId(movie.theMovieDbId);
    return { movie, reviewsRaw };
  }

  async findUpcomingMovies(today: string = new Date().toISOString()): Promise<Movie[]> {
    return this.repository.find({
      where: { 
        release_date: MoreThan(today),
        isTheatricalRelease: true
      },
      order: { release_date: 'ASC' },
    });
  }

  async findReleasedMovies(today: string = new Date().toISOString()): Promise<Movie[]> {
    return this.repository.createQueryBuilder('movie')
      .leftJoinAndSelect('movie.movieTheaters', 'movieTheater')
      .leftJoinAndSelect('movieTheater.theater', 'theater')
      .where('movie.release_date <= :today', { today })
      .andWhere('movie.isTheatricalRelease = :isTheatrical', { isTheatrical: true })
      .orderBy('movie.release_date', 'DESC')
      .getMany();
  }

  async findTheatricalMovieById(id: number): Promise<{ movie: Movie; reviewsRaw: ReviewRawData[] } | undefined> {
    const movie = await this.repository.findOne({
      where: { id, isTheatricalRelease: true },
      relations: ['movieTheaters', 'movieTheaters.theater']
    });

    if (!movie) {
      return undefined;
    }

    const reviewsRaw = await this.findReviewsByMovieId(movie.theMovieDbId);
    return { movie, reviewsRaw };
  }

  async clear() {
    await this.repository.clear();
  }

  async findReviewsByMovieId(movieId: number): Promise<ReviewRawData[]> {
    return this.repository.manager
      .createQueryBuilder()
      .select([
        REVIEW_SELECT_FIELDS.ID,
        REVIEW_SELECT_FIELDS.CONTENT,
        REVIEW_SELECT_FIELDS.CREATED_AT,
        REVIEW_SELECT_FIELDS.PROFILE_ID,
        REVIEW_SELECT_FIELDS.PROFILE_NAME
      ])
      .from('reviews', 'reviews')
      .leftJoin('profiles', 'profiles', 'reviews.review_user_id = profiles.id')
      .where('reviews.review_movie_id = :movieId', { movieId })
      .orderBy(REVIEW_ORDER.CREATED_AT, REVIEW_ORDER.DESC)
      .getRawMany();
  }
}
