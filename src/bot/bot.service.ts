import { Injectable } from "@nestjs/common";
import { Markup } from "telegraf";

@Injectable()
export class BotService {
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
}
