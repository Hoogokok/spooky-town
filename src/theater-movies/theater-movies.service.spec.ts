import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TheaterMoviesService } from './theater-movies.service';
import { Movie } from './entities/movie.entity';
import { Theater } from './entities/theater.entity';
import { MovieTheater } from './entities/movie-theater.entity';
import { MovieResponseDto } from './dto/movie-response.dto';

describe('TheaterMoviesService', () => {
  let service: TheaterMoviesService;
  let movieRepository: Repository<Movie>;

  const mockMovieRepository = {
    find: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUpcomingMovies', () => {
    it('should return an array of upcoming movies', async () => {
      const mockMovies = [
        {
          id: 1,
          title: 'Test Movie 1',
          releaseDate: '2023-12-25',
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
        releaseDate: '2023-12-25',
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
});
