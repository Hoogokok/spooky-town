import { Test, TestingModule } from '@nestjs/testing';
import { TheaterMoviesService } from './theater-movies.service';

describe('TheaterMoviesService', () => {
  let service: TheaterMoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TheaterMoviesService],
    }).compile();

    service = module.get<TheaterMoviesService>(TheaterMoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
