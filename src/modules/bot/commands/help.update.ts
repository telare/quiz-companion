import { Help, Ctx, Update, Hears } from "nestjs-telegraf";
import { AVAILABLE_COMMANDS } from "../../../common/utils";
import { Context } from "telegraf";

@Update()
export class HelpCommand {
  @Help()
  @Hears(/💡 Help me/)
  async helpCommand(@Ctx() ctx: Context) {
    const message = [
      "<b>Available commands:</b>",
      "",
      AVAILABLE_COMMANDS.start + " - Start the bot",
      AVAILABLE_COMMANDS.quiz + " - Start a new quiz session",
      AVAILABLE_COMMANDS.saved + " - View your saved questions",
      AVAILABLE_COMMANDS.my + " - View your profile information",
      AVAILABLE_COMMANDS.ranking + " - View the global leaderboard",
      AVAILABLE_COMMANDS.help + " - Show this help message",
      "",
      "<i>Tip: You can save questions during a quiz to review them later!</i>",
    ].join("\n");

    await ctx.reply(message, { parse_mode: "HTML" });
  }
}
