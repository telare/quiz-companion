import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult, HydratedDocument, Model } from 'mongoose';

import { CreateFavoriteQuestionDto } from './dto/create-favorite-question.dto';
import { Favorite } from './entities/favorite-question.entity';

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
    questionId: string;
    userId: string;
  }): Promise<HydratedDocument<Favorite> | null> {
    const fav = await this.favoriteModel.findOne().where({
      userId,
      questionId,
    });

    return fav;
  }

  removeOne({
    userId,
    questionId,
  }: {
    questionId: string;
    userId: string;
  }): Promise<DeleteResult> {
    return this.favoriteModel.deleteOne().where({
      userId,
      questionId,
    });
  }
}
