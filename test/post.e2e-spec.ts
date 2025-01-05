import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { TestModule } from '../src/test.module';
import { UsersService } from '../src/users/users.service';
import { AuthService } from '../src/auth/auth.service';
import { PostService } from '../src/post/post.service';
import { CreatePostDto } from '../src/post/dto/create-post.dto';

describe('PostController (e2e)', () => {
  let app: INestApplication;
  let userService: UsersService;
  let authService: AuthService;
  let postService: PostService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();
    userService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthService>(AuthService);
    postService = moduleFixture.get<PostService>(PostService);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (errors) => {
          const formattedErrors = errors.map((error) => ({
            field: error.property,
            message: Object.values(error.constraints).join(','),
          }));

          return new BadRequestException(formattedErrors);
        },
      }),
    );
    await app.init();
    await postService.deleteMany();
    await userService.deleteMany();
  });

  afterEach(async () => {
    await postService.deleteMany();
    await userService.deleteMany();
    await app.close();
  });

  describe('/posts (POST)', () => {
    it('should create a new post', async () => {
      const user = await userService.createUser({
        username: 'postuser',
        password: 'password',
        email: 'postuser@daos.com',
        fullName: 'full Name',
      });
      const loginResponse = await authService.signIn({
        username: 'postuser',
        password: 'password',
      });

      const authToken = loginResponse.access_token;

      const postData: CreatePostDto = {
        title: 'New post ',
        description: 'This is a test post',
        instrument: 'Violin',
        genre: ['Goofy', 'Classical'],
        user: user,
      };
      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(201);

      expect(response.body).toMatchObject({
        title: postData.title,
        description: postData.description,
      });
    });

    it('should return validation errors for invalid post', async () => {
      const user = await userService.createUser({
        username: 'newpostuser',
        password: 'password',
        email: 'newpostuser@daos.com',
        fullName: 'full Name',
      });
      const loginResponse = await authService.signIn({
        username: 'newpostuser',
        password: 'password',
      });

      const authToken = loginResponse.access_token;

      const postData = {
        description: 'This is a test post',
        instrument: 'Violin',
        genre: ['Goofy', 'Classical'],
        user: user,
      };

      const response = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData)
        .expect(400);

      expect(response.body.message).toEqual([
        { field: 'title', message: expect.any(String) },
      ]);
    });
  });

  describe('/posts/myPosts (GET)', () => {
    beforeEach(async () => {
      const user = await userService.createUser({
        username: 'mypostuser',
        password: 'password',
        email: 'mypostuser@daos.com',
        fullName: 'full Name',
      });

      const postData: CreatePostDto = {
        title: 'New post',
        description: 'This is a test post',
        instrument: 'Violin',
        genre: ['Goofy', 'Classical'],
        user: user,
      };

      await postService.create(postData, user.username);
    });

    it('should return all the posts of the user who is signed in', async () => {
      const loginResponse = await authService.signIn({
        username: 'mypostuser',
        password: 'password',
      });

      const authToken = loginResponse.access_token;
      const response = await request(app.getHttpServer())
        .get(`/posts/myPosts`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body[0].user.fullName).toEqual('full Name');
    });
  });

  describe('/posts/:username (GET)', () => {
    beforeEach(async () => {
      const user = await userService.createUser({
        username: 'postusername',
        password: 'password',
        email: 'postusername@daos.com',
        fullName: 'full Name',
      });

      const postData: CreatePostDto = {
        title: 'New post',
        description: 'This is a test post',
        instrument: 'Violin',
        genre: ['Goofy', 'Classical'],
        user: user,
      };

      await postService.create(postData, user.username);
    });

    it('should return all the posts of the user of the given username', async () => {
      const loginResponse = await authService.signIn({
        username: 'postusername',
        password: 'password',
      });

      const authToken = loginResponse.access_token;
      const response = await request(app.getHttpServer())
        .get(`/posts/${loginResponse.user.username}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body[0].title).toEqual('New post');
    });
  });

  describe('PATCH /posts/:id - Partial Updates', () => {
    it('should update only the title of the post', async () => {
      const user = await userService.createUser({
        username: 'patchusername',
        password: 'password',
        email: 'patchusername@daos.com',
        fullName: 'full Name',
      });

      const postData: CreatePostDto = {
        title: 'New post',
        description: 'This is a test post',
        instrument: 'Violin',
        genre: ['Goofy', 'Classical'],
        user: user,
      };

      const createResponse = await postService.create(postData, user.username);
      const createdPostId = createResponse._id;

      const response = await request(app.getHttpServer())
        .patch(`/posts/${createdPostId}`)
        .send({ title: 'Updated title' })
        .expect(200);

      expect(response.body.title).toBe('Updated title');
      expect(response.body.description).toBe('This is a test post');
    });

    it('should update only the description of the post', async () => {
      const user = await userService.createUser({
        username: 'patchusername',
        password: 'password',
        email: 'patchusername@daos.com',
        fullName: 'full Name',
      });

      const postData: CreatePostDto = {
        title: 'New post',
        description: 'This is a test post',
        instrument: 'Violin',
        genre: ['Goofy', 'Classical'],
        user: user,
      };

      const createResponse = await postService.create(postData, user.username);
      const createdPostId = createResponse._id;

      const response = await request(app.getHttpServer())
        .patch(`/posts/${createdPostId}`)
        .send({ description: 'This is updated post description' })
        .expect(200);

      expect(response.body.title).toBe('New post');
      expect(response.body.description).toBe(
        'This is updated post description',
      );
    });
  });
});
