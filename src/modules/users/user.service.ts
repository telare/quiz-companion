import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { User } from "../../schemas";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<HydratedDocument<User>[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<HydratedDocument<User> | null> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      return null;
    }
    return user;
  }

  async findByName(name: string): Promise<HydratedDocument<User> | null> {
    const user = await this.userModel.findOne({ username: name });
    if (!user) {
      return null;
    }
    return user;
  }

  async create(user: User): Promise<HydratedDocument<User>> {
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
