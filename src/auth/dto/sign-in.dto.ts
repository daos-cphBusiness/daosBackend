import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsString({ message: 'Should only contain letters' })
  @IsNotEmpty({ message: 'Field Required ' })
  readonly username: string;

  @IsNotEmpty({ message: 'Field Required ' })
  readonly password: string;
}
