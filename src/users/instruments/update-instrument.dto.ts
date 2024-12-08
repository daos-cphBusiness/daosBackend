import { PartialType } from '@nestjs/mapped-types';
import { IsOptional } from 'class-validator';
import { CreateInstrumentDto } from './create-instrument.dto';

export class UpdateInstrumentDto extends PartialType(CreateInstrumentDto) {
  @IsOptional()
  username?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  password?: string;
}
