import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MovieQueryDto } from './dto/movie-query.dto';

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
    it('MoviesService의 getStreamingMovies 메서드를 호출해야 합니다', async () => {
      const query: MovieQueryDto = { provider: 'netflix', page: 1 };
      const expectedResult = [{ id: 1, title: 'Test Movie', posterPath: '/test.jpg', releaseDate: '2023-01-01', providers: '넷플릭스' }];
      
      jest.spyOn(moviesService, 'getStreamingMovies').mockResolvedValue(expectedResult);

      const result = await controller.getStreamingMovies(query);

      expect(moviesService.getStreamingMovies).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });
});
