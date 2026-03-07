import {
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { Action, Command, Ctx, Update } from "nestjs-telegraf";
import { AiService } from "../../ai/ai.service";
import { QuestionService } from "../../question/question.service";
import { UserService } from "../../users/user.service";
import { getErrorMessage } from "../../utils/errorMessage";
import { Context, Markup } from "telegraf";
import { BotService } from "../bot.service";
import { HydratedDocument } from "mongoose";
import { Question } from "../../schemas/question.schema";
import { FavoriteQuestionService } from "../../favorite-question/favorite-question.service";
@Update()
export class QuizCommand {
  constructor(
    private readonly aiService: AiService,
    private readonly questionService: QuestionService,
    private readonly userService: UserService,
    private readonly botService: BotService,
    private readonly favoriteService: FavoriteQuestionService,
  ) {}

  private buildQuestion(questionData: HydratedDocument<Question>) {
    const questionId = questionData._id.toString();
    const header = `<b>Topic:</b> ${questionData.topicTitle}\n<b>Difficulty:</b> ${questionData.difficulty}\n\n`;
    const body = `${questionData.questionText}\n`;

    const code = questionData.codeSnippet
      ? `\n<pre><code class="language-javascript">${questionData.codeSnippet}</code></pre>\n`
      : "";

    const fullMessage = `${header}${body}${code}`;
    const callbackData = `quiz:${questionId}:`;

    const keyboardData = questionData.options.map((opt, i) => ({
      buttonText: opt,
      callbackData: callbackData + i,
    }));
    const saveQuestionButton = {
      buttonText: "⭐ Save question",
      callbackData: `save:${questionId}`,
    };
    const nextQuestionButton = {
      buttonText: "⏭ Next",
      callbackData: `next`,
    };
    const keyboard = this.botService.createInlineKeyboard([
      ...keyboardData,
      saveQuestionButton,
      nextQuestionButton,
    ]);
    return { fullMessage, keyboard };
  }

  @Command("airandom")
  async aiRandomCommand(@Ctx() ctx: Context) {
    try {
      const questionData = await this.aiService.getRandomQuestion();
      if (!questionData) {
        throw new ServiceUnavailableException(
          "The AI service is currently unable to generate a question.",
        );
      }

      const savedQuestion = await this.questionService.createOne({
        codeSnippet: questionData.codeSnippet,
        correctOptionIndex: questionData.correctOptionIndex,
        difficulty: questionData.difficulty,
        explanation: questionData.explanation,
        options: questionData.options,
        questionText: questionData.questionText,
        topicTitle: questionData.topicTitle,
      });

      const { fullMessage, keyboard } = this.buildQuestion(savedQuestion);
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
          "Service failed to generate a question",
        );
      }
      const { fullMessage, keyboard } = this.buildQuestion(questionData);
      await ctx.reply(fullMessage, {
        parse_mode: "HTML",
        ...keyboard,
      });
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }

  @Command("randombytopic")
  async randomByTopicCommand(@Ctx() ctx: Context) {
    try {
      const topics = await this.questionService.countQuestionsByTopic();

      if (!topics) {
        throw new ServiceUnavailableException(
          "Service failed to retrieve question topics",
        );
      }
      const descSortedTopics = topics.sort(
        (a, b) => b.totalByTopic - a.totalByTopic,
      );
      const keyboardData = descSortedTopics.map((topic) => ({
        buttonText: `${topic._id} [${topic.totalByTopic}]`,
        callbackData: `selectedTopic:${topic._id}`,
      }));
      const keyboard = this.botService.createInlineKeyboard(keyboardData);
      await ctx.reply("Pick any topic from the list below:", {
        ...keyboard,
      });
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }

  @Command("saved")
  async handleSavedQuestions(@Ctx() ctx: Context) {
    try {
      const userName = ctx.from?.username;
      if (!userName) {
        throw new UnauthorizedException("Please sign in.");
      }
      const user = await this.userService.findByName(userName);
      if (!user) {
        throw new UnauthorizedException("Please sign in.");
      }
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
        const { fullMessage: questionMessage } = this.buildQuestion(q);
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
  async handleRandomQuestionAnswer(@Ctx() ctx: Context) {
    try {
      await ctx.answerCbQuery();
      const cbQuery = ctx.callbackQuery;

      if (!cbQuery || !("data" in cbQuery)) {
        return;
      }

      const [, id, choice] = cbQuery.data.split(":");

      const question = await this.questionService.findById(id);
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
      const saveQuestionButton = {
        buttonText: "⭐ Save question",
        callbackData: `save:${question._id.toString()}`,
      };
      const nextQuestionButton = {
        buttonText: "⏭ Next",
        callbackData: "next",
      };
      const keyboard = this.botService.createInlineKeyboard([
        saveQuestionButton,
        nextQuestionButton,
      ]);
      await ctx.editMessageText(header + body + code + feedback, {
        parse_mode: "HTML",
        ...keyboard,
      });
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }

  @Action("next")
  async handleNextQuestion(@Ctx() ctx: Context) {
    try {
      await ctx.answerCbQuery();
      const cbQuery = ctx.callbackQuery;

      if (!cbQuery || !("data" in cbQuery)) return;

      const questionData = await this.questionService.findRandom();
      if (!questionData) {
        throw new ServiceUnavailableException("Failed to get next question");
      }

      const { fullMessage, keyboard } = this.buildQuestion(questionData);
      await ctx.editMessageText(fullMessage, {
        parse_mode: "HTML",
        ...keyboard,
      });
    } catch (error: unknown) {
      await ctx.reply(getErrorMessage(error));
    }
  }

  @Action(/selectedTopic:(.+)/)
  async onTopicPick(@Ctx() ctx: Context) {
    const cbQuery = ctx.callbackQuery;

    if (!cbQuery || !("data" in cbQuery)) {
      return;
    }

    const [, topicName] = cbQuery.data.split(":");

    await ctx.editMessageText(`You picked: ${topicName}`);

    const question = await this.questionService.findRandomByTopic(topicName);

    if (!question) {
      throw new ServiceUnavailableException(
        "Service failed to generate a question",
      );
    }
    const { fullMessage, keyboard } = this.buildQuestion(question);
    await ctx.reply(fullMessage, {
      parse_mode: "HTML",
      ...keyboard,
    });
  }

  @Action(/^save:/)
  async handleSaveQuestion(@Ctx() ctx: Context) {
    try {
      await ctx.answerCbQuery();
      const cbQuery = ctx.callbackQuery;

      if (!cbQuery || !("data" in cbQuery)) {
        return;
      }

      const [, questionId] = cbQuery.data.split(":");
      const userName = ctx.from?.username;
      if (!userName) {
        throw new UnauthorizedException("Please sign in.");
      }
      const user = await this.userService.findByName(userName);
      if (!user) {
        throw new UnauthorizedException("Please sign in.");
      }
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
  async handleUnSaveQuestion(@Ctx() ctx: Context) {
    try {
      await ctx.answerCbQuery();
      const cbQuery = ctx.callbackQuery;

      if (!cbQuery || !("data" in cbQuery)) {
        return;
      }

      const [, questionId] = cbQuery.data.split(":");
      const userName = ctx.from?.username;
      if (!userName) {
        throw new UnauthorizedException("Please sign in.");
      }
      const user = await this.userService.findByName(userName);
      if (!user) {
        throw new UnauthorizedException("Please sign in.");
      }
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
