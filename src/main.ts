import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthGuard } from './auth/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONT_END_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST',
    allowedHeaders: 'Content-Type, Accept, X-API-Key',
  });
  app.setGlobalPrefix('api');
  app.useGlobalGuards(new AuthGuard());
  await app.listen(8080);
}
bootstrap();
