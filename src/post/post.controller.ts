import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  InternalServerErrorException,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPostDto: CreatePostDto, @Req() req) {
    try {
      return this.postService.create(createPostDto, req.user.username);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('myPosts')
  async getPostsByUser(@Req() req) {
    // console.log(req);
    try {
      return this.postService.findPostByUser(req.user.username);
    } catch (error) {
      console.log('oops', error);
      throw new InternalServerErrorException(error);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:username')
  async getPostsByUsername(@Param('username') username: string) {
    // console.log(req);
    try {
      return this.postService.findPostByUser(username);
    } catch (error) {
      console.log('oops', error);
      throw new InternalServerErrorException(error);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllPosts() {
    // console.log(req);
    try {
      return this.postService.findAllPosts();
    } catch (error) {
      console.log('oops', error);
      throw new InternalServerErrorException(error);
    }
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
