import { Command, Ctx, Update } from "nestjs-telegraf";
import { UserService } from "../../users/user.service";
import { BotContext } from "../../bot.context";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "../../auth.guard";

@UseGuards(AuthGuard)
@Update()
export class UserCommand {
  constructor(private readonly userService: UserService) {}

  @Command("my")
  async getMyInfoCommand(@Ctx() ctx: BotContext) {
    const user = ctx.dbUser;
    if (!user) {
      return await ctx.reply("User profile not found. Please use /start.");
    }

    const message = [
      "<b>📋 Your Profile:</b>",
      "",
      `🏷 <b>Username:</b> @${user.username}`,
      `✨ <b>Total Points:</b> <code>${user.totalPoints ?? 0}</code>`,
      "",
      "Keep practicing to improve your score!",
    ].join("\n");

    await ctx.reply(message, { parse_mode: "HTML" });
  }

  @Command("ranking")
  async getAppRanking(@Ctx() ctx: BotContext) {
    const users = await this.userService.findAll();
    if (!users || users.length === 0) {
      return await ctx.reply("No users have been found.");
    }

    const sortedUsers = users.sort(
      (a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0),
    );

    const currentUser = ctx.dbUser;
    const userRankIndex = sortedUsers.findIndex(
      (u) => u.username === currentUser.username,
    );

    const rankingLines = sortedUsers.slice(0, 10).map((u, i) => {
      let prefix = "";
      if (i === 0) prefix = "🥇 ";
      else if (i === 1) prefix = "🥈 ";
      else if (i === 2) prefix = "🥉 ";
      else prefix = `<b>${i + 1}.</b> `;

      const isMe = u.username === currentUser.username;
      const line = `${prefix}@${u.username} — <code>${u.totalPoints ?? 0}</code> pts`;
      return isMe ? `👉 <b>${line}</b>` : line;
    });

    let message = `<b>🏆 Global Leaderboard 🏆</b>\n\n${rankingLines.join("\n")}`;

    if (userRankIndex >= 10) {
      message += `\n...\n👉 <b>${userRankIndex + 1}. @${currentUser.username} — <code>${currentUser.totalPoints ?? 0}</code> pts</b>`;
    }

    await ctx.reply(message, { parse_mode: "HTML" });
  }
}
