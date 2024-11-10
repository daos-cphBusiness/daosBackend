import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User | null> {
    try {
      const usernameCheck = await this.findByUsername(createUserDto.username);
      const emailCheck = await this.findByEmail(createUserDto.email);

      if (usernameCheck) {
        throw new ConflictException('Username already taken');
      } else if (emailCheck) {
        throw new ConflictException('Email already taken');
      } else {
        const createdUser = await new this.userModel(createUserDto);
        return await createdUser.save();
      }
    } catch (error) {
      console.log('Error creating user', error);
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username }).exec();
    return user || undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ email }).exec();
    return user || undefined;
  }

  async updateUser(
    username: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const usernameCheck = await this.findByUsername(updateUserDto.username);
    const emailCheck = await this.findByEmail(updateUserDto.email);
    try {
      const user = await this.findByUsername(username);

      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (usernameCheck) {
        throw new ConflictException('Username already taken');
      } else if (emailCheck) {
        throw new ConflictException('Email already taken');
      } else {
        const updatedUser = await this.userModel.findOneAndUpdate(
          { username },
          { $set: updateUserDto },
          { new: true },
        );
        return updatedUser;
      }
    } catch (error) {
      console.log('Error updating the user', error);
      throw error;
    }
  }

  async removeUser(username: string) {
    try {
      const usernameUser = await this.findByUsername(username);

      if (usernameUser) {
        await this.userModel.deleteOne(usernameUser);
      } else {
        return new NotFoundException('Username could not be found');
      }
    } catch (error) {
      console.log('Error deleting the user', error);
    }
  }
}
