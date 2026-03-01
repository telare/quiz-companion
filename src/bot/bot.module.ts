import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AiModule } from "src/ai/ai.module";
import { UsersModule } from "src/users/user.module";
import { QuestionModule } from "src/question/question.module";
import { StartCommand } from "./commands/start.update";
import { HelpCommand } from "./commands/help.update";
import { QuizCommand } from "./commands/quiz.update";
import { UserCommand } from "./commands/user.update";
import { getEnvValue } from "src/utils/utils";
import { BotService } from "./bot.service";
import { BotController } from "./bot.controller";

@Module({
  imports: [
    UsersModule,
    QuestionModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
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
            : false,
        };
      },
    }),
    AiModule,
  ],
  providers: [StartCommand, BotService, HelpCommand, QuizCommand, UserCommand],
  controllers: [BotController],
})
export class BotModule {}
