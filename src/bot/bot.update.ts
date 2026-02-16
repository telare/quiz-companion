import { Update, Start, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Update()
export class BotUpdate {
  @Start()
  async startCommand(@Ctx() ctx: Context) {
    await ctx.reply('Hi! It is the bot for your tests!');
  }
}
