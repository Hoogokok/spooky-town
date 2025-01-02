import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { MoreThan } from 'typeorm';
import { ReviewRawData } from '../types/review-raw-data.interface';
import { REVIEW_SELECT_FIELDS, REVIEW_ORDER } from '../constants/review.constants';

@Injectable()
export class MovieRepository {
  constructor(
    @InjectRepository(Movie)
    private readonly repository: Repository<Movie>,
  ) { }

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

  async findMovieWithProvidersAndReviews(id: number): Promise<{
    movie: Movie;
    reviewsRaw: ReviewRawData[];
    totalReviews: number;
  } | undefined> {
    const movie = await this.repository.findOne({
      where: { id },
      relations: ['movieProviders']
    });

    if (!movie) {
      return undefined;
    }

    const [reviewsRaw, totalReviews] = await Promise.all([
      this.findRecentReviewsByMovieId(movie.theMovieDbId),
      this.getReviewsCount(movie.theMovieDbId)
    ]);

    return { movie, reviewsRaw, totalReviews };
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

  async findTheatricalMovieById(id: number): Promise<{
    movie: Movie;
    reviewsRaw: ReviewRawData[];
    totalReviews: number;
  } | undefined> {
    const movie = await this.repository.findOne({
      where: { id, isTheatricalRelease: true },
      relations: ['movieTheaters', 'movieTheaters.theater']
    });

    if (!movie) {
      return undefined;
    }

    const [reviewsRaw, totalReviews] = await Promise.all([
      this.findRecentReviewsByMovieId(movie.theMovieDbId),
      this.getReviewsCount(movie.theMovieDbId)
    ]);

    return { movie, reviewsRaw, totalReviews };
  }

  async clear() {
    await this.repository.clear();
  }

  async findRecentReviewsByMovieId(movieId: number, limit: number = 5): Promise<ReviewRawData[]> {
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
      .limit(limit)
      .getRawMany();
  }

  async findReviewsByMovieIdWithTotal(
    movieId: number,
    page: number = 1,
    limit: number = 5
  ): Promise<{ reviews: ReviewRawData[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.repository.manager
        .createQueryBuilder()
        .select([
          'reviews.id as id',
          'reviews.review_content as content',
          'reviews.created_at as "createdAt"',
          'reviews.review_user_id as "profileId"',
          'reviews.review_user_name as "profileName"'
        ])
        .from('reviews', 'reviews')
        .where('reviews.review_movie_id = :movieId', { movieId })
        .orderBy('reviews.created_at', 'DESC')
        .limit(limit)
        .offset(skip)
        .getRawMany(),

      this.repository.manager
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('reviews', 'reviews')
        .where('reviews.review_movie_id = :movieId', { movieId })
        .getRawOne()
        .then(result => Number(result.count))
    ]);

    return { reviews, total };
  }

  async findOne(id: number): Promise<Movie | undefined> {
    return this.repository.findOne({
      where: { id }
    });
  }

  async getReviewsCount(movieId: number): Promise<number> {
    const result = await this.repository.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('reviews', 'reviews')
      .where('reviews.review_movie_id = :movieId', { movieId })
      .getRawOne();

    return Number(result.count);
  }
}
