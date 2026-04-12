import { Scenes } from 'telegraf';

import { BotContext } from '../bot.context';
import { MyWizardState } from './wizard-state.interface';

export type WizardSceenContext = BotContext &
  Scenes.WizardContext<MyWizardState>;
