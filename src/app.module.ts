import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';

import { LoggerMiddleware } from './common/loggers';
import { getEnvValue } from './common/utils';
import { AiModule } from './modules/ai/ai.module';
import { BotModule } from './modules/bot/bot.module';
import { FavoriteQuestionModule } from './modules/favorite-question/favorite-question.module';
import { HealthModule } from './modules/health/health.module';
import { QuestionModule } from './modules/question/question.module';
import { UsersModule } from './modules/users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        VERCEL_DOMAIN: Joi.string().required(),
        TELEGRAM_WEBHOOK_PATH: Joi.string().default('/webhook'),
        QUIZ_API_ENDPOINT: Joi.string().required(),
        GOOGLE_AI_STUDIO_API_KEY: Joi.string().required(),
        TELEGRAM_BOT_TOKEN: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = getEnvValue(configService, 'mongoURI');
        return { uri };
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),
    AiModule,
    UsersModule,
    QuestionModule,
    FavoriteQuestionModule,
    BotModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
