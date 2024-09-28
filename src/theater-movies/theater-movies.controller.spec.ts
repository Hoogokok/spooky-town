import { Test, TestingModule } from '@nestjs/testing';
import { TheaterMoviesController } from './theater-movies.controller';
import { TheaterMoviesService } from './theater-movies.service';
import { MovieResponseDto } from './dto/movie-response.dto';

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
});
