import { ConflictException, Injectable } from '@nestjs/common';
import { CreateEnsembleDto } from './dto/create-ensemble.dto';
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

  findOne(id: number) {
    return this.ensembleModel.findById(id).populate('users');
  }

  // update(id: number, updateEnsembleDto: UpdateEnsembleDto) {
  //   return `This action updates a #${id} ensemble`;
  // }

  remove(id: number) {
    return `This action removes a #${id} ensemble`;
  }
}
