import { Help, Ctx, Update } from "nestjs-telegraf";
import { Context } from "telegraf";
@Update()
export class HelpCommand {
  @Help()
  async helpCommand(@Ctx() ctx: Context) {
    await ctx.reply(
      "This bot can send you a quiz. Just use the /quiz command.",
    );
  }
}
