import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { Question } from "src/schemas/question.schema";

@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);
  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
  ) {}

  async findAll(): Promise<HydratedDocument<Question>[]> {
    return this.questionModel.find().exec();
  }

  async findOne(id: string): Promise<HydratedDocument<Question> | null> {
    return this.questionModel.findById(id).exec();
  }

  async findByText(text: string): Promise<HydratedDocument<Question> | null> {
    return this.questionModel.findOne({ text });
  }

  async createOne(question: Question): Promise<HydratedDocument<Question>> {
    const newQuestion = new this.questionModel(question);
    await newQuestion.save();
    return newQuestion;
  }

  async createMany(
    questions: Question[],
  ): Promise<HydratedDocument<Question[]>> {
    const result = await this.questionModel.insertMany(questions);
    return result as unknown as HydratedDocument<Question[]>;
  }

  async checkQuestion(
    questionId: string,
    userOptionIndex: number,
  ): Promise<{ isCorrect: boolean; correctAnswer?: string }> {
    const qinDb = await this.questionModel.findOne({ _id: questionId }).exec();
    if (!qinDb) {
      this.logger.warn(
        `Attempted to check non-existent question ID: ${questionId}`,
      );
      throw new NotFoundException(
        "Question has not been founded in the database. Please try again later.",
      );
    }
    const correctAnswer = qinDb.correctAnswer;
    const correctOptIndex = qinDb.options.findIndex((v) => v === correctAnswer);

    if (userOptionIndex !== correctOptIndex) {
      return {
        isCorrect: false,
        correctAnswer,
      };
    }

    return {
      isCorrect: true,
    };
  }

  async findRandom(): Promise<HydratedDocument<Question> | null> {
    return await this.questionModel.findOne();
  }
}
