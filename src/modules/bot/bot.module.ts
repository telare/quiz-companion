import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf-session-mongodb';

import { getEnvValue } from '../../common/utils';
import { QuizWizard } from '../../scenes/quiz/quiz.wizard';
import { AiModule } from '../ai/ai.module';
import { FavoriteQuestionModule } from '../favorite-question/favorite-question.module';
import { QuestionModule } from '../question/question.module';
import { UsersModule } from '../users/user.module';
import { BotController } from './bot.controller';
import { BotService } from './bot.service';
import { HelpCommand } from './commands/help.update';
import { QuizCommand } from './commands/quiz.update';
import { StartCommand } from './commands/start.update';
import { UserCommand } from './commands/user.update';
@Module({
  imports: [
    UsersModule,
    QuestionModule,
    FavoriteQuestionModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, getConnectionToken()],
      useFactory: async (
        configService: ConfigService,
        connection: Connection,
      ) => {
        if (connection.readyState !== ConnectionStates.connected) {
          await new Promise((resolve, reject) => {
            connection.once('connected', resolve);
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            connection.once('error', (err) => reject(err));
          }).catch((error) =>
            console.error(
              "Error in bot module's telegraf module factory",
              error,
            ),
          );
        }
        const secret = getEnvValue(configService, 'tgBot');
        const isProd = getEnvValue(configService, 'nodeEnv') === 'production';
        const domain = getEnvValue(configService, 'vercelDomain');
        const hookPath = getEnvValue(configService, 'telegramWebhookPath');

        // Use the native Db object from Mongoose connection
        const db = connection.db;

        return {
          token: secret,
          middlewares: [
            session(db, {
              sessionName: 'session',
              collectionName: 'sessions',
            }),
          ],
          launchOptions: isProd
            ? {
                webhook: {
                  domain: `https://${domain}`,
                  hookPath,
                },
              }
            : {},
        };
      },
    }),
    AiModule,
  ],
  providers: [
    StartCommand,
    QuizWizard,
    BotService,
    HelpCommand,
    QuizCommand,
    UserCommand,
  ],
  controllers: [BotController],
})
export class BotModule {}
