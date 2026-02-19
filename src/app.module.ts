import { Module } from "@nestjs/common";
import { BotModule } from "./bot/bot.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "./ai/ai.module";
import { UsersModule } from "./users/user.module";
import { QuestionModule } from "./question/question.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BotModule,
    AiModule,
    UsersModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URI"),
      }),
    }),
    QuestionModule,
  ],
})
export class AppModule {}
