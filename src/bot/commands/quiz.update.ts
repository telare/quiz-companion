import {
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { Action, Command, Ctx, Update } from "nestjs-telegraf";
import { AiService } from "../../ai/ai.service";
import { QuestionService } from "../../question/question.service";
import { UserService } from "../../users/user.service";
import { getErrorMessage } from "../../utils/errorMessage";
import { Context } from "telegraf";
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

      const options = questionData.options;
      const savedQuestion = await this.questionService.createOne({
        codeSnippet: questionData.codeSnippet,
        correctOptionIndex: questionData.correctOptionIndex,
        difficulty: questionData.difficulty,
        explanation: questionData.explanation,
        options: questionData.options,
        questionText: questionData.questionText,
        topicTitle: questionData.topicTitle,
      });
      const questionId = savedQuestion._id.toString();
      const header = `<b>Topic:</b> ${savedQuestion.topicTitle}\n<b>Difficulty:</b> ${savedQuestion.difficulty}\n\n`;
      const body = `${savedQuestion.questionText}\n`;

      const code = savedQuestion.codeSnippet
        ? `\n<pre><code class="language-javascript">${savedQuestion.codeSnippet}</code></pre>\n`
        : "";

      const fullMessage = `${header}${body}${code}`;
      const callbackData = `quiz:${questionId}:`;
      const keyboard = this.botService.createInlineKeyboard(
        options,
        callbackData,
      );

      await ctx.reply(fullMessage, {
        parse_mode: "HTML",
        ...keyboard,
      });
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
      const questionId = questionData._id.toString();
      const header = `<b>Topic:</b> ${questionData.topicTitle}\n<b>Difficulty:</b> ${questionData.difficulty}\n\n`;
      const body = `${questionData.questionText}\n`;

      const code = questionData.codeSnippet
        ? `\n<pre><code class="language-javascript">${questionData.codeSnippet}</code></pre>\n`
        : "";

      const fullMessage = `${header}${body}${code}`;
      const callbackData = `quiz:${questionId}:`;
      const keyboard = this.botService.createInlineKeyboard(
        questionData.options,
        callbackData,
      );
      await ctx.reply(fullMessage, {
        parse_mode: "HTML",
        ...keyboard,
      });
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }

  @Action(/^quiz:/)
  async handleRandomQuestionAnswer(@Ctx() ctx: Context) {
    try {
      await ctx.answerCbQuery();
      const cbQuery = ctx.callbackQuery;

      if (!cbQuery || !("data" in cbQuery)) {
        return;
      }

      const [, id, choice] = cbQuery.data.split(":");

      const question = await this.questionService.findOne(id);
      if (!question) return;

      const result = await this.questionService.checkQuestion(
        id,
        parseInt(choice),
      );

      const userName = ctx.from?.username;
      if (!userName) {
        throw new UnauthorizedException("Please sign in.");
      }

      if (result.isCorrect) {
        await this.userService.incrementPoints(userName, 1);
      } else {
        await this.userService.decrementPoints(userName, 1);
      }

      const header = `<b>Topic:</b> ${question.topicTitle}\n<b>Difficulty:</b> ${question.difficulty}\n\n`;
      const body = `${question.questionText}\n`;
      const code = question.codeSnippet
        ? `\n<pre><code class="language-javascript">${question.codeSnippet}</code></pre>\n`
        : "";

      const statusEmoji = result.isCorrect ? "✅" : "❌";
      const statusText = result.isCorrect
        ? `<b>Correct!</b> You've gained 1 point.`
        : `<b>Incorrect.</b> You've lost 1 point.`;

      const feedback = [
        `\n— — — — — — — — — — — —`,
        `${statusEmoji} ${statusText}`,
        `<b>Correct answer:</b> <code>${result.correctAnswer}</code>`,
        `\n<b>Explanation:</b>`,
        `<i>${result.explanation}</i>`,
      ].join("\n");

      await ctx.editMessageText(header + body + code + feedback, {
        parse_mode: "HTML",
      });
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }
}
