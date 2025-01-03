import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString({ message: 'Should only contain letters' })
  @MinLength(3, {
    message: 'First and Last name must be at least 3 characters long',
  })
  fullName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Your current password is incorrect' })
  oldPassword?: string;
}
