import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MovieQueryDto } from './dto/movie-query.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { MovieDetailResponseDto } from './dto/movie-detail-response.dto';
import { ExpiringMovieResponseDto } from './dto/expiring-movie-response.dto';
import { ExpiringMovieDetailResponseDto } from './dto/expiring-movie-detail-response.dto';
import { NotFoundException } from '@nestjs/common';
import { Result } from 'src/common/result';

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
            findTheatricalMovieDetail: jest.fn(),
            findReleasedMovies: jest.fn(),
            findUpcomingMovies: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    moviesService = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
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
      const mockResult = {
        success: true,
        data: {
          id: 1,
          title: 'Test Movie',
          posterPath: '/test.jpg',
          releaseDate: '2023-01-01',
          overview: '테스트 영화 설명',
          voteAverage: 8.5,
          voteCount: 100,
          providers: ['넷플릭스'],
          theMovieDbId: 12345,
          reviews: [
            {
              id: 1,
              content: '좋은 영화였습니다!',
              createdAt: '2023-06-01T00:00:00.000Z'
            }
          ]
        },
      };
      jest.spyOn(moviesService, 'getStreamingMovieDetail').mockResolvedValue(mockResult as Result<MovieDetailResponseDto, string>);

      const result = await controller.getStreamingMovieDetail(1);

      expect(result).toEqual(mockResult.data);
    });

    it('영화를 찾을 수 없을 때 NotFoundException을 던져야 합니다', async () => {
      const mockResult = {
        success: false,
        error: '영화를 찾을 수 없습니다',
      };
      jest.spyOn(moviesService, 'getStreamingMovieDetail').mockResolvedValue(mockResult as Result<MovieDetailResponseDto, string>);

      await expect(controller.getStreamingMovieDetail(999)).rejects.toThrow(NotFoundException);
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
      const mockResult = {
        success: true,
        data: {
          id: 1,
          title: '공포 영화',
          posterPath: '/horror.jpg',
          expiringDate: '2023-07-31',
          overview: '무서운 영화입니다',
          voteAverage: 7.5,
          voteCount: 50,
          providers: ['넷플릭스'],
          theMovieDbId: 67890,
          reviews: [
            {
              id: 1,
              content: '너무 무서웠어요!',
              createdAt: '2023-06-15T00:00:00.000Z'
            }
          ]
        },
      };
      jest.spyOn(moviesService, 'getExpiringHorrorMovieDetail').mockResolvedValue(mockResult as Result<ExpiringMovieDetailResponseDto, string>);

      const result = await controller.getExpiringHorrorMovieDetail(1);

      expect(result).toEqual(mockResult.data);
    });

    it('영화를 찾을 수 없을 때 NotFoundException을 던져야 합니다', async () => {
      const mockResult = {
        success: false,
        error: 'Horror movie not found',
      };
      jest.spyOn(moviesService, 'getExpiringHorrorMovieDetail').mockResolvedValue(mockResult as Result<ExpiringMovieDetailResponseDto, string>);

      await expect(controller.getExpiringHorrorMovieDetail(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTheaterMovieDetail', () => {
    it('극장 개봉 영화의 상세 정보를 반환해야 합니다', async () => {
      const mockResult = {
        success: true,
        data: {
          id: 1,
          title: '극장 영화',
          posterPath: '/theater.jpg',
          releaseDate: '2023-07-01',
          overview: '재미있는 영화입니다',
          voteAverage: 9.0,
          voteCount: 200,
          providers: ['CGV', '메가박스'],
          theMovieDbId: 13579,
          reviews: [
            {
              id: 1,
              content: '정말 재미있었어요!',
              createdAt: '2023-07-02T00:00:00.000Z'
            }
          ]
        },
      };
      jest.spyOn(moviesService, 'findTheatricalMovieDetail').mockResolvedValue(mockResult as Result<MovieDetailResponseDto, string>);

      const result = await controller.getTheaterMovieDetail(1);

      expect(result).toEqual(mockResult.data);
    });

    it('영화를 찾을 수 없을 때 NotFoundException을 던져야 합니다', async () => {
      const mockResult = {
        success: false,
        error: 'Theater movie not found',
      };
      jest.spyOn(moviesService, 'findTheatricalMovieDetail').mockResolvedValue(mockResult as Result<MovieDetailResponseDto, string>);

      await expect(controller.getTheaterMovieDetail(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getReleasedMovies', () => {
    it('개봉 중인 영화 목록을 반환해야 합니다', async () => {
      const result: MovieResponseDto[] = [{ id: 1, title: 'Test Movie', releaseDate: '2023-01-01', posterPath: '/test.jpg' }];
      jest.spyOn(moviesService, 'findReleasedMovies').mockResolvedValue(result);

      expect(await controller.getReleasedMovies()).toBe(result);
    });
  });

  describe('getUpcomingMovies', () => {
    it('개봉 예정인 영화 목록을 반환해야 합니다', async () => {
      const result: MovieResponseDto[] = [{ id: 1, title: 'Test Movie', releaseDate: '2023-01-01', posterPath: '/test.jpg' }];
      jest.spyOn(moviesService, 'findUpcomingMovies').mockResolvedValue(result);

      expect(await controller.getUpcomingMovies()).toBe(result);
    });
  });
});
