import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEnsembleDto {
  @IsString({ message: 'Name should only contain letters' })
  @IsNotEmpty({ message: 'Ensemble name required ' })
  name: string;

  @IsOptional()
  description: string;

  @IsString({ message: 'Genre should only contain letters' })
  @IsNotEmpty({ message: 'Ensemble genre required ' })
  genre: string[];
}
