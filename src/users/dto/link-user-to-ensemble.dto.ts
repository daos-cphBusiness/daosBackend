import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class linkUserToEnsembleDto {
  @IsString({ message: 'Should only contain letters' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @IsNotEmpty({ message: 'Field Required ' })
  username: string;
}
