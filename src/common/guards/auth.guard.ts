import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';

import { BotContext } from '../../bot.context';
import { UserService } from '../../modules/users/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const telegrafHost = TelegrafExecutionContext.create(context);
    const ctx = telegrafHost.getContext<BotContext>();
    const userName = ctx.from?.username;
    if (!userName) {
      await ctx.reply(
        'Please set a username in your Telegram settings to use this bot.',
      );
      return false;
    }

    const userInfo = await this.userService.findByName(userName);
    if (!userInfo) {
      await ctx.reply('Please initialize the bot by sending /start first.');
      return false;
    }
    ctx.dbUser = userInfo;
    return true;
  }
}
