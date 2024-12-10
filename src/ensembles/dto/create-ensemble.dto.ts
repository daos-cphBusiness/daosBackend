import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEnsembleDto {
  @IsString({ message: 'Name should only contain letters' })
  @IsNotEmpty({ message: 'Ensemble name required ' })
  name: string;

  @IsOptional()
  description: string;

  @IsNotEmpty({ message: 'Ensemble genre required ' })
  genre: string[];
}
