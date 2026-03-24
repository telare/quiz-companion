import { Ctx, Start, Update } from "nestjs-telegraf";
import { UserService } from "../../users/user.service";
import { BotService } from "../bot.service";
import { BotContext } from "../../../bot.context";
import { UserRank } from "../../../schemas";
import { AVAILABLE_COMMANDS } from "../../../common/utils";

@Update()
export class StartCommand {
  constructor(
    private readonly userService: UserService,
    private readonly botService: BotService,
  ) {}
  @Start()
  async startCommand(@Ctx() ctx: BotContext) {
    const userInfo = ctx.from;
    const username = userInfo?.username;

    if (!username) {
      return await ctx.reply(
        "Hi user! What do you want to do? /help to get more info",
      );
    }

    const userInDb = await this.userService.findByName(username);
    if (!userInDb) {
      await this.userService.create({ username, rank: UserRank.Iron });
    }

    await this.botService.replyWithStandardKeyboard(ctx);

    await ctx.reply(
      [
        `👋 <b>Welcome, @${username}!</b>`,
        "",
        "I'm your <b>Quiz Master Bot</b>. I can help you test your knowledge on various programming topics.",
        "",
        `🚀 To begin a quiz, use the ${AVAILABLE_COMMANDS.quiz} command.`,
        `📊 To see your profile, use ${AVAILABLE_COMMANDS.my}.`,
        `💡 For a list of all commands, use ${AVAILABLE_COMMANDS.help}.`,
        "You can also use buttons at the bottom!",
        "Let's start learning!",
      ].join("\n"),
      { parse_mode: "HTML" },
    );
  }
}
