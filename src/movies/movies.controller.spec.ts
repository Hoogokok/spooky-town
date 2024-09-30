import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MovieQueryDto } from './dto/movie-query.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { MovieDetailResponseDto } from './dto/movie-detail-response.dto';
import { ExpiringMovieResponseDto } from './dto/expiring-movie-response.dto';
import { ExpiringMovieDetailResponseDto } from './dto/expiring-movie-detail-response.dto';

describe('MoviesController', () => {
  let controller: MoviesController;
  let moviesService: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: {
            getStreamingMovies: jest.fn(),
            getTotalStreamingPages: jest.fn(),
            getStreamingMovieDetail: jest.fn(),
            getProviderMovies: jest.fn(),
            getExpiringHorrorMovies: jest.fn(),
            getExpiringHorrorMovieDetail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    moviesService = module.get<MoviesService>(MoviesService);
  });

  it('컨트롤러가 정의되어 있어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  describe('getStreamingMovies', () => {
    it('영화 배열을 반환해야 합니다', async () => {
      const result: MovieResponseDto[] = [{ id: 1, title: 'Test Movie', releaseDate: '2023-01-01', posterPath: '/test.jpg' }];
      jest.spyOn(moviesService, 'getStreamingMovies').mockResolvedValue(result);

      expect(await controller.getStreamingMovies({} as MovieQueryDto)).toBe(result);
    });
  });

  describe('getTotalStreamingPages', () => {
    it('총 페이지 수를 반환해야 합니다', async () => {
      const totalPages = 5;
      jest.spyOn(moviesService, 'getTotalStreamingPages').mockResolvedValue(totalPages);

      expect(await controller.getTotalStreamingPages({} as MovieQueryDto)).toEqual({ totalPages });
    });
  });

  describe('getStreamingMovieDetail', () => {
    it('영화 상세 정보를 반환해야 합니다', async () => {
      const result: MovieDetailResponseDto = {
        id: 1,
        title: 'Test Movie',
        overview: 'Test Overview',
        releaseDate: '2023-01-01',
        posterPath: '/test.jpg',
        voteAverage: 8.5,
        voteCount: 100,
        theMovieDbId: 12345,
        providers: ['넷플릭스'],
      };
      jest.spyOn(moviesService, 'getStreamingMovieDetail').mockResolvedValue(result);

      expect(await controller.getStreamingMovieDetail(1)).toBe(result);
    });
  });

  describe('getProviderMovies', () => {
    it('특정 프로바이더의 영화 목록을 반환해야 합니다', async () => {
      const result: MovieResponseDto[] = [{ id: 1, title: 'Test Movie', releaseDate: '2023-01-01', posterPath: '/test.jpg' }];
      jest.spyOn(moviesService, 'getProviderMovies').mockResolvedValue(result);

      expect(await controller.getProviderMovies(1)).toBe(result);
    });
  });

  describe('getExpiringHorrorMovies', () => {
    it('만료 예정인 공포 영화 목록을 반환해야 합니다', async () => {
      const result: ExpiringMovieResponseDto[] = [
        { id: 1, title: 'Horror Movie', expiringDate: '2023-07-31', posterPath: '/horror.jpg', providers: '넷플릭스' }
      ];
      jest.spyOn(moviesService, 'getExpiringHorrorMovies').mockResolvedValue(result);

      expect(await controller.getExpiringHorrorMovies()).toBe(result);
    });
  });

  describe('getExpiringHorrorMovieDetail', () => {
    it('만료 예정인 공포 영화의 상세 정보를 반환해야 합니다', async () => {
      const result: ExpiringMovieDetailResponseDto = {
        id: 1,
        title: 'Horror Movie',
        expiringDate: '2023-07-31',
        posterPath: '/horror.jpg',
        overview: 'A scary movie',
        voteAverage: 7.5,
        voteCount: 1000,
        providers: ['넷플릭스'],
        theMovieDbId: 12345
      };
      jest.spyOn(moviesService, 'getExpiringHorrorMovieDetail').mockResolvedValue(result);

      expect(await controller.getExpiringHorrorMovieDetail(1)).toBe(result);
    });
  });
});