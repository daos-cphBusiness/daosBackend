import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { TestModule } from '../src/test.module';
import { UsersService } from '../src/users/users.service';
import { UpdateUserDto } from '../src/users/dto/update-user.dto';
import { AuthService } from '../src/auth/auth.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userService: UsersService;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();
    userService = moduleFixture.get<UsersService>(UsersService);
    authService = moduleFixture.get<AuthService>(AuthService);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (errors) => {
          const formattedErrors = errors.map((error) => ({
            field: error.property,
            message: Object.values(error.constraints).join(', '),
          }));

          return new BadRequestException(formattedErrors);
        },
      }),
    );
    await app.init();
    await userService.deleteMany(); // Clean up users before each test
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users/', () => {
    it('should create a valid user', async () => {
      const validUser: CreateUserDto = {
        username: 'testuser',
        password: 'password',
        email: 'testuser@test.com',
        fullName: 'full Name',
      };

      const { body } = await request(app.getHttpServer())
        .post('/users/')
        .send(validUser)
        .expect(201);

      expect(body._id).toBeDefined();
      //  console.log(body);
    });
  });

  describe('users/', () => {
    it('should not create a user, invalid username, password and email', async () => {
      const invalidUser: CreateUserDto = {
        username: 'uu',
        password: 'pp',
        email: 'wrongEmail',
        fullName: 'fullName',
      };

      const { body } = await request(app.getHttpServer())
        .post('/users')
        .send(invalidUser)
        .expect(400);

      body.message.forEach((message) => {
        if (message.field === 'username') {
          expect(message.message).toEqual(
            'Username must be at least 3 characters long',
          );
        } else if (message.field === 'email') {
          expect(message.message).toEqual(
            'Please provide a valid email address',
          );
        } else if (message.field === 'password') {
          expect(message.message).toEqual(
            'Password must be at least 6 characters long',
          );
        }
      });

      //console.log(body);
    });
  });

  describe('users/newuser', () => {
    it('should return 401 when an unauthorized uesr tries to update thier credentials', async () => {
      await userService.createUser({
        username: 'newuser',
        password: 'password',
        email: 'newuser@daos.com',
        fullName: 'full Name',
      });
      const validUser: UpdateUserDto = {
        username: 'testuser',
        password: 'password',
        email: 'testuser@test.com',
        fullName: 'full Name',
      };

      await request(app.getHttpServer())
        .patch('/users')
        .send(validUser)
        .expect(401);
      //console.log(body);
    });
  });

  describe('users/newuser', () => {
    it('should update an logged in exisitng user when provided valid credentials', async () => {
      const validnewUser: CreateUserDto = {
        username: 'firstuser',
        password: 'password',
        email: 'firstuser@daos.com',
        fullName: 'full Name',
      };

      await userService.createUser(validnewUser);

      const loginResponse = await authService.signIn({
        username: 'firstuser',
        password: 'password',
      });

      const authToken = loginResponse.access_token;

      const validUser: UpdateUserDto = {
        username: 'seconduser',
        password: 'password',
        fullName: 'full Name',
      };

      const { body } = await request(app.getHttpServer())
        .patch('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validUser)
        .expect(200);

      expect(body).toHaveProperty('username', 'seconduser');
      expect(body).toHaveProperty('email', 'firstuser@daos.com');
      // console.log(body);
    });
  });

  describe('users/newuser', () => {
    it('should not update an logged in exisitng user when provided invalid credentials', async () => {
      await userService.createUser({
        username: 'newuser',
        password: 'password',
        email: 'newuser@daos.com',
        fullName: 'full Name',
      });

      const loginResponse = await authService.signIn({
        username: 'newuser',
        password: 'password',
      });

      const authToken = loginResponse.access_token;

      const invalidUser: UpdateUserDto = {
        username: 'un',
        password: 'ps',
        email: 'tt',
        fullName: 'full Name',
      };

      const { body } = await request(app.getHttpServer())
        .patch('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUser)
        .expect(400);

      body.message.forEach((message) => {
        if (message.field === 'username') {
          expect(message.message).toEqual(
            'Username must be at least 3 characters long',
          );
        } else if (message.field === 'email') {
          expect(message.message).toEqual(
            'Please provide a valid email address',
          );
        } else if (message.field === 'password') {
          expect(message.message).toEqual(
            'Password must be at least 6 characters long',
          );
        }
      });
      //console.log(body);
    });
  });

  describe('users', () => {
    it('should be able to delete oneself if is an authorized user', async () => {
      await userService.createUser({
        username: 'newuser',
        password: 'password',
        email: 'newuser@daos.com',
        fullName: 'full Name',
      });

      await request(app.getHttpServer()).delete('/users').expect(401);

      //console.log(body);
    });
  });

  describe('users', () => {
    it('should be able to delete oneself if is an authorized user', async () => {
      await userService.createUser({
        username: 'newuser',
        password: 'password',
        email: 'newuser@daos.com',
        fullName: 'full Name',
      });

      const loginResponse = await authService.signIn({
        username: 'newuser',
        password: 'password',
      });

      const authToken = loginResponse.access_token;

      const response = await request(app.getHttpServer())
        .delete('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      expect(response.body).toEqual({});
      // console.log(body);
    });
  });
});
