import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Add body parser configuration
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Serve static files from uploads directory BEFORE any middleware
  // This ensures they get correct Content-Type without CORS interference
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Custom CORS middleware - skip /uploads to preserve correct Content-Type
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:64991',
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/
      ];

  app.use((req, res, next) => {
    // Skip CORS for /uploads to preserve correct Content-Type
    if (req.path.startsWith('/uploads')) {
      return next();
    }

    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:64991'
    ];

    if (allowedOrigins.includes(origin) || origin?.match(/^http:\/\/localhost:\d+$/) || origin?.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
    }

    // Set UTF-8 encoding for API responses
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
