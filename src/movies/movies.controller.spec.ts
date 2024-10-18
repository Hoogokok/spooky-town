import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { MovieQueryDto } from './dto/movie-query.dto';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testDbConfig } from '../../test/test-db.config';
import { Movie } from './entities/movie.entity';
import { MovieProvider } from './entities/movie-provider.entity';
import { NetflixHorrorExpiring } from './entities/netflix-horror-expiring.entity';
import { MovieTheater } from './entities/movie-theater.entity';
import { Theater } from './entities/theater.entity';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';

describe('MoviesController', () => {
  let controller: MoviesController;
  let module: TestingModule;
  let movieRepository: Repository<Movie>;
  let movieProviderRepository: Repository<MovieProvider>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDbConfig),
        TypeOrmModule.forFeature([Movie, MovieProvider, NetflixHorrorExpiring, MovieTheater, Theater, Review]),
      ],
      controllers: [MoviesController],
      providers: [MoviesService],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
    movieRepository = module.get('MovieRepository');
    movieProviderRepository = module.get('MovieProviderRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(async () => {
    // 데이터베이스 초기화 및 테스트 데이터 삽입
    await movieProviderRepository.clear(); // 이 줄을 먼저 실행
    await movieRepository.clear(); // 그 다음 이 줄 실행

    const movie = await movieRepository.save({
      id: 1,
      title: '테스트 영화',
      release_date: '2023-01-01',
      poster_path: '/test.jpg',
      theMovieDbId: 12345,
      overview: '테스트 영화 설명',
      runtime: 120,
      vote_average: 7.5,
      vote_count: 1000,
      popularity: 50.5,
      isTheatricalRelease: false,
    });

    await movieProviderRepository.save({
      movie: movie,
      theProviderId: 1, // Netflix
    });
  });

  it('컨트롤러가 정의되어 있어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  describe('getStreamingMovies', () => {
    it('영화 배열을 반환해야 합니다', async () => {
      const result = await controller.getStreamingMovies({} as MovieQueryDto);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('테스트 영화');
      expect(result[0].providers).toBe('넷플릭스');
    });
  });
});
