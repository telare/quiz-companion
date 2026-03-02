import { Injectable } from "@nestjs/common";
import { Markup } from "telegraf";

@Injectable()
export class BotService {
  createQuestionAnswersKeyboard(
    displayButtons: string[],
    callbackData: string,
    columns: number = 1,
  ) {
    return Markup.inlineKeyboard(
      displayButtons.map((answerText, index) => {
        const cleanText = answerText.replace(/\\n/g, " ").replace(/\n/g, " ");

        return Markup.button.callback(cleanText, `${callbackData}${index}`);
      }),
      { columns },
    );
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
}
