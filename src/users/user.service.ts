import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { User } from "../schemas/user.schema";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<HydratedDocument<User>[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<HydratedDocument<User> | null> {
    return this.userModel.findById(id).exec();
  }

  async findByName(name: string): Promise<HydratedDocument<User> | null> {
    return this.userModel.findOne({ username: name });
  }

  async create(user: User): Promise<HydratedDocument<User> | null> {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  async incrementPoints(userName: string, amount: number) {
    await this.userModel.updateOne(
      { username: userName },
      { $inc: { totalPoints: amount } },
    );
  }

  async decrementPoints(userName: string, amount: number) {
    await this.userModel.updateOne(
      { username: userName, totalPoints: { $gt: 0 } },
      { $inc: { totalPoints: -amount } },
    );
  }
}
