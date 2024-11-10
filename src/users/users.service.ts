import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  //auth is using this to find the users
  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username }).exec();
    return user || undefined;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const createdUser = new this.userModel(updateUserDto);
    return createdUser.save();
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
