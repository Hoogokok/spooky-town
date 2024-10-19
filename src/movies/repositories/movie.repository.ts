import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { MoreThan } from 'typeorm';

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

  async findStreamingMovieById(id: number): Promise<Movie | undefined> {
    return this.repository.findOne({
      where: { id, isTheatricalRelease: false },
      relations: ['movieProviders', 'reviews']
    });
  }

  async findMoviesByProviderId(providerId: number): Promise<Movie[]> {
    return this.repository.createQueryBuilder('movie')
      .innerJoinAndSelect('movie.movieProviders', 'movieProvider')
      .leftJoinAndSelect('movie.reviews', 'review')
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

  async findMovieWithProvidersAndReviews(id: number): Promise<Movie | undefined> {
    return this.repository.findOne({
      where: { id },
      relations: ['movieProviders', 'reviews']
    });
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

  async findTheatricalMovieById(id: number): Promise<Movie | undefined> {
    return this.repository.findOne({
      where: { id, isTheatricalRelease: true },
      relations: ['movieTheaters', 'movieTheaters.theater', 'reviews']
    });
  }

  async clear() {
    await this.repository.clear();
  }
}
