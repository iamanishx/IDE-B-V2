 import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

   app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST','DELETE','PUT'],
    credentials: true,
  });

   app.useGlobalPipes(new ValidationPipe());
   
   await app.listen(3000);
  console.log('Server running on http://localhost:3000');
}
bootstrap();
