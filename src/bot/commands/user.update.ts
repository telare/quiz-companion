import { Command, Ctx, Update } from "nestjs-telegraf";
import { UserService } from "src/users/user.service";
import { Context } from "telegraf";
@Update()
export class UserCommand {
  constructor(private readonly userService: UserService) {}

  @Command("my")
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
        info.totalPoints &&
          `<b>Total points:</b> <code>${info.totalPoints}</code>`,
      ].join("\n");

      await ctx.reply(message, { parse_mode: "HTML" });
    }
  }

  @Command("ranking")
  async getAppRanking(@Ctx() ctx: Context) {
    const users = await this.userService.findAll();
    if (!users || users.length === 0) {
      return await ctx.reply("No users have been found.");
    }

    const sortedUsers = users.sort(
      (a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0),
    );

    const ranking = sortedUsers
      .map((u, i) => {
        let medal = "";
        if (i === 0) medal = "🥇 ";
        else if (i === 1) medal = "🥈 ";
        else if (i === 2) medal = "🥉 ";
        else medal = `<b>${i + 1}.</b> `;

        return `${medal}@${u.username} — <code>${u.totalPoints ?? 0}</code> pts`;
      })
      .slice(0, 10)
      .join("\n");

    const message = `<b>🏆 Global Ranking 🏆</b>\n\n${ranking}`;

    await ctx.reply(message, { parse_mode: "HTML" });
  }
}
