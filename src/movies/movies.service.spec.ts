import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { MovieQueryDto } from './dto/movie-query.dto';

describe('MoviesService', () => {
  let service: MoviesService;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
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
      ])
    };

    const mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder)
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockRepository,
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
      mockQueryBuilder.getMany.mockResolvedValueOnce([
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
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'movieProvider.theProviderId = :providerId',
        { providerId: 1 }
      );
    });

    it('디즈니플러스 영화만 반환해야 합니다', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([
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
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'movieProvider.theProviderId = :providerId',
        { providerId: 2 }
      );
    });

    it('프로바이더가 제공되지 않으면 필터를 적용하지 않아야 합니다', async () => {
      const query: MovieQueryDto = { page: 1 };
      await service.getStreamingMovies(query);

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('페이지네이션이 올바르게 적용되어야 합니다', async () => {
      const query: MovieQueryDto = { page: 2 };
      await service.getStreamingMovies(query);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(6);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(6);
    });
  });
});
