import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { Question } from "../schemas/question.schema";

@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);
  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
  ) {}

  async findAll(): Promise<HydratedDocument<Question>[]> {
    return this.questionModel.find().exec();
  }

  async findUniqueTopics() {
    return this.questionModel.distinct("topicTitle").exec();
  }

  async findOneByTopic(
    topic: string,
  ): Promise<HydratedDocument<Question> | null> {
    return this.questionModel.findOne({ topicTitle: topic }).exec();
  }

  async findRandom(): Promise<HydratedDocument<Question> | null> {
    const result = await this.questionModel
      .aggregate([{ $sample: { size: 1 } }])
      .exec();
    if (result.length === 0) return null;
    return this.questionModel.hydrate(result[0]);
  }

  async findOne(id: string): Promise<HydratedDocument<Question> | null> {
    return this.questionModel.findById(id).exec();
  }

  async findByText(text: string): Promise<HydratedDocument<Question> | null> {
    return this.questionModel.findOne({ text });
  }

  async createOne(question: Question): Promise<HydratedDocument<Question>> {
    const newQuestion = new this.questionModel(question);
    console.log(newQuestion);
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
  ): Promise<{
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
  }> {
    const qinDb = await this.questionModel.findOne({ _id: questionId }).exec();
    if (!qinDb) {
      this.logger.warn(
        `Attempted to check non-existent question ID: ${questionId}`,
      );
      throw new NotFoundException(
        "Question has not been founded in the database. Please try again later.",
      );
    }
    const correctOptIndex = qinDb.correctOptionIndex;
    const correctAnswer = qinDb.options.find((_, i) => i === correctOptIndex);
    if (!correctAnswer) {
      throw new Error("error");
    }
    if (userOptionIndex !== correctOptIndex) {
      return {
        isCorrect: false,
        correctAnswer,
        explanation: qinDb.explanation,
      };
    }

    return {
      isCorrect: true,
      correctAnswer,
      explanation: qinDb.explanation,
    };
  }
}
