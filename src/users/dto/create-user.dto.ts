import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Should only contain letters' })
  @IsNotEmpty({ message: 'Field Required ' })
  readonly username: string;

  @IsNotEmpty({ message: 'Field Required ' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsNotEmpty({ message: 'Field Required ' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  readonly password: string;
}
