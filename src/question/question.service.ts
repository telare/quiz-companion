import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { HydratedDocument, Model } from "mongoose";
import { Question, Category } from "../schemas/question.schema";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { BotService } from "../bot/bot.service";
import { FavoriteQuestionService } from "../favorite-question/favorite-question.service";

@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);
  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<Question>,
    private readonly botService: BotService,
    private readonly favoriteService: FavoriteQuestionService,
  ) {}
  async buildQuestion(
    userId: string,
    questionData: HydratedDocument<Question>,
  ) {
    const questionId = questionData._id.toString();
    const header = `<b>Topic:</b> ${questionData.topicTitle}\n<b>Difficulty:</b> ${questionData.difficulty}\n\n`;
    const body = `${questionData.questionText}\n`;

    const code = questionData.codeSnippet
      ? `\n<pre><code class="language-javascript">${questionData.codeSnippet}</code></pre>\n`
      : "";

    const optionLabels = ["A", "B", "C", "D"];
    const optionsText = questionData.options
      .map((opt, i) => `<b>${optionLabels[i]})</b> ${opt}`)
      .join("\n");

    const fullMessage = `${header}${body}${code}\n${optionsText}`;
    const callbackData = `quiz:${questionId}:`;

    const keyboardData = questionData.options.map((_, i) => ({
      buttonText: optionLabels[i],
      callbackData: callbackData + i,
    }));
    const isAlreadySaved = await this.favoriteService.findOne({
      userId,
      questionId,
    });
    const saveQuestionButton = {
      buttonText: "⭐ Save question",
      callbackData: `save:${questionId}`,
    };
    const unSaveButton = {
      buttonText: "🗑 Remove from saved",
      callbackData: `unsave:${questionId}`,
    };
    const keyboard = this.botService.createInlineKeyboard([
      ...keyboardData,
      isAlreadySaved ? unSaveButton : saveQuestionButton,
    ]);
    return { fullMessage, keyboard };
  }
  async findAll(): Promise<HydratedDocument<Question>[]> {
    return this.questionModel.find().exec();
  }

  async findUniqueTopics(): Promise<string[]> {
    return this.questionModel.distinct("topicTitle").exec();
  }
  async findOneCustomized(
    topicTitle: Question["topicTitle"],
    difficulty: Question["difficulty"],
  ): Promise<HydratedDocument<Question> | null> {
    return this.questionModel
      .findOne({
        topicTitle,
        difficulty,
      })
      .exec();
  }
  async findManyCustomized(
    topicTitle: Question["topicTitle"],
    category: Question["category"],
    difficulty: Question["difficulty"],
    limit: number,
  ): Promise<HydratedDocument<Question>[]> {
    return this.questionModel.aggregate([
      {
        $match: { topicTitle, difficulty, category },
      },
      {
        $sample: { size: limit },
      },
    ]);
  }
  async countQuestionsByTopic(
    category: Question["category"],
  ): Promise<{ _id: string; totalByTopic: number }[]> {
    return this.questionModel.aggregate([
      { $match: { category } },
      {
        $group: {
          _id: "$topicTitle",
          totalByTopic: {
            $sum: 1,
          },
        },
      },
    ]);
  }

  async getCategories(): Promise<{ _id: string; category: Category }[]> {
    return this.questionModel.aggregate([
      {
        $group: {
          _id: "$category",
        },
      },
      { $project: { category: "$_id", _id: 1 } },
    ]);
  }

  async findRandom(): Promise<HydratedDocument<Question> | null> {
    const result = await this.questionModel
      .aggregate([{ $sample: { size: 1 } }])
      .exec();
    if (result.length === 0) return null;
    return this.questionModel.hydrate(result[0]);
  }

  async findRandomByTopic(
    topic: string,
  ): Promise<HydratedDocument<Question> | null> {
    const result = await this.questionModel
      .aggregate([{ $match: { topicTitle: topic } }, { $sample: { size: 1 } }])
      .exec();
    if (result.length === 0) return null;
    return this.questionModel.hydrate(result[0]);
  }

  async findById(id: string): Promise<HydratedDocument<Question> | null> {
    return this.questionModel.findById(id).exec();
  }

  async findByText(text: string): Promise<HydratedDocument<Question> | null> {
    return this.questionModel.findOne({ text });
  }

  async updateOne(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<HydratedDocument<Question> | null> {
    return this.questionModel.findByIdAndUpdate(id, updateQuestionDto, {
      new: true,
    });
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
