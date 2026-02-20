import { Command, Ctx, Update } from "nestjs-telegraf";
import { UserService } from "src/users/user.service";
import { Context } from "telegraf";
@Update()
export class UserCommand {
  constructor(private readonly userService: UserService) {}
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
}
