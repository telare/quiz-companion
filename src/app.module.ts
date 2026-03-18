import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { BotModule } from "./modules/bot/bot.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AiModule } from "./modules/ai/ai.module";
import { getEnvValue } from "./common/utils";
import { UsersModule } from "./modules/users/user.module";
import { QuestionModule } from "./modules/question/question.module";
import { FavoriteQuestionModule } from "./modules/favorite-question/favorite-question.module";
import { LoggerMiddleware } from "./common/loggers";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = getEnvValue(configService, "mongoURI");
        return { uri };
      },
    }),
    AiModule,
    UsersModule,
    QuestionModule,
    FavoriteQuestionModule,
    BotModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
