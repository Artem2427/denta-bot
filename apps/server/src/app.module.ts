import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as path from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // process.cwd()-relative (not __dirname-relative): pnpm --filter server run
      // <script> / turbo always set cwd to apps/server, which stays correct across
      // both dev (ts-node/nest start --watch) and compiled `dist` (prod) builds,
      // unlike a __dirname-relative path which differs between the two.
      envFilePath: path.resolve(process.cwd(), '../../.env'),
      validate: validateEnv,
    }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
