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

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userService: UsersService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();
    userService = moduleFixture.get<UsersService>(UsersService);

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
      });
      const validUser: UpdateUserDto = {
        username: 'testuser',
        password: 'password',
        email: 'testuser@test.com',
      };

      await request(app.getHttpServer())
        .patch('/users/newuser')
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
      };
      await request(app.getHttpServer())
        .post('/auth/signUp')
        .send(validnewUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'firstuser',
          password: 'password',
        });

      const authToken = loginResponse.body.access_token;

      const validUser: UpdateUserDto = {
        username: 'seconduser',
        password: 'password',
        email: 'seconduser@test.com',
      };

      const { body } = await request(app.getHttpServer())
        .patch('/users/firstuser')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validUser)
        .expect(200);

      expect(body).toHaveProperty('username', 'seconduser');
      expect(body).toHaveProperty('email', 'seconduser@test.com');
      // console.log(body);
    });
  });

  describe('users/newuser', () => {
    it('should not update an logged in exisitng user when provided invalid credentials', async () => {
      await userService.createUser({
        username: 'newuser',
        password: 'password',
        email: 'newuser@daos.com',
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'newuser',
          password: 'password',
        });

      const authToken = loginResponse.body.access_token;

      const invalidUser: UpdateUserDto = {
        username: 'un',
        password: 'ps',
        email: 'tt',
      };

      const { body } = await request(app.getHttpServer())
        .patch('/users/newuser')
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

  describe('users/newuser', () => {
    it('should be able to delete oneself if is an authorized user', async () => {
      await userService.createUser({
        username: 'newuser',
        password: 'password',
        email: 'newuser@daos.com',
      });

      await request(app.getHttpServer()).delete('/users/newuser').expect(401);

      //console.log(body);
    });
  });

  describe('users/newuser', () => {
    it('should be able to delete oneself if is an authorized user', async () => {
      await userService.createUser({
        username: 'newuser',
        password: 'password',
        email: 'newuser@daos.com',
      });
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'newuser',
          password: 'password',
        });

      const authToken = loginResponse.body.access_token;

      const response = await request(app.getHttpServer())
        .delete('/users/newuser')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      expect(response.body).toEqual({});
      // console.log(body);
    });
  });
});
