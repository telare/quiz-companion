import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { BotModule } from "./bot/bot.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "./ai/ai.module";
import { UsersModule } from "./users/user.module";
import { QuestionModule } from "./question/question.module";
import { LoggerMiddleware } from "./logger.middleware";
import { FavoriteQuestionModule } from "./favorite-question/favorite-question.module";
import { getEnvValue } from "./utils";

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
        const uri = getEnvValue(configService, "mongoURI");
        return { uri };
      },
    }),
    QuestionModule,
    FavoriteQuestionModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
