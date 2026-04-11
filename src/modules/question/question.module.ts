import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionController } from './question.controller';
import { BotService } from '../bot/bot.service';
import { FavoriteQuestionModule } from '../favorite-question/favorite-question.module';
import { Question, QuestionSchema } from './entities/question.entity';

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
