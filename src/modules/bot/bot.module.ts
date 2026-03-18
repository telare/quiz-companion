import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AiModule } from "../ai/ai.module";
import { UsersModule } from "../users/user.module";
import { QuestionModule } from "../question/question.module";
import { StartCommand } from "./commands/start.update";
import { HelpCommand } from "./commands/help.update";
import { QuizCommand } from "./commands/quiz.update";
import { UserCommand } from "./commands/user.update";
import { BotService } from "./bot.service";
import { BotController } from "./bot.controller";
import { FavoriteQuestionModule } from "../favorite-question/favorite-question.module";
import { getEnvValue } from "../../common/utils";
import { session } from "telegraf-session-mongodb";
import { QuizWizard } from "../../scenes/quiz/quiz.wizard";
import { Connection, ConnectionStates } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";
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
            connection.once("connected", resolve);
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            connection.once("error", (err) => reject(err));
          }).catch((error) =>
            console.error(
              "Error in bot module's telegraf module factory",
              error,
            ),
          );
        }
        const secret = getEnvValue(configService, "tgBot");
        const isProd = getEnvValue(configService, "nodeEnv") === "production";
        const domain = getEnvValue(configService, "vercelDomain");
        const hookPath = getEnvValue(configService, "telegramWebhookPath");

        // Use the native Db object from Mongoose connection
        const db = connection.db;

        return {
          token: secret,
          middlewares: [
            session(db, {
              sessionName: "session",
              collectionName: "sessions",
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
