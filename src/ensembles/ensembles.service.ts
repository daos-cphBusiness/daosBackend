import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnsembleDto } from './dto/create-ensemble.dto';
import { UpdateEnsembleDto } from './dto/update-ensemble.dto';
import { Ensemble, EnsembleDocument } from './schemas/ensemble.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { linkUserToEnsembleDto } from 'src/users/dto/link-user-to-ensemble.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class EnsemblesService {
  constructor(
    @InjectModel(Ensemble.name) private ensembleModel: Model<Ensemble>,
    private readonly userService: UsersService,
  ) {}

  async linkUsersToEnsemble(id: string, linkUserDto: linkUserToEnsembleDto) {
    try {
      const ensemble: EnsembleDocument = await this.ensembleModel.findById(id);
      const user: User = await this.userService.findByUsername(
        linkUserDto.username,
      );
      ensemble.users.push(user);
      return ensemble.save();
    } catch (error) {
      console.log('Error joining the group', error);
      throw error;
    }
  }

  async createEnsemble(createEnsembleDto: CreateEnsembleDto) {
    try {
      const nameCheck = await this.findByName(createEnsembleDto.name);
      if (nameCheck) {
        throw new ConflictException('Group name already taken');
      } else {
        console.log('here', createEnsembleDto.description);
        const createdEnsemble = await new this.ensembleModel(createEnsembleDto);
        return createdEnsemble.save();
      }
    } catch (error) {
      console.log('Error creating ensemble', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Ensemble | undefined> {
    try {
      const ensemble = await this.ensembleModel.findOne({ name }).exec();
      return ensemble || undefined;
    } catch (error) {
      console.log('error finding the enseble', error);
    }
  }

  findAll() {
    return this.ensembleModel.find().populate('users');
  }

  async findOne(id: string) {
    const emsemble = await this.ensembleModel.findById(id).populate('users');
    console.log(emsemble);
    if (!emsemble) {
      throw new NotFoundException(`Ensemble with ID ${id} not found`);
    }

    return emsemble;
  }

  async update(
    id: string,
    updateEnsembleDto: UpdateEnsembleDto,
  ): Promise<Ensemble> {
    const existingEnsemble = await this.ensembleModel.findById(id);

    if (!existingEnsemble) {
      throw new NotFoundException(`Ensemble with ID ${id} not found`);
    }

    // Merge existing data with the new updates
    Object.assign(existingEnsemble, updateEnsembleDto);

    return existingEnsemble.save();
  }

  async remove(id: string): Promise<{ message: string }> {
    try {
      // Attempt to find and delete the ensemble by ID
      const result = await this.ensembleModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException(`Ensemble with id ${id} not found`);
      }
      return {
        message: `Ensemble with id ${id} has been successfully deleted`,
      };
    } catch (error) {
      // Log and rethrow the error
      console.error('Error deleting ensemble:', error);
      throw error;
    }
  }

  //function for testing purposes
  async deleteMany(): Promise<void> {
    await this.ensembleModel.deleteMany();
  }
}
