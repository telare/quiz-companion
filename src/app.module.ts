import { Module } from "@nestjs/common";
import { BotModule } from "./bot/bot.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "./ai/ai.module";
import { UsersModule } from "./users/user.module";
import { QuestionModule } from "./question/question.module";
import { ENV_KEYS } from "./utils/keys";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BotModule,
    AiModule,
    UsersModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>(ENV_KEYS.mongoURI);
        if (!secret) {
          throw new Error("Error in credentials");
        }
        return { uri: secret };
      },
    }),
    QuestionModule,
  ],
})
export class AppModule {}
