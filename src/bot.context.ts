import { Context as TelegrafContext } from 'telegraf';
import { HydratedDocument } from 'mongoose';
import { User } from './modules/users/entities/user.entity';

export interface BotContext extends TelegrafContext {
  dbUser: HydratedDocument<User>;
}
