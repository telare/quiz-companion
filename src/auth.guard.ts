import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { TelegrafExecutionContext } from "nestjs-telegraf";
import { UserService } from "./users/user.service";
import { BotContext } from "./bot.context";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const telegrafHost = TelegrafExecutionContext.create(context);
    const ctx = telegrafHost.getContext<BotContext>();
    const userName = ctx.from?.username;
    if (!userName) {
      await ctx.reply("Please sign in.");
      return false;
    }

    const userInfo = await this.userService.findByName(userName);
    if (!userInfo) {
      await ctx.reply("Please sign in.");
      return false;
    }
    ctx.dbUser = userInfo;
    return true;
  }
}
