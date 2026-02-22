import { Injectable } from "@nestjs/common";
import { Markup } from "telegraf";

@Injectable()
export class BotService {
  constructor() {}
  createInlineKeyboard(
    displayButtons: string[],
    callbackData: string,
    columns: number = 1,
  ) {
    return Markup.inlineKeyboard(
      displayButtons.map((answerText, index) => {
        return Markup.button.callback(answerText, callbackData + `${index}`);
      }),
      { columns },
    );
  }
}
