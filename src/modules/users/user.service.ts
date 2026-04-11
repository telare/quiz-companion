import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(user: User): Promise<HydratedDocument<User>> {
    return await this.userModel.create(user);
  }

  async createMany(users: User[]): Promise<HydratedDocument<User>[]> {
    if (users.length === 0) {
      throw new BadRequestException('No users provided for creation.');
    }

    const insertedUsers = await this.userModel.create(users);

    return insertedUsers;
  }

  async findAll(): Promise<HydratedDocument<User>[]> {
    const users = await this.userModel.find().exec();

    if (users.length === 0) {
      throw new NotFoundException('No users found in the database.');
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
    id: string,
    newUserInfo: Partial<User>,
  ): Promise<HydratedDocument<User>> {
    const updatedOne = await this.userModel
      .findByIdAndUpdate(id, { ...newUserInfo }, { returnDocument: 'after' })
      .exec();

    if (!updatedOne) {
      throw new NotFoundException(`User with id: ${id} not found.`);
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

  async incrementPoints(userId: string, amount: number) {
    const updatedOne = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $inc: { totalPoints: amount } },
        { returnDocument: 'after' },
      )
      .exec();

    if (!updatedOne) {
      throw new NotFoundException(`User with id: ${userId} not found.`);
    }
    return updatedOne;
  }
}
