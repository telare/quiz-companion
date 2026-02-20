import {
  Action,
  Command,
  Ctx,
  TelegrafException,
  Update,
} from "nestjs-telegraf";
import { AiService } from "src/ai/ai.service";
import { QuestionService } from "src/question/question.service";
import { Context, Markup } from "telegraf";
@Update()
export class QuizCommand {
  constructor(
    private readonly aiService: AiService,
    private readonly questionService: QuestionService,
  ) {}
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
