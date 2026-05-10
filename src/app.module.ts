import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { ChatModule } from './chat/chat.module';
import { Message } from './chat/entities/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.DB_HOST,
    //   port: Number(process.env.DB_PORT),
    //   username: process.env.DB_USERNAME,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_NAME,
    //   entities: [User, Message],
    //   synchronize: true,
    // }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: true, // ← true для первого запуска (создаст таблицы)
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      ssl: true, // ← Render требует SSL для Postgres
      extra: {
        ssl: {
          rejectUnauthorized: false, // ← нужно для Render
        },
      },
    }),

    AuthModule,
    ChatModule,
  ],
})
export class AppModule {}
