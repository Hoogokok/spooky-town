import { Module } from '@nestjs/common';
import { StreamingMoviesService } from './streaming-movies.service';

@Module({
  providers: [StreamingMoviesService]
})
export class StreamingMoviesModule {}
