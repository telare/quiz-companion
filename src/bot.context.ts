import { Context as TelegrafContext } from "telegraf";
import { HydratedDocument } from "mongoose";
import { User } from "./schemas/user.schema";

export interface BotContext extends TelegrafContext {
  dbUser: HydratedDocument<User>;
}
