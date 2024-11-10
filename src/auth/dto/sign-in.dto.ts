import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsString({ message: 'Should only contain letters' })
  @IsNotEmpty({ message: 'Field Required ' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  readonly username: string;

  @IsNotEmpty({ message: 'Field Required ' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  readonly password: string;
}
