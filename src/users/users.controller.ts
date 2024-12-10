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
  Req,
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
          'An error occurred while creating the user.',
          error,
        );
      }
    }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Patch()
  async update(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.usersService.updateUser(
        req.user.username,
        updateUserDto,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      } else if (error instanceof NotFoundException) {
        throw error;
      } else {
        // console.log(error);
        throw new InternalServerErrorException(
          'An error occurred while updating the user.',
          error,
        );
      }
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @Delete()
  async remove(@Req() req) {
    return await this.usersService.removeUser(req.user.username);
  }

  @HttpCode(HttpStatus.OK)
  @Get('search')
  async searchUser(@Query() searchUserDto: SearchUserDto) {
    return await this.usersService.searchUser(searchUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':username/instruments')
  async findAllInstruments(@Param('username') username: string) {
    return this.usersService.findAllInstruments(username);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('/instruments')
  async addInstrument(@Req() req, @Body() instrument: CreateInstrumentDto) {
    try {
      return await this.usersService.addInstrumentToUser(
        req.user.username,
        instrument,
      );
    } catch (error) {
      console.log('error adding instrument', error);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/instruments/:instrumentId')
  async removeInstrument(
    @Req() req,
    @Param('instrumentId') instrumentId: string,
  ) {
    try {
      return this.usersService.removeInstrumentFromUser(
        req.user.username,
        instrumentId,
      );
    } catch (error) {
      // console.log(error);
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/instruments/:instrumentId')
  async updateInstrument(
    @Req() req,
    @Param('instrumentId') instrumentId: string,
    @Body() updatedInstrument: UpdateInstrumentDto,
  ) {
    try {
      return this.usersService.updateInstrumentForUser(
        req.user.username,
        instrumentId,
        updatedInstrument,
      );
    } catch (error) {
      // console.log(error);
      throw error;
    }
  }
}
