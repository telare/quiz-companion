import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(user: User): Promise<HydratedDocument<User>> {
    const newUser = await this.userModel.create(user);
    if (!newUser) {
      throw new NotFoundException(`Users not created.`);
    }

    return newUser;
  }

  async createMany(users: User[]): Promise<HydratedDocument<User>[]> {
    const insertedUsers = await this.userModel.create(users);

    if (!users || users.length === 0) {
      throw new NotFoundException(`Users not created.`);
    }

    return insertedUsers;
  }

  async findAll(): Promise<HydratedDocument<User>[]> {
    const users = await this.userModel.find().exec();

    if (!users || users.length === 0) {
      throw new NotFoundException(`Users not found.`);
    }

    return users;
  }

  async findOne(id: string): Promise<HydratedDocument<User>> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id: ${id} not found.`);
    }
    return user;
  }

  async findByName(name: string): Promise<HydratedDocument<User>> {
    const user = await this.userModel.findOne({ username: name }).exec();
    if (!user) {
      throw new NotFoundException(`User with name: ${name} not found.`);
    }
    return user;
  }

  async updateOne(
    userName: string,
    newUserInfo: Partial<User>,
  ): Promise<HydratedDocument<User>> {
    const updatedOne = await this.userModel
      .findOneAndUpdate(
        { username: userName },
        { ...newUserInfo },
        { new: true },
      )
      .exec();

    if (!updatedOne) {
      throw new NotFoundException(`User with name: ${userName} not found.`);
    }

    return updatedOne;
  }

  async removeOne(id: string): Promise<HydratedDocument<User>> {
    const deleted = await this.userModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException(`User with id: ${id} not found.`);
    }

    return deleted;
  }

  async incrementPoints(userName: string, amount: number) {
    const updatedOne = await this.userModel
      .findOneAndUpdate(
        { username: userName },
        { $inc: { totalPoints: amount } },
        { new: true },
      )
      .exec();

    if (!updatedOne) {
      throw new NotFoundException(`User with name: ${userName} not found.`);
    }
    return updatedOne;
  }
}
