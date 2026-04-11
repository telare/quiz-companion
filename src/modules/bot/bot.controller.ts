import { Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Update } from 'telegraf/types';
import { Request, Response } from 'express';

@Controller('api')
@ApiTags('Bot Webhook')
export class BotController {
  constructor(@InjectBot() private readonly bot: Telegraf) {}
  private readonly logger = new Logger(BotController.name);

  @ApiOkResponse({ description: 'Webhook handled successfully' })
  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const body = req.body as Update;
    const updateId = body?.update_id;
    this.logger.log(`---> Received Update ID: ${updateId}`);
    try {
      const start = Date.now();

      await this.bot.handleUpdate(body);

      const duration = Date.now() - start;
      this.logger.log(`<--- Processed Update ID: ${updateId} in ${duration}ms`);

      return res.status(200).send('OK');
    } catch (e) {
      this.logger.error('Error handling update:', e);
      return res.status(500).send('Error');
    }
  }
}
