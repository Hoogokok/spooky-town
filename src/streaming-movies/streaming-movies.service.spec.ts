import { Test, TestingModule } from '@nestjs/testing';
import { StreamingMoviesService } from './streaming-movies.service';

describe('StreamingMoviesService', () => {
  let service: StreamingMoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StreamingMoviesService],
    }).compile();

    service = module.get<StreamingMoviesService>(StreamingMoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
