import { Test, TestingModule } from '@nestjs/testing';
import { StreamingMoviesService } from './streaming-movies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StreamingMovie } from './entities/streaming-movie.entity';
import { Repository } from 'typeorm';

describe('StreamingMoviesService', () => {
  let service: StreamingMoviesService;
  let mockRepository: Partial<Repository<StreamingMovie>>;

  beforeEach(async () => {
    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            title: '테스트 영화',
            poster_path: '/path/to/poster.jpg',
            release_date: '2023-01-01',
            movieProviders: [{ theProviderId: 1 }]
          }
        ])
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamingMoviesService,
        {
          provide: getRepositoryToken(StreamingMovie),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StreamingMoviesService>(StreamingMoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStreamingMovies', () => {
    it('넷플릭스 영화를 반환해야 한다', async () => {
      const result = await service.getStreamingMovies('netflix', 1);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('테스트 영화');
      expect(result[0].providers).toBe('넷플릭스');
    });

    it('디즈니플러스 영화를 반환해야 한다', async () => {
      mockRepository.createQueryBuilder = jest.fn().mockReturnValue({
        ...mockRepository.createQueryBuilder(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 2,
            title: '디즈니 영화',
            poster_path: '/path/to/disney.jpg',
            release_date: '2023-02-01',
            movieProviders: [{ theProviderId: 2 }]
          }
        ])
      });

      const result = await service.getStreamingMovies('disney', 1);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('디즈니 영화');
      expect(result[0].providers).toBe('디즈니플러스');
    });

    it('디즈니나 넷플릭스가 아닌 경우 모든 영화를 반환해야 한다', async () => {
      mockRepository.createQueryBuilder = jest.fn().mockReturnValue({
        ...mockRepository.createQueryBuilder(),
        getMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            title: '넷플릭스 영화',
            poster_path: '/path/to/netflix.jpg',
            release_date: '2023-01-01',
            movieProviders: [{ theProviderId: 1 }]
          },
          {
            id: 2,
            title: '디즈니 영화',
            poster_path: '/path/to/disney.jpg',
            release_date: '2023-02-01',
            movieProviders: [{ theProviderId: 2 }]
          }
        ])
      });

      const result = await service.getStreamingMovies('all', 1);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('넷플릭스 영화');
      expect(result[1].title).toBe('디즈니 영화');
      expect(mockRepository.createQueryBuilder().where).not.toHaveBeenCalled();
    });

    it('페이지네이션이 올바르게 처리되어야 한다', async () => {
      await service.getStreamingMovies('netflix', 2);
      expect(mockRepository.createQueryBuilder().skip).toHaveBeenCalledWith(6);
    });
  });
});
