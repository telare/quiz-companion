import { Module } from "@nestjs/common";
import { QuestionService } from "./question.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Question, QuestionSchema } from "src/schemas/question.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  providers: [QuestionService],
})
export class QuestionModule {}
