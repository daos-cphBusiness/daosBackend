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
import { SearchUserDto } from '../users/dto/search-user.dto';
import { CreateInstrumentDto } from '../users/instruments/create-instrument.dto';
import { UpdateInstrumentDto } from '../users/instruments/update-instrument.dto';
import { Instrument } from '../users/instruments/instrument.schema';

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
      // console.log('here 2', username);
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

  // this function is created for e2e test
  async deleteMany() {
    return this.userModel.deleteMany({}).exec();
  }

  async getUsernameById(userId: User): Promise<string | null> {
    try {
      const user = await this.userModel
        .findById(userId)
        .select('username')
        .exec();

      return user ? user.username : null;
    } catch (error) {
      console.error('Error getting username by ID:', error);
      throw error;
    }
  }

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

  searchUser(search: SearchUserDto) {
    const filter: any = {};
    if (search.username) {
      // Case-insensitive and partial matchsearch
      filter.username = { $regex: search.username, $options: 'i' };
    }
    return this.userModel.find(filter).exec();
  }

  findAll() {
    return this.userModel.find();
  }

  async findAllInstruments(username: string): Promise<Instrument[]> {
    const userId = await this.getUserIdByUsername(username);
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('No user found');
    }

    const allInstruments: Instrument[] = [];

    user.instruments.forEach((instrument) => {
      allInstruments.push(instrument);
    });

    return allInstruments;
  }

  async addInstrumentToUser(
    username: string,
    instrumentData: CreateInstrumentDto,
  ): Promise<User> {
    const userId = await this.getUserIdByUsername(username);
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.instruments.push(instrumentData);
    return await user.save();
  }

  async removeInstrumentFromUser(username: string, instrumentId: string) {
    const userId = await this.getUserIdByUsername(username);
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $pull: { instruments: { _id: instrumentId } } },
        { new: true },
      )
      .exec();
  }

  async updateInstrumentForUser(
    username: string,
    instrumentId: string,
    updatedInstrument: UpdateInstrumentDto,
  ) {
    const userId = await this.getUserIdByUsername(username);
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.userModel
      .findOneAndUpdate(
        { _id: userId, 'instruments._id': instrumentId },
        {
          $set: {
            'instruments.$.name': updatedInstrument.name,
            'instruments.$.genre': updatedInstrument.genre,
          },
        },
        { new: true },
      )
      .exec();
  }
}
