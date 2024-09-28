import { Test, TestingModule } from '@nestjs/testing';
import { TheaterMoviesController } from './theater-movies.controller';
import { TheaterMoviesService } from './theater-movies.service';
import { MovieResponseDto, MovieDetailResponseDto } from './dto/movie-response.dto';

describe('TheaterMoviesController', () => {
  let controller: TheaterMoviesController;
  let service: TheaterMoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TheaterMoviesController],
      providers: [
        {
          provide: TheaterMoviesService,
          useValue: {
            findReleasedMovies: jest.fn(),
            findUpcomingMovies: jest.fn(),  // 추가
            findMovieDetail: jest.fn(),  // 추가
          },
        },
      ],
    }).compile();

    controller = module.get<TheaterMoviesController>(TheaterMoviesController);
    service = module.get<TheaterMoviesService>(TheaterMoviesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getReleasedMovies', () => {
    it('개봉된 영화 목록을 반환해야 합니다', async () => {
      const result: MovieResponseDto[] = [
        {
          id: 1,
          title: '테스트 영화 1',
          releaseDate: '2023-01-01',
          posterPath: '/path/to/poster1.jpg',
        },
        {
          id: 2,
          title: '테스트 영화 2',
          releaseDate: '2023-01-02',
          posterPath: '/path/to/poster2.jpg',
        },
      ];

      jest.spyOn(service, 'findReleasedMovies').mockResolvedValue(result);

      expect(await controller.getReleasedMovies()).toBe(result);
      expect(service.findReleasedMovies).toHaveBeenCalled();
    });
  });

  describe('getUpcomingMovies', () => {
    it('개봉 예정 영화 목록을 반환해야 합니다', async () => {
      const result: MovieResponseDto[] = [
        {
          id: 3,
          title: '개봉 예정 영화 1',
          releaseDate: '2024-12-25',
          posterPath: '/path/to/poster3.jpg',
        },
        {
          id: 4,
          title: '개봉 예정 영화 2',
          releaseDate: '2024-12-31',
          posterPath: '/path/to/poster4.jpg',
        },
      ];

      jest.spyOn(service, 'findUpcomingMovies').mockResolvedValue(result);

      expect(await controller.getUpcomingMovies()).toBe(result);
      expect(service.findUpcomingMovies).toHaveBeenCalled();
    });
  });

  describe('getMovieDetail', () => {
    it('영화 상세 정보를 반환해야 합니다', async () => {
      const movieId = 1;
      const result: MovieDetailResponseDto = {
        id: movieId,
        title: '테스트 영화',
        releaseDate: '2023-01-01',
        posterPath: '/path/to/poster.jpg',
        overview: '이것은 테스트 영화입니다.',
        voteAverage: 8.5,
        voteCount: 100,
        providers: ['Theater A', 'Theater B'],
        theMovieDbId: 12345,
      };

      jest.spyOn(service, 'findMovieDetail').mockResolvedValue(result);

      expect(await controller.getMovieDetail(movieId)).toBe(result);
      expect(service.findMovieDetail).toHaveBeenCalledWith(movieId);
    });
  });
});
