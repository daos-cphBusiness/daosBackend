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
} from '@nestjs/common';
import { EnsemblesService } from './ensembles.service';
import { CreateEnsembleDto } from './dto/create-ensemble.dto';
import { UpdateEnsembleDto } from './dto/update-ensemble.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('ensembles')
export class EnsemblesController {
  constructor(private readonly ensemblesService: EnsemblesService) {}

  @UseGuards(AuthGuard)
  @Post('/:id/users')
  linkEnsembles(@Param('id') id: string, @Req() req) {
    return this.ensemblesService.linkUsersToEnsemble(id, req.user.username);
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
    return this.ensemblesService.findOne(id);
  }

  @Patch(':id')
  async updateEnsemble(
    @Param('id') id: string,
    @Body() updateEnsembleDto: UpdateEnsembleDto,
  ) {
    return this.ensemblesService.update(id, updateEnsembleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ensemblesService.remove(id);
  }
}
