import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnsembleService } from './ensemble.service';
import { CreateEnsembleDto } from './dto/create-ensemble.dto';
import { UpdateEnsembleDto } from './dto/update-ensemble.dto';

@Controller('ensemble')
export class EnsembleController {
  constructor(private readonly ensembleService: EnsembleService) {}

  @Post()
  create(@Body() createEnsembleDto: CreateEnsembleDto) {
    return this.ensembleService.create(createEnsembleDto);
  }

  @Get()
  findAll() {
    return this.ensembleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ensembleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnsembleDto: UpdateEnsembleDto) {
    return this.ensembleService.update(+id, updateEnsembleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ensembleService.remove(+id);
  }
}
