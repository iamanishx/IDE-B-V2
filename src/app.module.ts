// src/app.module.ts
import * as dotenv from 'dotenv';
dotenv.config();
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { User } from './models/user.model';
 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host:process.env.DB_HOST,
      port:+process.env.DB_PORT,
      username:  process.env.DB_USER,
      password:process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [User],
      autoLoadModels: true,
      synchronize: true,  
      
    }),
    AuthModule,  
  ],
})
export class AppModule {}