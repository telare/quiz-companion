import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { UserController } from '../user.controller';
import { userStub } from './user.stubs';
import { CreateUserDto } from '../dto/create-user.dto';
import mongoose from 'mongoose';

const mockUserService = {
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  createMany: jest.fn(),
  updateOne: jest.fn(),
  removeOne: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let userInput: CreateUserDto;
  let userInputId: string;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        // It finds the service. Instead of giving the service a real database connection, it injects your mock service methods inside it.
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();
    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    userInput = userStub();
  });

  it('POST users/ should create new user', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    mockUserService.create.mockResolvedValue({
      ...userInput,
      id,
    });
    userInputId = id;
    await controller.createOne(userInput);

    expect(service.create).toHaveBeenCalledWith(userInput);
  });

  it('GET users/:id should return a user by id', async () => {
    mockUserService.findOne.mockResolvedValue({
      ...userInput,
      id: userInputId,
    });
    await controller.findOne(userInputId);
    expect(service.findOne).toHaveBeenCalledWith(userInputId);
  });

  it('POST users/bulk should create new users', async () => {
    const users: CreateUserDto[] = [
      {
        rank: userInput.rank,
        totalPoints: userInput.totalPoints,
        username: userInput.username,
      },
      {
        rank: userInput.rank,
        totalPoints: userInput.totalPoints,
        username: 'test-user-2',
      },
    ];
    mockUserService.createMany.mockReturnValue(users);
    const result = await controller.createMany(users);

    expect(result[0].rank).toEqual(users[0].rank);
    expect(result[0].totalPoints).toEqual(users[0].totalPoints);
    expect(result[0].username).toEqual(users[0].username);

    expect(result[1].rank).toEqual(users[1].rank);
    expect(result[1].totalPoints).toEqual(users[1].totalPoints);
    expect(result[1].username).toEqual(users[1].username);

    expect(service.createMany).toHaveBeenCalledWith(users);
  });

  it('DELETE users/:id should delete the user by id', async () => {
    mockUserService.removeOne.mockResolvedValue({
      ...userInput,
      id: userInputId,
    });
    await controller.deleteOne(userInputId);
    expect(service.removeOne).toHaveBeenCalledWith(userInputId);
  });
});
