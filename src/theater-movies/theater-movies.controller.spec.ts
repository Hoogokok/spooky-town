import { Test, TestingModule } from '@nestjs/testing';
import { TheaterMoviesController } from './theater-movies.controller';

describe('TheaterMoviesController', () => {
  let controller: TheaterMoviesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TheaterMoviesController],
    }).compile();

    controller = module.get<TheaterMoviesController>(TheaterMoviesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
