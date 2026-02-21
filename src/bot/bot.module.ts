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

@Module({
  imports: [
    UsersModule,
    QuestionModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = getEnvValue(configService, "tgBot");

        return { token: secret };
      },
      inject: [ConfigService],
    }),
    AiModule,
  ],
  providers: [StartCommand, HelpCommand, QuizCommand, UserCommand],
})
export class BotModule {}
