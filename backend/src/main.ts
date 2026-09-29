import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { json } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(helmet());
  app.use(json({ limit: '10mb' }));

  app.enableCors({
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter((origin): origin is string => Boolean(origin)),
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

void bootstrap();
