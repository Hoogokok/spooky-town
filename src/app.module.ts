import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TheaterMoviesModule } from './theater-movies/theater-movies.module';
import { StreamingMoviesModule } from './streaming-movies/streaming-movies.module';
  
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('database'),
    }),
    TheaterMoviesModule,
    StreamingMoviesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
