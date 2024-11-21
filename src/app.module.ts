import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { EnsembleModule } from './ensemble/ensemble.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/daos'),
    UsersModule,
    AuthModule,
    EnsembleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
