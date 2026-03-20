import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DeleteResult, HydratedDocument, Model } from "mongoose";
import { User, UserRank } from "../../schemas";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(user: User): Promise<HydratedDocument<User>> {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

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

  removeOne({ userId }: { userId: string }): Promise<DeleteResult> {
    return this.userModel.deleteOne().where({
      userId,
    });
  }

  async incrementPoints(userName: string, amount: number) {
    await this.userModel.updateOne(
      { username: userName },
      { $inc: { totalPoints: amount } },
    );
  }

  async updateRank(userName: string, rank: UserRank) {
    await this.userModel.updateOne({ username: userName }, { rank });
  }
}
