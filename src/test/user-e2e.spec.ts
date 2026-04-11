import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserRank } from '../modules/users/entities/user.entity';
import { UsersModule } from '../modules/users/user.module';
import { GlobalExceptionFilter } from '../common/filters';
import { HttpExceptionFilter } from '../common/filters/http-exeption.filter';
import { MongoExceptionFilter } from '../common/filters/mongo-exeption.filter';
import {
  TransformInterceptor,
  LoggingInterceptor,
} from '../common/interceptors';
import { UpdateUserDto } from '../modules/users/dto/update-user.dto';
import mongoose from 'mongoose';

describe('UserService E2E', () => {
  let mongoServer: MongoMemoryServer;
  let app: INestApplication;
  const testUser = {
    username: 'E2ETestUser',
    rank: UserRank.Gold,
    totalPoints: 500,
  };
  const NON_EXISTED_ID = new mongoose.Types.ObjectId();

  beforeEach(async () => {
    jest.clearAllMocks();
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri), UsersModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(
      new TransformInterceptor(),
      new LoggingInterceptor(),
    );

    app.useGlobalFilters(
      new GlobalExceptionFilter(),
      new MongoExceptionFilter(),
      new HttpExceptionFilter(),
    );
    await app.init();
  });
  afterAll(async () => {
    if (mongoServer) {
      await mongoServer.stop();
    }
    await mongoose.connection.close();
    await app.close();
  });

  const createUser = async () => {
    const responsePost = await request(app.getHttpServer())
      .post('/users')
      .send(testUser);
    const userId = responsePost.body.data._id;
    return userId;
  };

  it('POST /users - should create a user and save to DB', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send(testUser)
      .expect(201);

    expect(response.body.success).toEqual(true);
    expect(response.body.data.rank).toEqual(testUser.rank);
    expect(response.body.data).toHaveProperty('_id');
  });

  it('POST /users/bulk - should create users and save to DB', async () => {
    const testUsers = [
      testUser,
      {
        username: 'testuser2',
        rank: UserRank.Bronze,
        totalPoints: 123,
      },
    ];
    const response = await request(app.getHttpServer())
      .post('/users/bulk')
      .send(testUsers)
      .expect(201);

    expect(response.body.success).toEqual(true);
    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data[0].username).toEqual(testUsers[0].username);
    expect(response.body.data[0].rank).toEqual(testUsers[0].rank);
    expect(response.body.data[0]).toHaveProperty('_id');

    expect(response.body.data[1].username).toEqual(testUsers[1].username);
    expect(response.body.data[1].rank).toEqual(testUsers[1].rank);
    expect(response.body.data[1]).toHaveProperty('_id');
  });

  it('GET /users/:id - should get the user by id', async () => {
    const userId = await createUser();
    const response = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200);

    expect(response.body.success).toEqual(true);
    expect(response.body.data._id).toEqual(userId);
  });

  it('GET /users - should get the users', async () => {
    await request(app.getHttpServer()).post('/users').send(testUser);
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(200);

    expect(response.body.success).toEqual(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('GET /users/:id - should throw NotFoundException for user by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${NON_EXISTED_ID}`)
      .expect(404);

    expect(response.body.success).toEqual(false);
    expect(response.body.data).toEqual(null);
    expect(response.body.error).toBeDefined();
  });

  it('PATCH /users/:id - should update a user and save to DB by id', async () => {
    const userId = await createUser();
    const updateUserDto: UpdateUserDto = {
      ...testUser,
      username: 'E2ETestUserUpd',
    };
    const response = await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .send(updateUserDto)
      .expect(200);

    expect(response.body.success).toEqual(true);
    expect(response.body.data.totalPoints).toEqual(updateUserDto.totalPoints);
    expect(response.body.data.username).toEqual(updateUserDto.username);
    expect(response.body.data).toHaveProperty('_id');
  });

  it('PATCH /users/:id - should throw NotFoundException if user id is non-existed', async () => {
    const updateUserDto: UpdateUserDto = {
      ...testUser,
      username: 'E2ETestUserUpd',
    };
    const response = await request(app.getHttpServer())
      .patch(`/users/${NON_EXISTED_ID}`)
      .send(updateUserDto)
      .expect(404);

    expect(response.body.success).toEqual(false);
    expect(response.body.data).toEqual(null);
    expect(response.body.error).toBeDefined();
  });

  it('DELETE /users/:id - should delete a user by id', async () => {
    const userId = await createUser();
    const response = await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(200);

    expect(response.body.success).toEqual(true);
    expect(response.body.data).toHaveProperty('_id');
  });

  it('DELETE /users/:id - should throw NotFoundException if user id is non-existed', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/users/${NON_EXISTED_ID}`)
      .expect(404);

    expect(response.body.success).toEqual(false);
    expect(response.body.data).toEqual(null);
    expect(response.body.error).toBeDefined();
  });
});
