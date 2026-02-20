import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AiModule } from "src/ai/ai.module";
import { UsersModule } from "src/users/user.module";
import { QuestionModule } from "src/question/question.module";
import { ENV_KEYS } from "src/utils/keys";
import { StartCommand } from "./commands/start.update";
import { HelpCommand } from "./commands/help.update";
import { QuizCommand } from "./commands/quiz.update";
import { UserCommand } from "./commands/user.update";

@Module({
  imports: [
    UsersModule,
    QuestionModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>(ENV_KEYS.tgBot);
        if (!secret) {
          throw new Error("Error in credentials");
        }
        return { token: secret };
      },
      inject: [ConfigService],
    }),
    AiModule,
  ],
  providers: [StartCommand, HelpCommand, QuizCommand, UserCommand],
})
export class BotModule {}
