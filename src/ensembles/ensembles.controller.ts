import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EnsemblesService } from './ensembles.service';
import { CreateEnsembleDto } from './dto/create-ensemble.dto';
import { linkUserToEnsembleDto } from '../../src/users/dto/link-user-to-ensemble.dto';

@Controller('ensembles')
export class EnsemblesController {
  constructor(private readonly ensemblesService: EnsemblesService) {}

  @Post('/:id/users')
  linkEnsembles(
    @Param('id') id: string,
    @Body() linkUserDto: linkUserToEnsembleDto,
  ) {
    return this.ensemblesService.linkUsersToEnsemble(id, linkUserDto);
  }

  @Post()
  create(@Body() createEnsembleDto: CreateEnsembleDto) {
    return this.ensemblesService.createEnsemble(createEnsembleDto);
  }

  @Get()
  findAll() {
    return this.ensemblesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ensemblesService.findOne(+id);
  }

  @Patch(':id')
  update() {
    return 'we are update';
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ensemblesService.remove(+id);
  }
}
