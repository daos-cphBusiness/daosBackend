import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  //BadRequestException,
  INestApplication,
  ValidationPipe,
  //ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { TestModule } from '../src/test.module';
import { UsersService } from '../src/users/users.service';

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

      body.message.forEach((error) => {
        if (error.field === 'username') {
          expect(error.message).toEqual(
            'Username must be at least 3 characters long',
          );
        } else if (error.field === 'email') {
          expect(error.message).toEqual('Please provide a valid email address');
        } else if (error.field === 'password') {
          expect(error.message).toEqual(
            'Password must be at least 6 characters long',
          );
        }
      });

      //console.log(body);
    });
  });

  //create test for update and delete and set up a CI so it runs the e2e
});
