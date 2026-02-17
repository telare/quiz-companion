import { Update, Start, Ctx, Help, Command, Action } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { AiService } from 'src/ai/ai.service';

@Update()
export class BotUpdate {
  constructor(private readonly aiService: AiService) {}
  @Start()
  async startCommand(@Ctx() ctx: Context) {
    await ctx.reply('Hi! It is the bot for your tests!');
  }

  @Help()
  async helpCommand(@Ctx() ctx: Context) {
    await ctx.reply(
      'This bot can send you a quiz. Just use the /quiz command.',
    );
  }

  // @Command('quiz')
  // async quizCommand(@Ctx() ctx: Context) {
  //   const question = 'Which framework is this bot built with?';
  //   const keyboard = Markup.inlineKeyboard(
  //     [
  //       Markup.button.callback('NestJS', 'answer_nestjs'),
  //       Markup.button.callback('Express', 'answer_express'),
  //       Markup.button.callback('Fastify', 'answer_fastify'),
  //     ],
  //     { columns: 1 },
  //   );
  //   await ctx.reply(question, keyboard);
  // }

  // @Action('answer_nestjs')
  // async handleCorrectAnswer(@Ctx() ctx: Context) {
  //   // Acknowledge the button press (this shows a small toast notification)
  //   await ctx.answerCbQuery('Correct! 🎉');

  //   // Send a new message with the result.
  //   // The original message with buttons will stay in the chat and remain clickable.
  //   await ctx.reply('You chose NestJS. That is correct!');
  // }

  @Command('random')
  async randomCommand(@Ctx() ctx: Context) {
    const questionData = await this.aiService.getRandomQuestion();
    const question = questionData.question;
    const keyboard = Markup.inlineKeyboard(
      questionData.answers.map((ans) =>
        Markup.button.callback(ans, `answear_${ans}`),
      ),
      {
        columns: 1,
      },
    );
    await ctx.reply(question, keyboard);
  }
}
