import { Help, Ctx, Update } from "nestjs-telegraf";
import { Context } from "telegraf";

@Update()
export class HelpCommand {
  @Help()
  async helpCommand(@Ctx() ctx: Context) {
    const message = [
      "<b>Available commands:</b>",
      "",
      "/start - Start the bot",
      "/quiz - Start a new quiz session",
      "/saved - View your saved questions",
      "/my - View your profile information",
      "/ranking - View the global leaderboard",
      "/help - Show this help message",
      "",
      "<i>Tip: You can save questions during a quiz to review them later!</i>",
    ].join("\n");

    await ctx.reply(message, { parse_mode: "HTML" });
  }
}
