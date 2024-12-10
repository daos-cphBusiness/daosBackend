import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  HttpStatus,
  HttpCode,
  InternalServerErrorException,
} from '@nestjs/common';
import { EnsemblesService } from './ensembles.service';
import { CreateEnsembleDto } from './dto/create-ensemble.dto';
import { UpdateEnsembleDto } from './dto/update-ensemble.dto';
import { AuthGuard } from '../auth/auth.guard';
import { SearchEnsembleDTO } from '../ensembles/dto/search-ensemble.dto';

@Controller('ensembles')
export class EnsemblesController {
  constructor(private readonly ensemblesService: EnsemblesService) {}

  @Get('search')
  searchEnsemble(@Query() search: SearchEnsembleDTO) {
    return this.ensemblesService.searchEnsemble(search);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/:id/users')
  linkEnsembles(@Param('id') id: string, @Req() req) {
    return this.ensemblesService.linkUsersToEnsemble(id, req.user.username);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  create(@Body() createEnsembleDto: CreateEnsembleDto) {
    return this.ensemblesService.createEnsemble(createEnsembleDto);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.ensemblesService.findAll();
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('myEnsembles')
  async getEnseblesByUser(@Req() req) {
    try {
      return this.ensemblesService.findEnsemblesByUser(req.user.username);
    } catch (error) {
      console.log('oops', error);
      throw new InternalServerErrorException(error);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ensemblesService.findEnsembleById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async updateEnsemble(
    @Param('id') id: string,
    @Body() updateEnsembleDto: UpdateEnsembleDto,
  ) {
    return this.ensemblesService.update(id, updateEnsembleDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ensemblesService.remove(id);
  }
}
