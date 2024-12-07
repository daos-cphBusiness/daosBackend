import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Ensemble } from '../../ensembles/schemas/ensemble.schema';
import { User } from '../../users/schemas/user.schema';

export class CreatePostDto {
  @IsString({ message: 'Should only contain letters' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @IsNotEmpty({ message: 'Field Required' })
  title: string;

  @IsNotEmpty({ message: 'Field Required' })
  @MinLength(3, { message: 'Description must be at least 3 characters long' })
  description: string;

  @IsNotEmpty({ message: 'Field Required' })
  genre: string;

  @IsOptional()
  ensemble?: Ensemble;

  user: User;
}
