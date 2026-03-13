import { Module } from "@nestjs/common";
import { QuestionService } from "./question.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Question, QuestionSchema } from "../schemas/question.schema";
import { QuestionController } from "./question.controller";
import { BotService } from "../bot/bot.service";
import { FavoriteQuestionModule } from "../favorite-question/favorite-question.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
    FavoriteQuestionModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService, BotService],
  exports: [QuestionService],
})
export class QuestionModule {}
