import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { EnsemblesModule } from './ensembles/ensembles.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/test-daos'),
    UsersModule,
    AuthModule,
    EnsemblesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class TestModule {}
