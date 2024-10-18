import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MovieQueryDto } from './dto/movie-query.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testDbConfig } from '../../test/test-db.config';
import { Movie } from './entities/movie.entity';
import { MovieProvider } from './entities/movie-provider.entity';
import { NetflixHorrorExpiring } from './entities/netflix-horror-expiring.entity';
import { MovieTheater } from './entities/movie-theater.entity';
import { Theater } from './entities/theater.entity';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('MoviesController', () => {
  let controller: MoviesController;
  let module: TestingModule;
  let movieRepository: Repository<Movie>;
  let movieProviderRepository: Repository<MovieProvider>;
  let netflixHorrorExpiringRepository: Repository<NetflixHorrorExpiring>;
  let movieTheaterRepository: Repository<MovieTheater>;
  let theaterRepository: Repository<Theater>;
  const pastDate = new Date();
  const today = pastDate.toISOString().split('T')[0];
  const tommorow = new Date(pastDate.setDate(pastDate.getDate() + 1)).toISOString().split('T')[0];
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDbConfig),
        TypeOrmModule.forFeature([Movie, MovieProvider, NetflixHorrorExpiring, MovieTheater, Theater, Review]),
      ],
      controllers: [MoviesController],
      providers: [MoviesService],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    movieRepository = module.get('MovieRepository');
    movieProviderRepository = module.get('MovieProviderRepository');
    netflixHorrorExpiringRepository = module.get('NetflixHorrorExpiringRepository');
    movieTheaterRepository = module.get('MovieTheaterRepository');
    theaterRepository = module.get('TheaterRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    await movieProviderRepository.clear();
    await netflixHorrorExpiringRepository.clear();
    await movieTheaterRepository.clear();
    await theaterRepository.clear();
    await movieRepository.clear();

    const streamingMovie = await movieRepository.save({
      id: 1,
      title: '테스트 영화',
      release_date: '2023-01-01',
      poster_path: '/test.jpg',
      theMovieDbId: 12345,
      overview: '테스트 영화 설명',
      runtime: 120,
      vote_average: 7.5,
      vote_count: 1000,
      popularity: 50.5,
      isTheatricalRelease: false,
    });

    const releaseMovie = await movieRepository.save({
      id: 2,
      title: '테스트 영화2',
      release_date: today,
      poster_path: '/test2.jpg',
      theMovieDbId: 123456,
      overview: '테스트 영화 설명2',
      runtime: 120,
      vote_average: 7.5,
      vote_count: 1000,
      popularity: 50.5,
      isTheatricalRelease: true,
    });

    const upcomingMovie = await movieRepository.save({
      id: 3,
      title: '테스트 영화3',
      release_date: tommorow,
      poster_path: '/test3.jpg',
      theMovieDbId: 1234567,
      overview: '테스트 영화 설명3',
      runtime: 120,
      vote_average: 7.5,
      vote_count: 1000,
      popularity: 50.5,
      isTheatricalRelease: true,
    });

    await movieProviderRepository.save({
      movie: streamingMovie,
      theProviderId: 1, // Netflix
    });

    await netflixHorrorExpiringRepository.save({
      id: 1,
      title: '테스트 영화',
      expiredDate: tommorow,
      theMovieDbId: streamingMovie.theMovieDbId,
    });

    const theater = await theaterRepository.save({
      id: 2,
      name: '테스트 극장',
    });

    await movieTheaterRepository.save({
      movie: releaseMovie,
      theater: theater,
    });

    await movieTheaterRepository.save({
      movie: upcomingMovie,
      theater: theater,
    });
  });

  it('컨트롤러가 정의되어 있어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  describe('getStreamingMovies', () => {
    it('영화 배열을 반환해야 합니다', async () => {
      const result = await controller.getStreamingMovies({} as MovieQueryDto);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('테스트 영화');
      expect(result[0].providers).toBe('넷플릭스');
    });
  });

  describe('getTotalStreamingPages', () => {
    it('총 페이지 수를 반환해야 합니다', async () => {
      const result = await controller.getTotalStreamingPages({} as MovieQueryDto);
      expect(result).toHaveProperty('totalPages');
      expect(typeof result.totalPages).toBe('number');
    });
  });

  describe('getStreamingMovieDetail', () => {
    it('영화 상세 정보를 반환해야 합니다', async () => {
      const result = await controller.getStreamingMovieDetail(1);
      expect(result).toBeDefined();
      expect(result.title).toBe('테스트 영화');
      expect(result.providers).toContain('넷플릭스');
    });

    it('존재하지 않는 영화 ID로 요청 시 NotFoundException을 던져야 합니다', async () => {
      await expect(controller.getStreamingMovieDetail(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProviderMovies', () => {
    it('영화 배열을 반환해야 합니다', async () => {
      const result = await controller.getProviderMovies(1);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('테스트 영화');
      expect(result[0].providers).toBe('넷플릭스');
    });
  });

  describe('getExpiringHorrorMovies', () => {
    it('만료 예정인 공포 영화 배열을 반환해야 합니다', async () => {
      const result = await controller.getExpiringHorrorMovies();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('테스트 영화');
      expect(result[0].expiringDate).toBe(tommorow);
    });
  });

  describe('getExpiringHorrorMovieDetail', () => {
    it('만료 예정인 공포 영화 상세 정보를 반환해야 합니다', async () => {
      const result = await controller.getExpiringHorrorMovieDetail(1);
      expect(result).toBeDefined();
      expect(result.title).toBe('테스트 영화');
      expect(result.expiringDate).toBe(tommorow);
    });

    it('존재하지 않는 영화 ID로 요청 시 NotFoundException을 던져야 합니다', async () => {
      await expect(controller.getExpiringHorrorMovieDetail(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUpcomingMovies', () => {
    it('개봉 예정 영화 배열을 반환해야 합니다', async () => {
      const result = await controller.getUpcomingMovies();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('테스트 영화3');
      expect(result[0].releaseDate).toBe(tommorow);
    });
  });

  describe('getReleasedMovies', () => {
    it('개봉된 영화 배열을 반환해야 합니다', async () => {
      const result = await controller.getReleasedMovies();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('테스트 영화2');
      expect(result[0].releaseDate).toBe(today);
    });
  });

  describe('getTheaterMovieDetail', () => {
    it('극장 개봉 영화 상세 정보를 반환해야 합니다', async () => {
      const result = await controller.getTheaterMovieDetail(2);
      expect(result).toBeDefined();
      expect(result.title).toBe('테스트 영화2');
      expect(result.providers).toContain('테스트 극장');
    });

    it('존재하지 않는 영화 ID로 요청 시 NotFoundException을 던져야 합니다', async () => {
      await expect(controller.getTheaterMovieDetail(999)).rejects.toThrow(NotFoundException);
    });
  });
});
