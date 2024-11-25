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
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User | null> {
    try {
      const usernameCheck = await this.findByUsernameWithConflictCheck(
        createUserDto.username,
      );
      const emailCheck = await this.findByEmailWithConflictCheck(
        createUserDto.email,
      );

      if (usernameCheck) {
        throw new ConflictException('Username already taken');
      } else if (emailCheck) {
        throw new ConflictException('Email already taken');
      } else {
        if (createUserDto.password) {
          createUserDto.password = await bcrypt.hash(
            createUserDto.password,
            10,
          );
        }
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
    if (!user) {
      throw new NotFoundException(
        'Could not find the user with the provided username',
      );
    }
    return user || undefined;
  }
  async findByUsernameWithConflictCheck(
    username: string,
  ): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username }).exec();
    if (user) {
      throw new ConflictException('The provided username is already in use');
    }
    return user || undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(
        'Could not find the user with the provided email',
      );
    }
    return user || undefined;
  }

  async findByEmailWithConflictCheck(email: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user) {
      throw new ConflictException('The provided email is already in use');
    }
    return user || undefined;
  }

  async updateUser(
    username: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const usernameCheck = await this.findByUsernameWithConflictCheck(
      updateUserDto.username,
    );
    const emailCheck = await this.findByEmailWithConflictCheck(
      updateUserDto.email,
    );
    try {
      // console.log(username);
      const user = await this.findByUsername(username);

      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (usernameCheck) {
        throw new ConflictException('Username already taken');
      } else if (emailCheck) {
        throw new ConflictException('Email already taken');
      } else {
        if (updateUserDto.password) {
          updateUserDto.password = await bcrypt.hash(
            updateUserDto.password,
            10,
          );
        }
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

  //function created for e2e test
  async deleteMany() {
    return this.userModel.deleteMany({}).exec();
  }

  //i dont remember why i created this function

  async getUserIdByUsername(username: string): Promise<string | null> {
    try {
      const user = await this.userModel
        .findOne({ username })
        .select('_id')
        .exec();
      return user ? user._id.toString() : null; // Convert ObjectId to string
    } catch (error) {
      console.log('Error getting Id by username', error);
    }
  }
}
