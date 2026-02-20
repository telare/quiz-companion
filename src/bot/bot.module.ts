import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BotUpdate } from "./bot.update";
import { AiModule } from "src/ai/ai.module";
import { UsersModule } from "src/users/user.module";
import { QuestionModule } from "src/question/question.module";

@Module({
  imports: [
    UsersModule,
    QuestionModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get<string>("TELEGRAM_BOT_TOKEN") || "",
      }),
      inject: [ConfigService],
    }),
    AiModule,
  ],
  providers: [BotUpdate],
})
export class BotModule {}
