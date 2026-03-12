import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AiModule } from "../ai/ai.module";
import { UsersModule } from "../users/user.module";
import { QuestionModule } from "../question/question.module";
import { StartCommand } from "./commands/start.update";
import { HelpCommand } from "./commands/help.update";
import { QuizCommand } from "./commands/quiz.update";
import { UserCommand } from "./commands/user.update";
import { BotService } from "./bot.service";
import { BotController } from "./bot.controller";
import { FavoriteQuestionModule } from "src/favorite-question/favorite-question.module";
import { getEnvValue } from "src/utils";

@Module({
  imports: [
    UsersModule,
    QuestionModule,
    FavoriteQuestionModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = getEnvValue(configService, "tgBot");
        const isProd = getEnvValue(configService, "nodeEnv") === "production";
        const domain = getEnvValue(configService, "vercelDomain");
        const hookPath = getEnvValue(configService, "telegramWebhookPath");

        return {
          token: secret,
          launchOptions: isProd
            ? {
                webhook: {
                  domain: `https://${domain}`,
                  hookPath,
                },
              }
            : {},
        };
      },
    }),
    AiModule,
  ],
  providers: [StartCommand, BotService, HelpCommand, QuizCommand, UserCommand],
  controllers: [BotController],
})
export class BotModule {}
