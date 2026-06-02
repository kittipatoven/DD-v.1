import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

function buildAllowedOrigins(): (string | RegExp)[] {
  const fromEnv = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean);
  if (fromEnv?.length) {
    return fromEnv;
  }
  return [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
    /^https:\/\/localhost:\d+$/,
  ];
}

function isOriginAllowed(origin: string | undefined, allowed: (string | RegExp)[]): boolean {
  if (!origin) return true;
  return allowed.some((entry) =>
    typeof entry === 'string' ? entry === origin : entry.test(origin)
  );
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const allowedOrigins = buildAllowedOrigins();

  app.use((req, res, next) => {
    if (req.path.startsWith('/uploads')) {
      return next();
    }

    const origin = req.headers.origin as string | undefined;
    if (isOriginAllowed(origin, allowedOrigins)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
      );
      res.header('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on port ${port}`);
  console.log(`CORS origins: ${process.env.CORS_ORIGIN || '(dev defaults)'}`);
}
bootstrap();
