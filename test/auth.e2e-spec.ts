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

  describe('/auth/signUp', () => {
    it('should sign up a valid user', async () => {
      const validUser: CreateUserDto = {
        username: 'gooduser',
        password: 'password',
        email: 'gooduser@test.com',
        fullName: 'full name',
      };

      const { body } = await request(app.getHttpServer())
        .post('/auth/signUp')
        .send(validUser)
        .expect(201);

      expect(body._id).toBeDefined();
    });

    it('should not sign up an invalid user', async () => {
      const invalidUser: CreateUserDto = {
        username: 'tt',
        password: 'pp',
        email: 'test@test.com',
        fullName: 'full name',
      };

      const { body } = await request(app.getHttpServer())
        .post('/auth/signUp')
        .send(invalidUser)
        .expect(400);

      expect(body.message[0].message).toEqual(
        'Username must be at least 3 characters long',
      );
      expect(body.message[1].message).toEqual(
        'Password must be at least 6 characters long',
      );
      //console.log(body);
    });
  });

  describe('/auth/login', () => {
    it('should return a token when logging in', async () => {
      // Arrange
      await userService.createUser({
        username: 'newuser',
        password: 'password',
        email: 'newuser@daos.com',
        fullName: 'full name',
      });

      const { body } = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'newuser', password: 'password' })
        .expect(200);

      expect(body.access_token).toBeDefined();
    });
  });
});
