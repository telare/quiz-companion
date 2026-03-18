import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateFavoriteQuestionDto } from "./dto/create-favorite-question.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Favorite } from "../schemas/favorite.schema";
import { DeleteResult, HydratedDocument, Model } from "mongoose";

@Injectable()
export class FavoriteQuestionService {
  constructor(
    @InjectModel(Favorite.name) private readonly favoriteModel: Model<Favorite>,
  ) {}

  async create(
    createFavoriteQuestionDto: CreateFavoriteQuestionDto,
  ): Promise<HydratedDocument<Favorite>> {
    return this.favoriteModel.create({
      questionId: createFavoriteQuestionDto.questionId,
      savedAt: createFavoriteQuestionDto.savedAt,
      userId: createFavoriteQuestionDto.userId,
    });
  }

  async findAll(userId: string): Promise<HydratedDocument<Favorite>[]> {
    return this.favoriteModel.find().where({
      userId,
    });
  }

  async findOne({
    userId,
    questionId,
  }: {
    userId: string;
    questionId: string;
  }): Promise<HydratedDocument<Favorite>> {
    const fav = await this.favoriteModel.findOne().where({
      userId,
      questionId,
    });

    if (!fav)
      throw new NotFoundException(
        `Favorite question for userId ${userId} with questionId ${questionId} not found.`,
      );

    return fav;
  }

  removeOne({
    userId,
    questionId,
  }: {
    userId: string;
    questionId: string;
  }): Promise<DeleteResult> {
    return this.favoriteModel.deleteOne().where({
      userId,
      questionId,
    });
  }
}
