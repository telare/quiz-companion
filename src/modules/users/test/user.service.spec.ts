import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../user.service";
import { getModelToken, MongooseModule } from "@nestjs/mongoose";
import { NotFoundException } from "@nestjs/common";
import { mongo } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { userStub } from "./user.stubs";
import { User } from "../entities/user.entity";
import mongoose from "mongoose";
import { CreateUserDto } from "../dto/create-user.dto";

const mockUserModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

describe("UserService", () => {
  let service: UserService;
  let mongoServer: MongoMemoryServer;
  let userInput: CreateUserDto;
  let userInputId: string;

  beforeEach(async () => {
    jest.clearAllMocks();
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(uri)],
      providers: [
        UserService,
        // It finds the provider with the token getModelToken('User'). Instead of giving the service a real database connection, it injects your mockUserModel object into the service.
        // You now have a Real Service instance that is holding a Fake Database tool.
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    userInput = userStub();
    userInputId = new mongoose.Types.ObjectId().toString();
  });
  afterAll(async () => {
    if (mongoServer) {
      await mongoServer.stop();
    }
    await mongoose.connection.close();
  });

  it("create() should successfully create a user", async () => {
    // mock setup - map with the result of await this.userModel.create(user);
    mockUserModel.create.mockResolvedValue({
      ...userInput,
      _id: userInputId,
    });

    // actual execution
    const result = await service.create(userInput);
    expect(result.username).toEqual(userInput.username);
    expect(result._id).toEqual(userInputId);
  });

  it("create() should propagate a Duplicate Key error from Mongoose", async () => {
    const mockError = new mongo.MongoServerError({ message: "Duplicate key" });
    mockError.code = 11000;

    mockUserModel.create.mockRejectedValue(mockError);

    await expect(service.create(userInput)).rejects.toThrow(
      mongo.MongoServerError,
    );
  });

  it("findOne() should return a user by id", async () => {
    mockUserModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...userInput,
        _id: userInputId,
      }),
    });

    const result = await service.findOne(userInputId);

    expect(result._id).toEqual(userInputId);
  });

  it("findOne() should throw NotFoundException when the user doesn't exist", async () => {
    mockUserModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    await expect(service.findOne("non-existent-id")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("findByName() should return the user by username", async () => {
    mockUserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...userInput,
        _id: userInputId,
      }),
    });
    const result = await service.findByName(userInput.username);

    expect(result.username).toEqual(userInput.username);
    expect(result._id).toEqual(userInputId);
  });

  it("findByName() should throw NotFoundException when the user doesn't exist", async () => {
    mockUserModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.findOne("non-existent-name")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("updateOne() should return the user with updated field", async () => {
    const newUserName = "username";
    mockUserModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        ...userInput,
        username: newUserName,
        _id: userInputId,
      }),
    });
    const result = await service.updateOne(userInput.username, {
      username: newUserName,
    });

    expect(result.username).toEqual(newUserName);
    expect(result._id).toEqual(userInputId);
  });

  it("updateOne() should throw NotFoundException when the user doesn't exist", async () => {
    mockUserModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.updateOne(userInput.username, { username: "username" }),
    ).rejects.toThrow(NotFoundException);
  });

  it("removeOne() should return deleted user", async () => {
    mockUserModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ ...userInput, _id: userInputId }),
    });
    const result = await service.removeOne(userInputId);

    expect(result.username).toEqual(userInput.username);
    expect(result._id).toEqual(userInputId);
  });

  it("removeOne() should throw NotFoundException when the user doesn't exist", async () => {
    mockUserModel.findByIdAndDelete.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.removeOne(userInputId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
