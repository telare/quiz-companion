/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Req, Res } from "@nestjs/common";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from "telegraf";

@Controller("api")
export class BotController {
  constructor(@InjectBot() private readonly bot: Telegraf<any>) {}

  @Post("webhook")
  async handleWebhook(@Req() req: any, @Res() res: any) {
    return await this.bot.handleUpdate(req.body, res);
  }
}
