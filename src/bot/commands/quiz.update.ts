import { UseGuards } from "@nestjs/common";
import { Action, Command, Ctx, Update } from "nestjs-telegraf";
import { QuestionService } from "../../question/question.service";
import { UserService } from "../../users/user.service";
import { Markup } from "telegraf";
import { BotService } from "../bot.service";
import { FavoriteQuestionService } from "../../favorite-question/favorite-question.service";
import { getErrorMessage } from "../../utils";
import { AuthGuard } from "../../auth.guard";
import { BotContext } from "../../bot.context";
@UseGuards(AuthGuard)
@Update()
export class QuizCommand {
  constructor(
    private readonly questionService: QuestionService,
    private readonly userService: UserService,
    private readonly botService: BotService,
    private readonly favoriteService: FavoriteQuestionService,
  ) {}

  @Command("saved")
  async handleSavedQuestions(@Ctx() ctx: BotContext) {
    try {
      const user = ctx.dbUser;
      const userId = user._id.toString();
      const saved = await this.favoriteService.findAll(userId);

      if (!saved || saved.length === 0) {
        await ctx.reply(
          "You don't have any saved questions.\nTo save press the '⭐ Save question' button under any question.",
        );
        return;
      }
      await ctx.reply(`📚 *Your saved questions* — ${saved.length} total`, {
        parse_mode: "Markdown",
      });
      for (const s of saved) {
        const q = await this.questionService.findById(s.questionId);

        if (!q) {
          continue;
        }
        const { fullMessage: questionMessage } =
          await this.questionService.buildQuestion(userId, q);
        const optionLabels = ["A", "B", "C", "D"];
        const optionsText = q.options
          .map((opt, i) => `${optionLabels[i]}) ${opt}`)
          .join("\n");
        const fullMessage = [questionMessage, optionsText].join("\n");
        const keyboard = Markup.inlineKeyboard([
          [
            {
              text: "🗑 Remove from saved",
              callback_data: `unsave:${s.questionId}`,
            },
          ],
        ]);
        await ctx.reply(fullMessage, {
          parse_mode: "HTML",
          ...keyboard,
        });
      }
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }

  @Action(/^quiz:/)
  async handleRandomQuestionAnswer(@Ctx() ctx: BotContext) {
    try {
      await ctx.answerCbQuery();
      const cbQuery = ctx.callbackQuery;

      if (!cbQuery || !("data" in cbQuery)) {
        return;
      }

      const [, questionId, choice] = cbQuery.data.split(":");

      const question = await this.questionService.findById(questionId);
      if (!question) return;

      const result = await this.questionService.checkQuestion(
        questionId,
        parseInt(choice),
      );

      const user = ctx.dbUser;
      const userId = user._id.toString();
      if (result.isCorrect) {
        await this.userService.incrementPoints(user.username, 1);
      } else {
        await this.userService.decrementPoints(user.username, 1);
      }

      const nextQuestionButton = {
        buttonText: "⏭ Next",
        callbackData: "next",
      };
      const { fullMessage, keyboard } =
        await this.questionService.buildQuestion(userId, question);
      await ctx.editMessageText(fullMessage, {
        parse_mode: "HTML",
        ...[keyboard, nextQuestionButton],
      });
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }

  @Action(/^save:/)
  async handleSaveQuestion(@Ctx() ctx: BotContext) {
    try {
      await ctx.answerCbQuery();
      const cbQuery = ctx.callbackQuery;

      if (!cbQuery || !("data" in cbQuery)) {
        return;
      }

      const [, questionId] = cbQuery.data.split(":");
      const user = ctx.dbUser;
      const userId = user._id.toString();
      const existing = await this.favoriteService.findOne({
        userId,
        questionId,
      });
      if (existing) {
        await ctx.reply(
          "You have already saved this question. To see it, send the /saved command",
        );
        return;
      }
      await this.favoriteService.create({
        userId,
        questionId,
      });

      const message = cbQuery.message;

      if (!message || !("reply_markup" in message)) {
        console.warn(
          "Message is inaccessible or does not support reply_markup",
        );
        return;
      }

      const currentKeyboard = message.reply_markup?.inline_keyboard ?? [];

      const updatedKeyboard = currentKeyboard.map((row) =>
        row.map((button) =>
          "callback_data" in button &&
          button.callback_data === `save:${questionId}`
            ? {
                text: "🗑 Remove from saved",
                callback_data: `unsave:${questionId}`,
              }
            : button,
        ),
      );

      await ctx.editMessageReplyMarkup({ inline_keyboard: updatedKeyboard });
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }

  @Action(/^unsave:/)
  async handleUnSaveQuestion(@Ctx() ctx: BotContext) {
    try {
      await ctx.answerCbQuery();
      const cbQuery = ctx.callbackQuery;

      if (!cbQuery || !("data" in cbQuery)) {
        return;
      }

      const [, questionId] = cbQuery.data.split(":");
      const user = ctx.dbUser;
      const userId = user._id.toString();
      const favorite = await this.favoriteService.findOne({
        userId,
        questionId,
      });
      if (!favorite) {
        await ctx.editMessageText(
          "This question has already been removed successfully",
        );
        return;
      }
      await this.favoriteService.removeOne({
        userId,
        questionId,
      });
      const message = cbQuery.message;

      if (!message || !("reply_markup" in message)) {
        console.warn(
          "Message is inaccessible or does not support reply_markup",
        );
        return;
      }

      const currentKeyboard = message.reply_markup?.inline_keyboard ?? [];

      const updatedKeyboard = currentKeyboard.map((row) =>
        row.map((button) =>
          "callback_data" in button &&
          button.callback_data === `unsave:${questionId}`
            ? { text: "⭐ Save question", callback_data: `save:${questionId}` }
            : button,
        ),
      );

      await ctx.editMessageReplyMarkup({ inline_keyboard: updatedKeyboard });
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }
}
