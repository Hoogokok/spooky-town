import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MovieQueryDto } from './dto/movie-query.dto';
import { MovieProvider } from './entities/movie-provider.entity';
import { Movie } from './entities/movie.entity';
import { NetflixHorrorExpiring } from './entities/netflix-horror-expiring.entity';
import { MoviesService } from './movies.service';

describe('MoviesService', () => {
  let service: MoviesService;
  let mockMovieRepository: any;
  let mockMovieProviderRepository: any;
  let mockNetflixHorrorExpiringRepository: any;
  let movieRepository: Repository<Movie>;

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
      findOne: jest.fn(),
      find: jest.fn(), // 이 줄을 추가합니다
    };

    mockMovieProviderRepository = {
      createQueryBuilder: jest.fn(() => mockQueryBuilder)
    };

    mockNetflixHorrorExpiringRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
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
        {
          provide: getRepositoryToken(NetflixHorrorExpiring),
          useValue: mockNetflixHorrorExpiringRepository,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
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

    it('웨이브 영화만 반환해야 합니다', async () => {
      mockMovieRepository.createQueryBuilder().getMany.mockResolvedValueOnce([
        {
          id: 3,
          title: 'Wavve Movie',
          poster_path: '/wavve.jpg',
          release_date: '2023-03-01',
          movieProviders: [{ theProviderId: 3 }]
        }
      ]);

      const query: MovieQueryDto = { provider: 'wavve', page: 1 };
      const result = await service.getStreamingMovies(query);

      expect(result).toHaveLength(1);
      expect(result[0].providers).toBe('웨이브');
      expect(mockMovieRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith(
        'movieProvider.theProviderId = :providerId',
        { providerId: 3 }
      );
    });

    it('네이버 영화만 반환해야 합니다', async () => {
      mockMovieRepository.createQueryBuilder().getMany.mockResolvedValueOnce([
        {
          id: 4,
          title: 'Naver Movie',
          poster_path: '/naver.jpg',
          release_date: '2023-04-01',
          movieProviders: [{ theProviderId: 4 }]
        }
      ]);

      const query: MovieQueryDto = { provider: 'naver', page: 1 };
      const result = await service.getStreamingMovies(query);

      expect(result).toHaveLength(1);
      expect(result[0].providers).toBe('네이버');
      expect(mockMovieRepository.createQueryBuilder().andWhere).toHaveBeenCalledWith(
        'movieProvider.theProviderId = :providerId',
        { providerId: 4 }
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
        movieProviders: [{ theProviderId: 1 }],
        reviews: [
          {
            id: 1,
            reviewContent: 'Great movie!',
            created_at: new Date()
          }
        ]
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
        theMovieDbId: 12345,
        reviews: [
          {
            id: 1,
            content: 'Great movie!',
            createdAt: expect.any(String)
          }
        ]
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

  describe('getExpiringHorrorMovies', () => {
    it('만료 예정인 공포 영화 목록을 반환해야 합니다', async () => {
      const mockExpiringMovies = [
        { theMovieDbId: 1, expiredDate: new Date('2023-06-30') },
        { theMovieDbId: 2, expiredDate: new Date('2023-07-15') },
      ];
      mockNetflixHorrorExpiringRepository.find.mockResolvedValue(mockExpiringMovies);

      const mockMovies = [
        {
          id: 1,
          title: 'Horror Movie 1',
          poster_path: '/horror1.jpg',
          theMovieDbId: 1,
          movieProviders: [{ theProviderId: 1 }],
        },
        {
          id: 2,
          title: 'Horror Movie 2',
          poster_path: '/horror2.jpg',
          theMovieDbId: 2,
          movieProviders: [{ theProviderId: 1 }],
        },
      ];
      mockMovieRepository.createQueryBuilder().getMany.mockResolvedValue(mockMovies);

      const result = await service.getExpiringHorrorMovies();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        title: 'Horror Movie 1',
        posterPath: '/horror1.jpg',
        expiringDate: '2023-06-30',
        providers: '넷플릭스',
      });
      expect(result[1]).toEqual({
        id: 2,
        title: 'Horror Movie 2',
        posterPath: '/horror2.jpg',
        expiringDate: '2023-07-15',
        providers: '넷플릭스',
      });
    });
  });

  describe('getExpiringHorrorMovieDetail', () => {
    it('만료 예정인 공포 영화의 상세 정보를 반환해야 합니다', async () => {
      const mockMovie = {
        id: 1,
        title: 'Horror Movie 1',
        poster_path: '/horror1.jpg',
        overview: 'A scary movie',
        vote_average: 7.5,
        vote_count: 1000,
        theMovieDbId: 1,
        movieProviders: [{ theProviderId: 1 }],
        reviews: [
          {
            id: 1,
            reviewContent: 'Scary!',
            created_at: new Date()
          }
        ]
      };
      mockMovieRepository.findOne.mockResolvedValue(mockMovie);

      const mockExpiringMovie = {
        theMovieDbId: 1,
        expiredDate: new Date('2023-06-30'),
      };
      mockNetflixHorrorExpiringRepository.findOne.mockResolvedValue(mockExpiringMovie);

      const result = await service.getExpiringHorrorMovieDetail(1);

      expect(result).toEqual({
        id: 1,
        title: 'Horror Movie 1',
        posterPath: '/horror1.jpg',
        expiringDate: '2023-06-30',
        overview: 'A scary movie',
        voteAverage: 7.5,
        voteCount: 1000,
        providers: ['넷플릭스'],
        theMovieDbId: 1,
        reviews: [
          {
            id: 1,
            content: 'Scary!',
            createdAt: expect.any(String)
          }
        ]
      });
    });

    it('존재하지 않는 영화 ID로 조회 시 NotFoundException을 던져야 합니다', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.getExpiringHorrorMovieDetail(999)).rejects.toThrow(NotFoundException);
    });

    it('만료 예정이 아닌 영화 ID로 조회 시 NotFoundException을 던져야 합니다', async () => {
      const mockMovie = {
        id: 1,
        theMovieDbId: 1,
      };
      mockMovieRepository.findOne.mockResolvedValue(mockMovie);
      mockNetflixHorrorExpiringRepository.findOne.mockResolvedValue(null);

      await expect(service.getExpiringHorrorMovieDetail(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUpcomingMovies', () => {
    it('개봉 예정 영화 목록을 반환해야 합니다', async () => {
      const mockMovies = [
        {
          id: 1,
          title: '개봉 예정 영화 1',
          release_date: '2023-07-01',
          poster_path: '/poster1.jpg',
          isTheatricalRelease: true,
          theMovieDbId: 1,
          movieTheaters: [],
          overview: '개봉 예정 영화 1',
          vote_average: 8.5,
          vote_count: 100,
          movieProviders: [],
        },
        {
          id: 2,
          title: '개봉 예정 영화 2',
          release_date: '2023-07-15',
          poster_path: '/poster2.jpg',
          isTheatricalRelease: true,
          theMovieDbId: 2,
          movieTheaters: [],
          overview: '개봉 예정 영화 2',
          vote_average: 7.5,
          vote_count: 200,
          movieProviders: [],
        },
      ];

      mockMovieRepository.find.mockResolvedValue(mockMovies);

      const result = await service.findUpcomingMovies('2023-06-01');

      expect(result).toEqual([
        {
          id: 1,
          title: '개봉 예정 영화 1',
          releaseDate: '2023-07-01',
          posterPath: '/poster1.jpg',
        },
        {
          id: 2,
          title: '개봉 예정 영화 2',
          releaseDate: '2023-07-15',
          posterPath: '/poster2.jpg',
        },
      ]);

      expect(mockMovieRepository.find).toHaveBeenCalledWith({
        where: { 
          release_date: expect.any(Object),
          isTheatricalRelease: true
        },
        relations: ['movieTheaters', 'movieTheaters.theater'],
        order: { release_date: 'ASC' },
      });
    });
  });

  describe('findReleasedMovies', () => {
    it('이미 개봉된 영화 목록을 반환해야 합니다', async () => {
      const mockMovies = [
        {
          id: 1,
          title: '개봉된 영화 1',
          release_date: '2023-05-01',
          poster_path: '/poster1.jpg',
          isTheatricalRelease: true,
        },
        {
          id: 2,
          title: '개봉된 영화 2',
          release_date: '2023-05-15',
          poster_path: '/poster2.jpg',
          isTheatricalRelease: true,
        },
      ];

      mockMovieRepository.find.mockResolvedValue(mockMovies);

      const result = await service.findReleasedMovies('2023-06-01');

      expect(result).toEqual([
        {
          id: 1,
          title: '개봉된 영화 1',
          releaseDate: '2023-05-01',
          posterPath: '/poster1.jpg',
        },
        {
          id: 2,
          title: '개봉된 영화 2',
          releaseDate: '2023-05-15',
          posterPath: '/poster2.jpg',
        },
      ]);

      expect(mockMovieRepository.find).toHaveBeenCalledWith({
        where: { 
          release_date: expect.any(Object),
          isTheatricalRelease: true
        },
        order: { release_date: 'DESC' },
      });
    });
  });

  describe('findTheatricalMovieDetail', () => {
    it('존재하는 극장 개봉 영화의 상세 정보를 반환해야 합니다', async () => {
      const mockMovie = {
        id: 1,
        title: '극장 영화 1',
        poster_path: '/poster1.jpg',
        release_date: '2023-07-01',
        overview: '재미있는 영화입니다.',
        vote_average: 8.5,
        vote_count: 1000,
        theMovieDbId: 12345,
        isTheatricalRelease: true,
        movieTheaters: [
          { theater: { name: '극장 A' } },
          { theater: { name: '극장 B' } }
        ],
        reviews: [
          {
            id: 1,
            reviewContent: '좋은 영화였습니다!',
            created_at: new Date()
          }
        ]
      };

      mockMovieRepository.findOne.mockResolvedValue(mockMovie);

      const result = await service.findTheatricalMovieDetail(1);

      expect(result).toEqual({
        id: 1,
        title: '극장 영화 1',
        posterPath: '/poster1.jpg',
        releaseDate: '2023-07-01',
        overview: '재미있는 영화입니다.',
        voteAverage: 8.5,
        voteCount: 1000,
        providers: ['극장 A', '극장 B'],
        theMovieDbId: 12345,
        reviews: [
          {
            id: 1,
            content: '좋은 영화였습니다!',
            createdAt: expect.any(String)
          }
        ]
      });

      expect(mockMovieRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, isTheatricalRelease: true },
        relations: ['movieTheaters', 'movieTheaters.theater','reviews']
      });
    });

    it('존재하지 않는 영화 ID로 조회 시 NotFoundException을 던져야 합니다', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.findTheatricalMovieDetail(999)).rejects.toThrow(NotFoundException);
    });
  });
});