import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { MovieProvider } from './entities/movie-provider.entity';
import { NetflixHorrorExpiring } from './entities/netflix-horror-expiring.entity';
import { testDbConfig } from '../../test/test-db.config';
import { MovieQueryDto } from './dto/movie-query.dto';
import { Result, Failure, Success } from 'src/common/result';
import { MovieDetailResponseDto } from './dto/movie-detail-response.dto';
import { MovieTheater } from './entities/movie-theater.entity';
import { Theater } from './entities/theater.entity';

describe('MoviesService', () => {
  let service: MoviesService;
  let movieRepository: Repository<Movie>;
  let movieProviderRepository: Repository<MovieProvider>;
  let netflixHorrorExpiringRepository: Repository<NetflixHorrorExpiring>;
  let dataSource: DataSource;
  let movieTheaterRepository: Repository<MovieTheater>;
  let theaterRepository: Repository<Theater>;

  beforeAll(async () => {
    dataSource = new DataSource(testDbConfig);
    await dataSource.initialize();
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.synchronize(true);
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: getRepositoryToken(Movie),
          useFactory: () => dataSource.getRepository(Movie),
        },
        {
          provide: getRepositoryToken(MovieProvider),
          useFactory: () => dataSource.getRepository(MovieProvider),
        },
        {
          provide: getRepositoryToken(NetflixHorrorExpiring),
          useFactory: () => dataSource.getRepository(NetflixHorrorExpiring),
        },
        {
          provide: getRepositoryToken(MovieTheater),
          useFactory: () => dataSource.getRepository(MovieTheater),
        },
        {
          provide: getRepositoryToken(Theater),
          useFactory: () => dataSource.getRepository(Theater),
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
    movieProviderRepository = module.get<Repository<MovieProvider>>(getRepositoryToken(MovieProvider));
    netflixHorrorExpiringRepository = module.get<Repository<NetflixHorrorExpiring>>(getRepositoryToken(NetflixHorrorExpiring));
    movieTheaterRepository = module.get<Repository<MovieTheater>>(getRepositoryToken(MovieTheater));
    theaterRepository = module.get<Repository<Theater>>(getRepositoryToken(Theater));
  });

  afterEach(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.synchronize(true);
    }
  });

  describe('getStreamingMovies', () => {
    it('영화 배열을 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      const movie1 = await movieRepository.save({
        title: 'Netflix Movie',
        poster_path: '/netflix.jpg',
        release_date: '2023-01-01',
        isTheatricalRelease: false,
        overview: 'Netflix movie overview',
        vote_average: 7.5,
        vote_count: 100,
        theMovieDbId: 1001, // 추가
      });
      await movieProviderRepository.save({
        movie: movie1,
        theProviderId: 1,
      });

      const movie2 = await movieRepository.save({
        title: 'Disney Movie',
        poster_path: '/disney.jpg',
        release_date: '2023-02-01',
        isTheatricalRelease: false,
        overview: 'Disney movie overview',
        vote_average: 8.0,
        vote_count: 200,
        theMovieDbId: 1002, // 추가
      });
      await movieProviderRepository.save({
        movie: movie2,
        theProviderId: 2,
      });

      const query: MovieQueryDto = { page: 1 };
      const result = await service.getStreamingMovies(query);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: movie2.id,
        title: 'Disney Movie',
        posterPath: '/disney.jpg',
        releaseDate: '2023-02-01',
        providers: '디즈니플러스'
      });
      expect(result[1]).toEqual({
        id: movie1.id,
        title: 'Netflix Movie',
        posterPath: '/netflix.jpg',
        releaseDate: '2023-01-01',
        providers: '넷플릭스'
      });
    });

    it('넷플릭스 영화만 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      const movie = await movieRepository.save({
        title: 'Netflix Movie',
        poster_path: '/netflix.jpg',
        release_date: '2023-01-01',
        isTheatricalRelease: false,
        overview: 'Netflix movie overview', // 추가
        vote_average: 7.5, // 추가
        vote_count: 100, // 추가
        theMovieDbId: 1001, // 추가
      });
      await movieProviderRepository.save({
        movie: movie,
        theProviderId: 1,
      });

      const query: MovieQueryDto = { provider: 'netflix', page: 1 };
      const result = await service.getStreamingMovies(query);

      expect(result).toHaveLength(1);
      expect(result[0].providers).toBe('넷플릭스');
    });
    it('디즈니 플러스 영화만 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      const movie = await movieRepository.save({
        title: 'Disney Movie',
        poster_path: '/disney.jpg',
        release_date: '2023-01-01',
        isTheatricalRelease: false,
        overview: 'Disney movie overview',
        vote_average: 7.5,
        vote_count: 100,
        theMovieDbId: 1001,
      });
      await movieProviderRepository.save({
        movie: movie,
        theProviderId: 2,
      });

      const query: MovieQueryDto = { provider: 'disneyplus', page: 1 };
      const result = await service.getStreamingMovies(query);

      expect(result).toHaveLength(1);
      expect(result[0].providers).toBe('디즈니플러스');
    });

    it('웨이브 영화만 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      const movie = await movieRepository.save({
        title: 'Wave Movie',
        poster_path: '/wave.jpg',
        release_date: '2023-01-01',
        isTheatricalRelease: false,
        overview: 'Wave movie overview',
        vote_average: 7.5,
        vote_count: 100,
        theMovieDbId: 1001,
      });
      await movieProviderRepository.save({
        movie: movie,
        theProviderId: 3,
      });

      const query: MovieQueryDto = { provider: 'wave', page: 1 };
      const result = await service.getStreamingMovies(query);

      expect(result).toHaveLength(1);
      expect(result[0].providers).toBe('웨이브');
    });

    it('네이버 영화만 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      const movie = await movieRepository.save({
        title: 'Naver Movie',
        poster_path: '/naver.jpg',
        release_date: '2023-01-01',
        isTheatricalRelease: false,
        overview: 'Naver movie overview',
        vote_average: 7.5,
        vote_count: 100,
        theMovieDbId: 1001,
      });
      await movieProviderRepository.save({
        movie: movie,
        theProviderId: 4,
      });

      const query: MovieQueryDto = { provider: 'naver', page: 1 };
      const result = await service.getStreamingMovies(query);

      expect(result).toHaveLength(1);
      expect(result[0].providers).toBe('네이버');
    });

    it('구글 플레이 영화만 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      const movie = await movieRepository.save({
        title: 'Google Play Movie',
        poster_path: '/googleplay.jpg',
        release_date: '2023-01-01',
        isTheatricalRelease: false,
        overview: 'Google Play movie overview',
        vote_average: 7.5,
        vote_count: 100,
        theMovieDbId: 1001,
      });
      await movieProviderRepository.save({
        movie: movie,
        theProviderId: 5,
      });

      const query: MovieQueryDto = { provider: 'googleplay', page: 1 };
      const result = await service.getStreamingMovies(query);

      expect(result).toHaveLength(1);
      expect(result[0].providers).toBe('구글 플레이');
    });
  });

  describe('getTotalStreamingPages', () => {
    it('총 페이지 수를 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      for (let i = 0; i < 25; i++) {
        const movie = await movieRepository.save({
          title: `Movie ${i}`,
          poster_path: `/poster${i}.jpg`,
          release_date: '2023-01-01',
          isTheatricalRelease: false,
          overview: `Overview ${i}`,
          vote_average: 7.5,
          vote_count: 100,
          theMovieDbId: 1000 + i,
        });
        await movieProviderRepository.save({
          movie: movie,
          theProviderId: 1,
        });
      }

      const query: MovieQueryDto = { page: 1 };
      const result = await service.getTotalStreamingPages(query);

      expect(result).toBe(5); // 25개 영화, 페이지당 5개 => 5페이지
    });

    it('넷플릭스 영화에 대한 총 페이지 수를 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      for (let i = 0; i < 15; i++) {
        const movie = await movieRepository.save({
          title: `Netflix Movie ${i}`,
          poster_path: `/netflix${i}.jpg`,
          release_date: '2023-01-01',
          isTheatricalRelease: false,
          overview: `Netflix overview ${i}`,
          vote_average: 7.5,
          vote_count: 100,
          theMovieDbId: 2000 + i,
        });
        await movieProviderRepository.save({
          movie: movie,
          theProviderId: 1,
        });
      }

      const query: MovieQueryDto = { page: 1, provider: 'netflix' };
      const result = await service.getTotalStreamingPages(query);

      expect(result).toBe(3); // 15개 영화, 페이지당 5개 => 3페이지
    });
  });

  describe('getStreamingMovieDetail', () => {
    it('스트리밍 영화 상세 정보를 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      const movie = await movieRepository.save({
        id: 1,
        title: 'Test Movie',
        poster_path: '/test.jpg',
        release_date: '2023-01-01',
        overview: 'Test overview',
        vote_average: 8.5,
        vote_count: 100,
        theMovieDbId: 12345,
        isTheatricalRelease: false,
      });
      await movieProviderRepository.save({
        movie: movie,
        theProviderId: 1,
      });

      const result = await service.getStreamingMovieDetail(1);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          id: 1,
          title: 'Test Movie',
          posterPath: '/test.jpg',
          releaseDate: '2023-01-01',
          overview: 'Test overview',
          voteAverage: 8.5,
          voteCount: 100,
          providers: ['넷플릭스'],
          theMovieDbId: 12345,
          reviews: [],
        });
      }
    });

    it('존재하지 않는 영화 ID에 대해 실패 결과를 반환해야 합니다', async () => {
      const result: Result<MovieDetailResponseDto, string> = await service.getStreamingMovieDetail(999);

      expect(result.success).toBe(false);
      if (result.success === false) {
        expect((result as Failure<string>).error).toBe('스트리밍 영화 ID 999를 찾을 수 없습니다.');
      }
    });
  });

  describe('getExpiringHorrorMovies', () => {
    it('만료 예정인 공포 영화 목록을 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      const movie = await movieRepository.save({
        id: 1,
        title: 'Expiring Horror Movie',
        poster_path: '/horror.jpg',
        theMovieDbId: 12345,
        release_date: '2023-01-01',
        overview: 'Horror movie overview',
        vote_average: 6.5,
        vote_count: 50,
        isTheatricalRelease: false,
      });
      await netflixHorrorExpiringRepository.save({
        theMovieDbId: 12345,
        expiredDate: new Date(Date.now() + 86400000), // 내일
        title: 'Expiring Horror Movie', // 추가
      });

      const result = await service.getExpiringHorrorMovies();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Expiring Horror Movie',
        posterPath: '/horror.jpg',
        expiringDate: expect.any(String),
        providers: '넷플릭스',
      });
    });
  });

  describe('findUpcomingMovies', () => {
    it('개봉 예정 영화 목록을 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7일 후
      await movieRepository.save({
        id: 1,
        title: 'Upcoming Movie',
        poster_path: '/upcoming.jpg',
        release_date: futureDate.toISOString(),
        isTheatricalRelease: true,
        overview: 'Upcoming movie overview',
        vote_average: 0,
        vote_count: 0,
        theMovieDbId: 1001, // 추가
      });

      const result = await service.findUpcomingMovies();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Upcoming Movie',
        posterPath: '/upcoming.jpg',
        releaseDate: futureDate.toISOString(),
      });
    });
  });

  describe('findReleasedMovies', () => {
    it('이미 개봉된 영화 목록을 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 7); // 7일 전
      const movie = await movieRepository.save({
        id: 1,
        title: 'Released Movie',
        poster_path: '/released.jpg',
        release_date: pastDate.toISOString(),
        isTheatricalRelease: true,
        overview: 'Released movie overview',
        vote_average: 7.0,
        vote_count: 150,
        theMovieDbId: 1001,
      });

      // Theater 엔티티 생성
      const theater = await theaterRepository.save({
        name: 'Test Theater',
        location: 'Test Location',
      });

      // MovieTheater 관계 설정
      await movieTheaterRepository.save({
        movie: movie,
        theater: theater,
      });

      const result = await service.findReleasedMovies();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Released Movie',
        posterPath: '/released.jpg',
        releaseDate: pastDate.toISOString(),
      });
    });
  });

  describe('getProviderMovies', () => {
    it('특정 제공자의 영화 목록을 반환해야 합니다', async () => {
      // 테스트 데이터 준비
      const movie = await movieRepository.save({
        id: 1,
        title: 'Provider Movie',
        poster_path: '/provider.jpg',
        release_date: '2023-01-01',
        isTheatricalRelease: false,
        overview: 'Provider movie overview',
        vote_average: 7.0,
        vote_count: 150,
        theMovieDbId: 1001,
      });

      await movieProviderRepository.save({
        movie: movie,
        theProviderId: 1,
      });

      const result = await service.getProviderMovies(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Provider Movie',
        posterPath: '/provider.jpg',
        releaseDate: '2023-01-01',
        providers: '넷플릭스', // 제공자 이름 추가
      });
    });
  });
});
