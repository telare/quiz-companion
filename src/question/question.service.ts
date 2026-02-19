import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Question } from "src/schemas/question.schema";

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
  ) {}

  async findAll() {
    return this.questionModel.find().exec();
  }

  async findOne(id: string) {
    return this.questionModel.findById(id).exec();
  }

  async findByText(text: string) {
    return this.questionModel.findOne({ text });
  }

  async create(question: Question) {
    const newQuestion = new this.questionModel(question);
    await newQuestion.save();
  }
}
