import { Module } from "@nestjs/common";
import { QuestionService } from "./question.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Question, QuestionSchema } from "../schemas/question.schema";
import { QuestionController } from "./question.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
