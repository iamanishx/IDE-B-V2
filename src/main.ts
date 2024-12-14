// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for client-side access
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  });

  // Use a global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Start the server on port 3000
  await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap();
