import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Favorite, FavoriteSchema } from './entities/favorite-question.entity';
import { FavoriteQuestionController } from './favorite-question.controller';
import { FavoriteQuestionService } from './favorite-question.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
    ]),
  ],
  controllers: [FavoriteQuestionController],
  providers: [FavoriteQuestionService],
  exports: [FavoriteQuestionService],
})
export class FavoriteQuestionModule {}
