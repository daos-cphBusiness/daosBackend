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
  NotFoundException,
  Get,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { SearchUserDto } from '../users/dto/search-user.dto';
import { CreateInstrumentDto } from '../users/instruments/create-instrument.dto';
import { UpdateInstrumentDto } from '../users/instruments/update-instrument.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(HttpStatus.CREATED)
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
      } else if (error instanceof NotFoundException) {
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

  @Get('search')
  async searchUser(@Query() searchUserDto: SearchUserDto) {
    return await this.usersService.searchUser(searchUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':username/instruments')
  async findAllInstruments(@Param('username') username: string) {
    return this.usersService.findAllInstruments(username);
  }
  @Patch(':username/instruments')
  async addInstrument(
    @Param('username') username: string,
    @Body() instrument: CreateInstrumentDto,
  ) {
    try {
      return await this.usersService.addInstrumentToUser(username, instrument);
    } catch (error) {
      console.log('error adding instrument', error);
    }
  }

  @Delete(':username/instruments/:instrumentId')
  async removeInstrument(
    @Param('username') username: string,
    @Param('instrumentId') instrumentId: string,
  ) {
    return this.usersService.removeInstrumentFromUser(username, instrumentId);
  }

  @Patch(':username/instruments/:instrumentId')
  async updateInstrument(
    @Param('username') username: string,
    @Param('instrumentId') instrumentId: string,
    @Body() updatedInstrument: UpdateInstrumentDto,
  ) {
    return this.usersService.updateInstrumentForUser(
      username,
      instrumentId,
      updatedInstrument,
    );
  }
}
