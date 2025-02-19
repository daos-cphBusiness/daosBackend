import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnsembleDto } from './dto/create-ensemble.dto';
import { UpdateEnsembleDto } from './dto/update-ensemble.dto';
import { Ensemble, EnsembleDocument } from './schemas/ensemble.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';
import { SearchEnsembleDTO } from './dto/search-ensemble.dto';

@Injectable()
export class EnsemblesService {
  constructor(
    @InjectModel(Ensemble.name) private ensembleModel: Model<Ensemble>,
    private readonly userService: UsersService,
  ) {}

  async linkUsersToEnsemble(id: string, username: string) {
    try {
      const ensemble: EnsembleDocument = await this.ensembleModel.findById(id);
      const user: User = await this.userService.findByUsername(username);
      const UserIds = ensemble.users;
      for (const UserId of UserIds) {
        const foundUsername = await this.userService.getUsernameById(UserId);
        if (username === foundUsername) {
          throw new BadRequestException('You are already in the group.');
        }
      }
      ensemble.users.push(user);
      return ensemble.save();
    } catch (error) {
      //console.log('Error joining the group', error);
      throw error;
    }
  }

  async createEnsemble(createEnsembleDto: CreateEnsembleDto) {
    try {
      const nameCheck = await this.findByName(createEnsembleDto.name);
      if (nameCheck) {
        throw new ConflictException('Group name already taken');
      } else {
        const createdEnsemble = await new this.ensembleModel(createEnsembleDto);
        return createdEnsemble.save();
      }
    } catch (error) {
      //console.log('Error creating ensemble', error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Ensemble | undefined> {
    try {
      const ensemble = await this.ensembleModel.findOne({ name }).exec();
      return ensemble || undefined;
    } catch (error) {
      console.log('error finding the ensemble', error);
      throw error;
    }
  }

  findAll() {
    return this.ensembleModel.find().populate('users');
  }

  async findEnsembleById(id: string) {
    const emsemble = await this.ensembleModel.findById(id).populate('users');
    if (!emsemble) {
      throw new NotFoundException('Ensemble not found');
    }
    return emsemble;
  }

  async update(
    id: string,
    updateEnsembleDto: UpdateEnsembleDto,
  ): Promise<Ensemble> {
    const existingEnsemble = await this.ensembleModel.findById(id);

    if (!existingEnsemble) {
      throw new NotFoundException('Ensemble not found');
    }

    // Merge existing data with the new updates
    Object.assign(existingEnsemble, updateEnsembleDto);

    return existingEnsemble.save();
  }

  async remove(id: string): Promise<void> {
    try {
      // Attempt to find and delete the ensemble by ID
      const result = await this.ensembleModel.findByIdAndDelete(id);
      if (!result) {
        throw new NotFoundException('Ensemble not found');
      }
    } catch (error) {
      // Log and rethrow the error
      // console.error('Error deleting ensemble:', error);
      throw new InternalServerErrorException(
        'An error occurred while updating the user',
        error,
      );
    }
  }

  //function for testing purposes
  async deleteMany(): Promise<void> {
    await this.ensembleModel.deleteMany();
  }

  async findEnsemblesByUser(username: string) {
    const userId: string = await this.userService.getUserIdByUsername(username);
    const ensembles = await this.ensembleModel.find({ users: userId }).exec();
    return ensembles;
  }

  searchEnsemble(search: SearchEnsembleDTO) {
    const filter: any = {};
    if (search.name) {
      // Case-insensitive and partial matchsearch
      filter.name = { $regex: search.name, $options: 'i' };
    }
    if (search.genre) {
      filter.genre = { $regex: search.genre, $options: 'i' };
    }
    return this.ensembleModel.find(filter).exec();
  }
}
