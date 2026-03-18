/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Controller, Logger, Post, Req, Res } from "@nestjs/common";
import { InjectBot } from "nestjs-telegraf";
import { Telegraf } from "telegraf";

@Controller("api")
export class BotController {
  constructor(@InjectBot() private readonly bot: Telegraf<any>) {}
  private readonly logger = new Logger(BotController.name);

  @Post("webhook")
  async handleWebhook(@Req() req: any, @Res() res: any) {
    const updateId = req.body?.update_id;
    this.logger.log(`---> Received Update ID: ${updateId}`);
    try {
      const start = Date.now();

      await this.bot.handleUpdate(req.body);

      const duration = Date.now() - start;
      this.logger.log(`<--- Processed Update ID: ${updateId} in ${duration}ms`);

      return res.status(200).send("OK");
    } catch (e) {
      this.logger.error("Error handling update:", e);
    }
  }
}
