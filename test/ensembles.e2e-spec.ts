import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { CreateEnsembleDto } from '../src/ensembles/dto/create-ensemble.dto';
import { TestModule } from '../src/test.module';
import { EnsemblesService } from '../src/ensembles/ensembles.service';
import { CreateUserDto } from '../src/users/dto/create-user.dto';

describe('EnsemblesController (e2e)', () => {
  let app: INestApplication;
  let ensembleService: EnsemblesService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    ensembleService = moduleFixture.get<EnsemblesService>(EnsemblesService);

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
    await ensembleService.deleteMany();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/ensembles (POST)', () => {
    it('should create a new ensemble', async () => {
      const payload: CreateEnsembleDto = {
        name: 'Test Ensemble',
        description: 'This is a test ensemble',
      };

      const response = await request(app.getHttpServer())
        .post('/ensembles')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        name: payload.name,
        description: payload.description,
        users: [],
      });
    });

    it('should return validation errors for invalid ensemble', async () => {
      const payload = {
        description: 'Missing name field',
      };

      const response = await request(app.getHttpServer())
        .post('/ensembles')
        .send(payload)
        .expect(400);

      expect(response.body.message).toEqual([
        { field: 'name', message: expect.any(String) },
      ]);
    });

    it('should return 409 if the ensemble name already exists', async () => {
      const payload: CreateEnsembleDto = {
        name: 'Duplicate Ensemble',
        description: 'This will trigger a conflict',
      };

      await request(app.getHttpServer()).post('/ensembles').send(payload);

      const response = await request(app.getHttpServer())
        .post('/ensembles')
        .send(payload)
        .expect(409);

      expect(response.body.message).toBe('Group name already taken');
    });
  });

  describe('/ensembles (GET)', () => {
    it('should return all ensembles', async () => {
      await ensembleService.createEnsemble({
        name: 'Sample Ensemble',
        description: 'Sample description',
      });

      const response = await request(app.getHttpServer())
        .get('/ensembles')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toMatchObject({
        name: 'Sample Ensemble',
        description: 'Sample description',
      });
    });
  });

  describe('/ensembles/:id/users (POST)', () => {
    let ensembleId: string;

    beforeEach(async () => {
      // Create the ensemble
      const ensemblePayload = {
        name: 'Link Test Ensemble',
        description: 'Test',
      };
      const ensembleResponse = await request(app.getHttpServer())
        .post('/ensembles')
        .send(ensemblePayload)
        .expect(201);

      ensembleId = ensembleResponse.body._id;
    });

    it('should link a user to the ensemble', async () => {
      // Step 1: Create the user
      const validUser: CreateUserDto = {
        username: 'testuser1',
        password: 'password',
        email: 'testuser@test.com',
      };
      await request(app.getHttpServer()).post('/users/').send(validUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'testuser1',
          password: 'password',
        });
      // console.log(loginResponse);
      const authToken = loginResponse.body.access_token;

      // Step 2: Link the user to the ensemble
      const response = await request(app.getHttpServer())
        .post(`/ensembles/${ensembleId}/users`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      // console.log('yo ', response.body.users);
      // Step 3: Validate the user is linked
      expect(response.body.users).toContainEqual(
        expect.objectContaining({ username: 'testuser1' }),
      );
    });
  });

  describe('/ensembles/:id (DELETE)', () => {
    it('should delete an ensemble by ID', async () => {
      // Create an ensemble first
      const payload = {
        name: 'Delete Test Ensemble',
        description: 'To be deleted',
      };
      const createResponse = await request(app.getHttpServer())
        .post('/ensembles')
        .send(payload)
        .expect(201);

      const ensembleId = createResponse.body._id;

      // Delete the ensemble
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/ensembles/${ensembleId}`)
        .expect(200);

      expect(deleteResponse.body.message).toBe(
        `Ensemble with id ${ensembleId} has been successfully deleted`,
      );

      //Verify that the ensemble no longer exists
      await request(app.getHttpServer())
        .get(`/ensembles/${ensembleId}`)
        .expect(404);
    });

    it('should return 404 if the ensemble does not exist', async () => {
      const invalidEnsembleId = '64f6c8e2b7ad4f001fc2b12c'; // Example of a non-existent ID
      const response = await request(app.getHttpServer())
        .delete(`/ensembles/${invalidEnsembleId}`)
        .expect(404);

      expect(response.body.message).toBe(
        `Ensemble with id ${invalidEnsembleId} not found`,
      );
    });
  });

  describe('PATCH /ensembles/:id - Partial Updates', () => {
    let createdEnsemble;

    beforeEach(async () => {
      const ensemble: CreateEnsembleDto = {
        name: 'original ensemble',
        description: 'This is a original ensemble',
      };
      const response = await request(app.getHttpServer())
        .post('/ensembles')
        .send(ensemble)
        .expect(201);

      createdEnsemble = response.body._id;
    });

    it('should update only the name of the ensemble', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/ensembles/${createdEnsemble}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.description).toBe('This is a original ensemble');
      expect(response.body.users).toEqual([]);
    });

    it('should update only the description of the ensemble', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/ensembles/${createdEnsemble}`)
        .send({ description: 'This is updated ensemble description' })
        .expect(200);

      expect(response.body.name).toBe('original ensemble');
      expect(response.body.description).toBe(
        'This is updated ensemble description',
      );
      expect(response.body.users).toEqual([]);
    });

    it('should return 404 when trying to update a non-existent ensemble', async () => {
      const nonExistentId = '63c15d7b8d5a5a001c8b4567'; // Fake ID
      const response = await request(app.getHttpServer())
        .patch(`/ensembles/${nonExistentId}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(
        'Ensemble with ID 63c15d7b8d5a5a001c8b4567 not found',
      );
    });
  });
});
