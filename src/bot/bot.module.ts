import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BotUpdate } from "./bot.update";
import { AiModule } from "src/ai/ai.module";
import { UsersModule } from "src/users/user.module";
import { QuestionModule } from "src/question/question.module";
import { ENV_KEYS } from "src/utils/keys";

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
  providers: [BotUpdate],
})
export class BotModule {}
