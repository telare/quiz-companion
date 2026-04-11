import { Injectable } from '@nestjs/common';
import {
  DEFAULT_REPLY_KEYBOARD_MSG,
  REPLY_KEYBOARD_BUTTONS_TEXT,
} from '../../common/utils';
import { Context, Markup } from 'telegraf';

@Injectable()
export class BotService {
  private readonly replyKeyboardDefaultMsg: string;
  constructor() {
    this.replyKeyboardDefaultMsg = DEFAULT_REPLY_KEYBOARD_MSG;
  }
  createInlineKeyboard(
    data: { buttonText: string; callbackData: string }[],
    columns: number = 1,
  ) {
    return Markup.inlineKeyboard(
      data.map((button) =>
        Markup.button.callback(button.buttonText, button.callbackData),
      ),
      { columns },
    );
  }

  async replyWithStandardKeyboard(ctx: Context) {
    await ctx.reply(
      this.replyKeyboardDefaultMsg,
      Markup.keyboard([
        [
          REPLY_KEYBOARD_BUTTONS_TEXT.StartQuiz,
          REPLY_KEYBOARD_BUTTONS_TEXT.Ranking,
        ],
        [
          REPLY_KEYBOARD_BUTTONS_TEXT.MyProfile,
          REPLY_KEYBOARD_BUTTONS_TEXT.HelpMe,
        ],
        [REPLY_KEYBOARD_BUTTONS_TEXT.ShowSaved],
      ]).resize(),
    );
  }

  async replyWithQuizKeyboard(ctx: Context) {
    await ctx.reply(
      this.replyKeyboardDefaultMsg,
      Markup.keyboard([
        [REPLY_KEYBOARD_BUTTONS_TEXT.CancelQuiz],
        [
          REPLY_KEYBOARD_BUTTONS_TEXT.Ranking,
          REPLY_KEYBOARD_BUTTONS_TEXT.MyProfile,
        ],
      ]).resize(),
    );
  }
}
