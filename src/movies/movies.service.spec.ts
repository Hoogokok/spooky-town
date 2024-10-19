import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { MovieRepository } from './repositories/movie.repository';
import { NetflixHorrorExpiringRepository } from './repositories/netflix-horror-expiring.repository';
import { MovieProvider } from './entities/movie-provider.entity';
import { Movie } from './entities/movie.entity';
import { NetflixHorrorExpiring } from './entities/netflix-horror-expiring.entity';
import { Review } from './entities/review.entity';
import { MovieTheater } from './entities/movie-theater.entity';
import { Theater } from './entities/theater.entity';
import { testDbConfig } from '../../test/test-db.config';
import { DataSource } from 'typeorm';
import { success, failure } from '../common/result';
import { createTestMovie, createTestMovieProvider, createTestReview } from './test/factories/movie.factory';
import { createTestNetflixHorrorExpiring } from './test/factories/netflix-horror-expiring.factory';

describe('MoviesService', () => {
  let service: MoviesService;
  let dataSource: DataSource;
  const expired_date = new Date();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDbConfig),
        TypeOrmModule.forFeature([Movie, MovieProvider, NetflixHorrorExpiring, Review, MovieTheater, Theater]),
      ],
      providers: [MoviesService, MovieRepository, NetflixHorrorExpiringRepository],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    dataSource = module.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStreamingMovies', () => {
    it('스트리밍 영화 목록을 반환해야 합니다', async () => {
      await dataSource.transaction(async (transactionalEntityManager) => {
        const movie = await transactionalEntityManager.save(Movie, createTestMovie());
        await transactionalEntityManager.save(MovieProvider, createTestMovieProvider({ movie, theProviderId: 1 }));

        const result = await service.getStreamingMovies({ provider: 'netflix', page: 1 });

        expect(result).toEqual([
          {
            id: movie.id,
            title: '테스트 영화',
            posterPath: '/path/to/poster.jpg',
            releaseDate: '2023-01-01',
            providers: '넷플릭스',
          },
        ]);
      });
    });

    it('페이지 번호가 0 이하일 때 첫 페이지를 반환해야 합니다', async () => {
      await dataSource.transaction(async (transactionalEntityManager) => {
        for (let i = 0; i < 10; i++) {
          const movie = await transactionalEntityManager.save(Movie, createTestMovie({ 
            title: `영화 ${i + 1}`, 
            poster_path: `/poster${i + 1}.jpg`,
            theMovieDbId: 12345 + i 
          }));
          await transactionalEntityManager.save(MovieProvider, createTestMovieProvider({ 
            movie: movie, 
            theProviderId: 1 
          }));
        }

        const result = await service.getStreamingMovies({ provider: 'netflix', page: 0 });
        expect(result.length).toBe(6);
        expect(result[0].title).toBe('영화 1');
      });
    });
  });

  describe('getTotalStreamingPages', () => {
    it('총 페이지 수를 올바르게 계산해야 합니다', async () => {
      await dataSource.transaction(async (transactionalEntityManager) => {
        for (let i = 0; i < 7; i++) {
          const movie = await transactionalEntityManager.save(Movie, createTestMovie({ theMovieDbId: 12345 + i }));
          await transactionalEntityManager.save(MovieProvider, createTestMovieProvider({ 
            movie: movie, 
            theProviderId: 1 
          }));
        }

        const result = await service.getTotalStreamingPages({ provider: 'netflix' });
        expect(result).toBe(2);
      });
    });

    it('결과가 0일 때 1 페이지를 반환해야 합니다', async () => {
      const result = await service.getTotalStreamingPages({ provider: 'netflix' });

      expect(result).toBe(1);
    });
  });

  describe('getStreamingMovieDetail', () => {
    it('스트리밍 영화 상세 정보를 반환해야 합니다', async () => {
      await dataSource.transaction(async (transactionalEntityManager) => {
        const movie = await transactionalEntityManager.save(Movie, createTestMovie());
        await transactionalEntityManager.save(MovieProvider, createTestMovieProvider({ movie, theProviderId: 1 }));
        await transactionalEntityManager.save(Review, createTestReview({ movie }));

        const result = await service.getStreamingMovieDetail(movie.id);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({
            id: movie.id,
            title: '테스트 영화',
            posterPath: '/path/to/poster.jpg',
            releaseDate: '2023-01-01',
            overview: '테스트 개요',
            voteAverage: 8.5,
            voteCount: 1000,
            providers: ['넷플릭스'],
            theMovieDbId: 12345,
            reviews: [{ id: expect.any(Number), content: '좋은 영화예요', createdAt: expect.any(String) }],
          });
        }
      });
    });

    it('존재하지 않는 영화 ID에 대해 실패 결과를 반환해야 합니다', async () => {
      const result = await service.getStreamingMovieDetail(999);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result).toEqual(failure('스트리밍 영화 ID 999를 찾을 수 없습니다.'));
      }
    });
  });

  describe('getProviderMovies', () => {
    it('특정 제공자의 영화 목록을 반환해야 합니다', async () => {
      await dataSource.transaction(async (transactionalEntityManager) => {
        const movie = await transactionalEntityManager.save(Movie, createTestMovie({ title: '넷플릭스 영화', theMovieDbId: 12345 }));
        await transactionalEntityManager.save(MovieProvider, createTestMovieProvider({ movie, theProviderId: 1 }));

        const result = await service.getProviderMovies(1);

        expect(result).toEqual([
          {
            id: movie.id,
            title: '넷플릭스 영화',
            posterPath: '/path/to/poster.jpg',
            releaseDate: '2023-01-01',
            providers: '넷플릭스',
          },
        ]);
      });
    });
  });

  describe('getExpiringHorrorMovies', () => {
    it('만료 예정인 공포 영화 목록을 반환해야 합니다', async () => {
      await dataSource.transaction(async (transactionalEntityManager) => {
        const movie = await transactionalEntityManager.save(Movie, createTestMovie({ title: '공포 영화', theMovieDbId: 12345 }));
        await transactionalEntityManager.save(NetflixHorrorExpiring, createTestNetflixHorrorExpiring({ theMovieDbId: movie.theMovieDbId, expiredDate: expired_date }));

        const result = await service.getExpiringHorrorMovies();

        expect(result).toEqual([
          {
            id: movie.id,
            title: '공포 영화',
            posterPath: '/path/to/poster.jpg',
            expiringDate: expired_date.toISOString().split('T')[0],
            providers: '넷플릭스',
          },
        ]);
      });
    });
  });

  describe('getExpiringHorrorMovieDetail', () => {
    it('만료 예정인 공포 영화의 상세 정보를 반환해야 합니다', async () => {
      await dataSource.transaction(async (transactionalEntityManager) => {
        const movie = await transactionalEntityManager.save(Movie, createTestMovie({ 
          title: '공포 영화', 
          theMovieDbId: 12345, 
          overview: '무서운 영화니다', 
          vote_average: 8, 
          vote_count: 2000 
        }));
        
        const expiringMovie = await transactionalEntityManager.save(NetflixHorrorExpiring, createTestNetflixHorrorExpiring({ theMovieDbId: movie.theMovieDbId, expiredDate: expired_date }));
        
        // MovieProvider 엔티티 생성 및 저장
        const movieProvider = new MovieProvider();
        movieProvider.movie = movie;
        movieProvider.theProviderId = 1; 
        await transactionalEntityManager.save(MovieProvider, movieProvider);

        const review = new Review();
        review.reviewContent = '무서워요';
        review.reviewUserId = 'user1';
        review.movie = movie;
        review.created_at = new Date();
        await transactionalEntityManager.save(Review, review);

        const result = await service.getExpiringHorrorMovieDetail(movie.id);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({
            id: movie.id,
            title: '공포 영화',
            posterPath: '/path/to/poster.jpg',
            expiringDate: expired_date.toISOString().split('T')[0],
            overview: '무서운 영화니다',
            voteAverage: 8,
            voteCount: 2000,
            providers: ['넷플릭스'],
            theMovieDbId: 12345,
            reviews: [{ id: expect.any(Number), content: '무서워요', createdAt: expect.any(String) }],
          });
        }
      });
    });
  });

  describe('findUpcomingMovies', () => {
    it('개봉 예정 영화 목록을 반환해야 합니다', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7일 후의 날짜
      await dataSource.transaction(async (transactionalEntityManager) => {
        const movie = await transactionalEntityManager.save(Movie, createTestMovie({ 
          title: '개봉 예정 영화', 
          theMovieDbId: 12345, 
          isTheatricalRelease: true,
          release_date: futureDate.toISOString().split('T')[0]
        }));

        const result = await service.findUpcomingMovies(new Date().toISOString().split('T')[0]);

        expect(result).toEqual([
          {
            id: movie.id,
            title: '개봉 예정 영화',
            posterPath: '/path/to/poster.jpg',
            releaseDate: futureDate.toISOString().split('T')[0],
          },
        ]);
      });
    });
  });

  describe('findReleasedMovies', () => {
    it('개봉된 영화 목록을 반환해야 합니다', async () => {
      await dataSource.transaction(async (transactionalEntityManager) => {
        const movie = await transactionalEntityManager.save(Movie, createTestMovie({ 
          title: '개봉된 영화', 
          theMovieDbId: 12345, 
          isTheatricalRelease: true 
        }));
        
        const theater = new Theater();
        theater.id = 1;
        theater.name = 'CGV';
        await transactionalEntityManager.save(Theater, theater);
        
        const movieTheater = new MovieTheater();
        movieTheater.movie = movie;
        movieTheater.theater = theater;
        await transactionalEntityManager.save(MovieTheater, movieTheater);

        const result = await service.findReleasedMovies('2023-06-01');

        expect(result).toEqual([
          {
            id: movie.id,
            title: '개봉된 영화',
            posterPath: '/path/to/poster.jpg',
            releaseDate: '2023-01-01',
          },
        ]);
      });
    });

    it('극장 영화 목록에 극장 정보가 없는 영화는 반환되지 않아야 합니다', async () => {
      await dataSource.transaction(async (transactionalEntityManager) => {
        const movie = await transactionalEntityManager.save(Movie, createTestMovie({ 
          title: '극장 영화', 
          theMovieDbId: 12345, 
          isTheatricalRelease: true 
        }));
        const result = await service.findReleasedMovies('2023-06-01');
        expect(result).toEqual([]);
      });
    });
  });

  describe('findTheatricalMovieDetail', () => {
    it('극장 개봉 영화의 상세 정보를 반환해야 합니다', async () => {
      await dataSource.transaction(async (transactionalEntityManager) => {
        const movie = await transactionalEntityManager.save(Movie, createTestMovie({ title: '극장 영화', theMovieDbId: 12345, isTheatricalRelease: true }));
        
        const theater = new Theater();
        theater.id = 1;
        theater.name = 'CGV';
        await transactionalEntityManager.save(Theater, theater);
        
        const movieTheater = new MovieTheater();
        movieTheater.movie = movie;
        movieTheater.theater = theater;
        await transactionalEntityManager.save(MovieTheater, movieTheater);

        const review = new Review();
        review.reviewContent = '재미있어요';
        review.reviewUserId = 'user1';
        review.review_movie_id = movie.theMovieDbId;
        review.created_at = new Date();
        await transactionalEntityManager.save(Review, review);

        const result = await service.findTheatricalMovieDetail(movie.id);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual({
            id: movie.id,
            title: '극장 영화',
            posterPath: '/path/to/poster.jpg',
            releaseDate: '2023-01-01',
            overview: '테스트 개요',
            voteAverage: 8.5,
            voteCount: 1000,
            providers: ['CGV'],
            theMovieDbId: 12345,
            reviews: [{ id: expect.any(Number), content: '재미있어요', createdAt: expect.any(String) }],
          });
        }
      });
    });
  });
});
