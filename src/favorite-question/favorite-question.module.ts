import { Module } from "@nestjs/common";
import { FavoriteQuestionService } from "./favorite-question.service";
import { FavoriteQuestionController } from "./favorite-question.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Favorite, FavoriteSchema } from "../schemas/favorite.schema";

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
