import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthGuard } from './auth/auth.guard';

async function bootstrap() {
  const origins = [
    process.env.FRONTEND_URL, 
    process.env.FRONTEND_URL_2, 
    'http://localhost:5173'
  ].filter(Boolean);
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, X-API-Key, Authorization',
  });
  app.setGlobalPrefix('api');
  app.useGlobalGuards(new AuthGuard());
  await app.listen(8080);
}
bootstrap();
