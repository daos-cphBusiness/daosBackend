import { Module } from '@nestjs/common';
import { EnsembleService } from './ensemble.service';
import { EnsembleController } from './ensemble.controller';

@Module({
  controllers: [EnsembleController],
  providers: [EnsembleService],
})
export class EnsembleModule {}
