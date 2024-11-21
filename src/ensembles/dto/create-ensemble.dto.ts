import { IsNotEmpty } from 'class-validator';

export class CreateEnsembleDto {
  @IsNotEmpty()
  name: string;

  description: string;
}
