import {
  Update,
  Start,
  Ctx,
  Help,
  Command,
  Action,
  TelegrafException,
} from "nestjs-telegraf";
import { Context, Markup } from "telegraf";
import { AiService } from "src/ai/ai.service";
import { UserService } from "src/users/user.service";
import { QuestionService } from "src/question/question.service";

@Update()
export class BotUpdate {
  constructor(
    private readonly aiService: AiService,
    private readonly userService: UserService,
    private readonly questionService: QuestionService,
  ) {}

  @Start()
  async startCommand(@Ctx() ctx: Context) {
    const userInfo = ctx.from;
    const username = userInfo?.username;

    if (!username) {
      return await ctx.reply(
        "Hi user! What do you want to do? /help to get more info",
      );
    }

    const userInDb = await this.userService.findByName(username);
    if (!userInDb) {
      await this.userService.create({ username });
    }

    await ctx.reply(`Hi @${username}! It is the bot for your tests!`);
  }

  @Help()
  async helpCommand(@Ctx() ctx: Context) {
    await ctx.reply(
      "This bot can send you a quiz. Just use the /quiz command.",
    );
  }

  @Command("myInfo")
  async getMyInfoCommand(@Ctx() ctx: Context) {
    const userInfo = ctx.from;
    const username = userInfo?.username;
    if (username) {
      const info = await this.userService.findByName(username);
      if (!info) {
        return await ctx.reply(
          `The User @${username} hasn't found in the database.`,
        );
      }
      const message = [
        `<b>📋 Your information:</b>`,
        `🏷 <b>Username:</b> @${username}`,
        `🆔 <b>ID:</b> <code>${info.id}</code>`,
        info.totalPoints &&
          `<b>Total points:</b> <code>${info.totalPoints}</code>`,
      ].join("\n");

      await ctx.reply(message, { parse_mode: "HTML" });
    }
  }

  @Command("random")
  async randomCommand(@Ctx() ctx: Context) {
    const questionData = await this.aiService.getRandomQuestion();
    if (!questionData) {
      return await ctx.reply(
        "Sorry unexpected error, please, try again later.",
      );
    }

    const question = questionData.question;
    try {
      const savedQuestion = await this.questionService.create({
        correctAnswer: questionData.correctOption,
        options: questionData.options,
        text: question,
      });
      const questionId = savedQuestion._id.toString();
      const keyboard = Markup.inlineKeyboard(
        questionData.options.map((answerText, index) => {
          const callbackData = `quiz:${questionId}:${index}`;

          return Markup.button.callback(answerText, callbackData);
        }),
        { columns: 1 },
      );
      await ctx.reply(question, keyboard);
    } catch (error) {
      if (error instanceof TelegrafException) {
        console.log(error.message);
        await ctx.reply("Sorry saving error occurs, please, try again later.");
      }
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

      const feedback = result.isCorrect
        ? `✅ Correct!`
        : `❌ Error. The correct answer is: ${result.correctAnswer}`;

      await ctx.reply(feedback);
    } catch (error) {
      if (error instanceof TelegrafException) {
        console.log(error.message);
        await ctx.reply("Sorry saving error occurs, please, try again later.");
      }
    }
  }
}
