import { Ctx, Start, Update } from "nestjs-telegraf";
import { UserService } from "../../users/user.service";
import { Scenes } from "telegraf";

@Update()
export class StartCommand {
  constructor(private readonly userService: UserService) {}
  @Start()
  async startCommand(@Ctx() ctx: Scenes.SceneContext) {
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

    await ctx.reply(
      `Hi @${username}! It is the bot for your tests! To run send /quiz`,
    );
  }
}
