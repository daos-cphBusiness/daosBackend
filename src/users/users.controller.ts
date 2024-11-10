import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.createUser(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred while creating the user.',
        );
      }
    }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Patch(':username')
  async update(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      return await this.usersService.updateUser(username, updateUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred while updating the user.',
        );
      }
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @Delete(':username')
  async remove(@Param('username') username: string) {
    return await this.usersService.removeUser(username);
  }
}
