import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TheaterMoviesService } from './theater-movies.service';
import { Movie } from './entities/movie.entity';
import { Theater } from './entities/theater.entity';
import { MovieTheater } from './entities/movie-theater.entity';
import { MovieResponseDto, MovieDetailResponseDto } from './dto/movie-response.dto';

describe('TheaterMoviesService', () => {
  let service: TheaterMoviesService;
  let movieRepository: Repository<Movie>;

  const mockMovieRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TheaterMoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
        {
          provide: getRepositoryToken(Theater),
          useValue: {},
        },
        {
          provide: getRepositoryToken(MovieTheater),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TheaterMoviesService>(TheaterMoviesService);
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  it('정의 되어 있어야 한다.', () => {
    expect(service).toBeDefined();
  });

  describe('findUpcomingMovies', () => {
    it('개봉 예정 영화 배열을 반환해야 합니다', async () => {
      const mockMovies = [
        {
          id: 1,
          title: 'Test Movie 1',
          releaseDate: '2023-12-24',
          posterPath: '/path/to/poster1.jpg',
          movieTheaters: [],
        },
        {
          id: 2,
          title: 'Test Movie 2',
          releaseDate: '2023-12-26',
          posterPath: '/path/to/poster2.jpg',
          movieTheaters: [],
        },
      ];

      mockMovieRepository.find.mockResolvedValue(mockMovies);

      const result = await service.findUpcomingMovies('2023-12-24');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Test Movie 1',
        releaseDate: '2023-12-24',
        posterPath: '/path/to/poster1.jpg',
      });
      expect(result[1]).toEqual({
        id: 2,
        title: 'Test Movie 2',
        releaseDate: '2023-12-26',
        posterPath: '/path/to/poster2.jpg',
      });

      expect(movieRepository.find).toHaveBeenCalledWith({
        where: { releaseDate: expect.any(Object) },
        relations: ['movieTheaters', 'movieTheaters.theater'],
        order: { releaseDate: 'ASC' },
      });
    });
  });

  describe('findReleasedMovies', () => {
    it('개봉된 영화 배열을 반환해야 합니다', async () => {
      const mockMovies = [
        {
          id: 1,
          title: 'Test Movie 1',
          releaseDate: '2023-12-24',
          posterPath: '/path/to/poster1.jpg',
          movieTheaters: [],
        },
        {
          id: 2,
          title: 'Test Movie 2',
          releaseDate: '2023-12-26',
          posterPath: '/path/to/poster2.jpg',
          movieTheaters: [],
        },
      ];

      mockMovieRepository.find.mockResolvedValue(mockMovies);

      const result = await service.findReleasedMovies('2023-12-27');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Test Movie 1',
        releaseDate: '2023-12-24',
        posterPath: '/path/to/poster1.jpg',
      });
      expect(result[1]).toEqual({
        id: 2,
        title: 'Test Movie 2',
        releaseDate: '2023-12-26',
        posterPath: '/path/to/poster2.jpg',
      });

      expect(movieRepository.find).toHaveBeenCalledWith({
        where: { releaseDate: expect.any(Object) },
        relations: ['movieTheaters', 'movieTheaters.theater'],
        order: { releaseDate: 'DESC' },
      });
    });
  });

  describe('findMovieDetail', () => {
    it('영화 상세 정보를 반환해야 합니다', async () => {
      const mockMovie = {
        id: 1,
        title: 'Test Movie',
        releaseDate: '2023-12-24',
        posterPath: '/path/to/poster.jpg',
        overview: 'This is a test movie',
        voteAverage: 8.5,
        voteCount: 100,
        theMovieDbId: 12345,
        movieTheaters: [
          { theater: { name: 'Theater 1' } },
          { theater: { name: 'Theater 2' } },
        ],
      };

      mockMovieRepository.findOne.mockResolvedValue(mockMovie);

      const result = await service.findMovieDetail(1);

      expect(result).toEqual({
        id: 1,
        title: 'Test Movie',
        releaseDate: '2023-12-24',
        posterPath: '/path/to/poster.jpg',
        overview: 'This is a test movie',
        voteAverage: 8.5,
        voteCount: 100,
        providers: ['Theater 1', 'Theater 2'],
        theMovieDbId: 12345,
      });

      expect(movieRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['movieTheaters', 'movieTheaters.theater'],
      });
    });

    it('영화를 찾을 수 없을 때 에러를 던져야 합니다', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.findMovieDetail(999)).rejects.toThrow('영화를 찾을 수 없습니다');

      expect(movieRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
        relations: ['movieTheaters', 'movieTheaters.theater'],
      });
    });
  });
});
