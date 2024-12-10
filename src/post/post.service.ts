import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './schemas/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly userService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto, username: string) {
    const user: User = await this.userService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    createPostDto.user = user;
    const createdPost = await new this.postModel(createPostDto);
    return await createdPost.save();
  }

  async findPostByUser(username: any) {
    const userId = await this.userService.getUserIdByUsername(username);
    const posts = await this.postModel.find({ user: userId }).exec();
    return posts.map((post) => post.title);
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    // console.log(id);
    try {
      const updatedpost = await this.postModel.findOneAndUpdate(
        { _id: id },
        { $set: updatePostDto },
        { new: true },
      );
      console.log(updatedpost);
      return updatedpost;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      await this.postModel.deleteOne({ _id: id });
      return {
        message: 'Post has been successfully deleted',
      };
    } catch (error) {
      console.log('Error deleting the post', error);
    }
  }
}
