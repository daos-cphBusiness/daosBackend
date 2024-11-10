import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Should only contain letters' })
  @IsNotEmpty({ message: 'Field Required ' })
  readonly username: string;

  @IsNotEmpty({ message: 'Field Required ' })
  email: string;

  @IsNotEmpty({ message: 'Field Required ' })
  readonly password: string;
}
