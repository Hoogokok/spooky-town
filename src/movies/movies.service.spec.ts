import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { MovieProvider } from './entities/movie-provider.entity';
import { MovieQueryDto } from './dto/movie-query.dto';
import { NotFoundException } from '@nestjs/common';

describe('MoviesService', () => {
  let service: MoviesService;
  let mockMovieRepository: any;
  let mockMovieProviderRepository: any;

  beforeEach(async () => {
    const mockQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(), // 이 줄을 추가
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          title: 'Netflix Movie',
          poster_path: '/netflix.jpg',
          release_date: '2023-01-01',
          movieProviders: [{ theProviderId: 1 }]
        },
        {
          id: 2,
          title: 'Disney Movie',
          poster_path: '/disney.jpg',
          release_date: '2023-02-01',
          movieProviders: [{ theProviderId: 2 }]
        }
      ]),
      getCount: jest.fn().mockResolvedValue(15)
    };

    mockMovieRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
      findOne: jest.fn()
    };

    mockMovieProviderRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder)
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
        {
          provide: getRepositoryToken(MovieProvider),
          useValue: mockMovieProviderRepository,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('서비스가 정의되어 있어야 합니다', () => {
    expect(service).toBeDefined();
  });

  describe('getStreamingMovies', () => {
    it('영화 배열을 반환해야 합니다', async () => {
      const query: MovieQueryDto = { page: 1 };
      const result = await service.getStreamingMovies(query);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Netflix Movie',
        posterPath: '/netflix.jpg',
        releaseDate: '2023-01-01',
        providers: '넷플릭스'
      });
      expect(result[1]).toEqual({
        id: 2,
        title: 'Disney Movie',
        posterPath: '/disney.jpg',
        releaseDate: '2023-02-01',
        providers: '디즈니플러스'
      });
    });

    it('넷플릭스 영화만 반환해야 합니다', async () => {
      mockMovieRepository.createQueryBuilder().getMany.mockResolvedValueOnce([
        {
          id: 1,
          title: 'Netflix Movie',
          poster_path: '/netflix.jpg',
          release_date: '2023-01-01',
          movieProviders: [{ theProviderId: 1 }]
        }
      ]);

      const query: MovieQueryDto = { provider: 'netflix', page: 1 };
      const result = await service.getStreamingMovies(query);

      expect(result).toHaveLength(1);
      expect(result[0].providers).toBe('넷플릭스');
      expect(mockMovieRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith(
        'movieProvider.theProviderId = :providerId',
        { providerId: 1 }
      );
    });

    it('디즈니플러스 영화만 반환해야 합니다', async () => {
      mockMovieRepository.createQueryBuilder().getMany.mockResolvedValueOnce([
        {
          id: 2,
          title: 'Disney Movie',
          poster_path: '/disney.jpg',
          release_date: '2023-02-01',
          movieProviders: [{ theProviderId: 2 }]
        }
      ]);

      const query: MovieQueryDto = { provider: 'disney', page: 1 };
      const result = await service.getStreamingMovies(query);

      expect(result).toHaveLength(1);
      expect(result[0].providers).toBe('디즈니플러스');
      expect(mockMovieRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith(
        'movieProvider.theProviderId = :providerId',
        { providerId: 2 }
      );
    });

    it('프로바이더가 제공되지 않으면 필터를 적용하지 않아야 합니다', async () => {
      const query: MovieQueryDto = { page: 1 };
      await service.getStreamingMovies(query);

      expect(mockMovieRepository.createQueryBuilder().andWhere).not.toHaveBeenCalled();
    });

    it('페이지네이션이 올바르게 적용되어야 합니다', async () => {
      const query: MovieQueryDto = { page: 2 };
      await service.getStreamingMovies(query);

      expect(mockMovieRepository.createQueryBuilder().skip).toHaveBeenCalledWith(6);
      expect(mockMovieRepository.createQueryBuilder().take).toHaveBeenCalledWith(6);
    });
  });

  describe('getTotalStreamingPages', () => {
    it('총 페이지 수를 올바르게 계산해야 합니다', async () => {
      const query: MovieQueryDto = { provider: 'netflix' };
      mockMovieProviderRepository.createQueryBuilder().getCount.mockResolvedValue(15);

      const result = await service.getTotalStreamingPages(query);

      expect(result).toBe(3); // 15개 항목, 페이지당 6개 항목 = 3 페이지
      expect(mockMovieProviderRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith(
        'movieProvider.theProviderId = :providerId',
        { providerId: 1 }
      );
    });
  });

  describe('getStreamingMovieDetail', () => {
    it('존재하는 영화의 상세 정보를 반환해야 합니다', async () => {
      const mockMovie = {
        id: 1,
        title: 'Test Movie',
        poster_path: '/test.jpg',
        release_date: '2023-01-01',
        overview: 'Test overview',
        vote_average: 8.5,
        vote_count: 100,
        theMovieDbId: 12345,
        movieProviders: [{ theProviderId: 1 }]
      };
      mockMovieRepository.findOne.mockResolvedValue(mockMovie);

      const result = await service.getStreamingMovieDetail(1);

      expect(result).toEqual({
        id: 1,
        title: 'Test Movie',
        posterPath: '/test.jpg',
        releaseDate: '2023-01-01',
        overview: 'Test overview',
        voteAverage: 8.5,
        voteCount: 100,
        providers: ['넷플릭스'],
        theMovieDbId: 12345
      });
    });

    it('존재하지 않는 영화 ID로 조회 시 NotFoundException을 던져야 합니다', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.getStreamingMovieDetail(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProviderMovies', () => {
    it('특정 프로바이더의 영화 목록을 반환해야 합니다', async () => {
      const mockMovies = [
        {
          id: 1,
          title: 'Netflix Movie',
          poster_path: '/netflix.jpg',
          release_date: '2023-01-01',
          movieProviders: [{ theProviderId: 1 }]
        }
      ];
      mockMovieRepository.createQueryBuilder().getMany.mockResolvedValue(mockMovies);

      const result = await service.getProviderMovies(1);

      expect(result).toEqual([
        {
          id: 1,
          title: 'Netflix Movie',
          posterPath: '/netflix.jpg',
          releaseDate: '2023-01-01',
          providers: '넷플릭스'
        }
      ]);
      expect(mockMovieRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith(
        'movieProvider.theProviderId = :providerId',
        { providerId: 1 }
      );
    });
  });
});