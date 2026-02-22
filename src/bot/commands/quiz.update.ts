import {
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { Action, Command, Ctx, Update } from "nestjs-telegraf";
import { AiService } from "src/ai/ai.service";
import { QuestionService } from "src/question/question.service";
import { UserService } from "src/users/user.service";
import { getErrorMessage } from "src/utils/errorMessage";
import { Context, Markup } from "telegraf";
import { BotService } from "../bot.service";
@Update()
export class QuizCommand {
  constructor(
    private readonly aiService: AiService,
    private readonly questionService: QuestionService,
    private readonly userService: UserService,
    private readonly botService: BotService,
  ) {}

  @Command("airandom")
  async aiRandomCommand(@Ctx() ctx: Context) {
    try {
      const questionData = await this.aiService.getRandomQuestion();
      if (!questionData) {
        throw new ServiceUnavailableException(
          "The AI service is currently unable to generate a question.",
        );
      }

      const question = questionData.question;
      const options = questionData.options;
      const savedQuestion = await this.questionService.createOne({
        correctAnswer: questionData.correctOption,
        options: questionData.options,
        text: question,
      });
      const questionId = savedQuestion._id.toString();
      const callbackData = `quiz:${questionId}:`;
      const keyboard = this.botService.createInlineKeyboard(
        options,
        callbackData,
      );

      await ctx.reply(question, keyboard);
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }

  @Command("random")
  async randomCommand(@Ctx() ctx: Context) {
    try {
      const questionData = await this.questionService.findRandom();

      if (!questionData) {
        throw new ServiceUnavailableException(
          "AI service failed to generate a question",
        );
      }
      const question = questionData.text;
      const options = questionData.options;

      const questionId = questionData._id.toString();
      const callbackData = `quiz:${questionId}:`;
      const keyboard = this.botService.createInlineKeyboard(
        options,
        callbackData,
      );

      await ctx.reply(question, keyboard);
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }

  @Action(/^quiz:/)
  async handleRandomQuestionAnswer(@Ctx() ctx: Context) {
    await ctx.answerCbQuery();
    await ctx.reply("Your answer received, please wait for a little bit... ⏳");
    const disabledKeyboard = Markup.inlineKeyboard([]);

    await ctx.editMessageReplyMarkup(disabledKeyboard.reply_markup);
    const cbQuery = ctx.callbackQuery;

    if (!cbQuery || !("data" in cbQuery)) {
      return;
    }
    const [, id, choice] = cbQuery.data.split(":");
    try {
      const result = await this.questionService.checkQuestion(
        id,
        parseInt(choice),
      );

      const feedback = result.isCorrect;
      const userName = ctx.from?.username;
      if (!userName) {
        throw new UnauthorizedException(
          "Please sign in before answer the question.",
        );
      }
      if (feedback) {
        await this.userService.incrementPoints(userName, 1);
      } else {
        await this.userService.decrementPoints(userName, 1);
      }
      const correctAnswer = result.correctAnswer;
      const message = feedback
        ? `✅ Your answer: ${correctAnswer} is correct! You have gained 1 point!`
        : `❌ Error. The correct answer is: ${correctAnswer}. You have lost 1 point.`;

      await ctx.reply(message);
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }
}
