import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API prefix — all endpoints: /api/v1/...
  app.setGlobalPrefix('api/v1');

  // Global validation pipe (class-validator + class-transformer)
  // whitelist: strips unknown properties (anti-injection EIE-016)
  // forbidNonWhitelisted: throws 400 on unknown properties
  // transform: auto-converts query params to correct types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global exception filter — consistent error shape
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS — allow frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Backend EIE running at: http://localhost:${port}/api/v1`);
}

void bootstrap();
