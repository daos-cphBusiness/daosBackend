import { Module } from '@nestjs/common';
import { EnsemblesService } from './ensembles.service';
import { EnsemblesController } from './ensembles.controller';
import { Ensemble, EnsembleSchema } from './schemas/ensemble.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ensemble.name, schema: EnsembleSchema },
    ]),
    UsersModule,
  ],
  controllers: [EnsemblesController],
  providers: [EnsemblesService],
})
export class EnsemblesModule {}
