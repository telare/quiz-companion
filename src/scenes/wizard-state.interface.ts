import { Scenes } from 'telegraf';

import {
  Difficulty,
  JS_TopicTitle,
  ENGLISH_TopicTitle,
  Category,
} from '../modules/question/entities/question.entity';
import { UserRank } from '../modules/users/entities/user.entity';
export interface MyWizardState extends Scenes.WizardSessionData {
  category?: Category;
  currentIndex?: number;
  difficulty?: Difficulty;
  mode?: 'popular';
  questionIds?: string[];
  quizLength?: number;
  rank?: UserRank;
  runStatistic: {
    correct: number;
    incorrect: number;
  };
  topic?: TopicTitle;
  totalPoints?: number;
  userId?: string;
  userName?: string;
}
export type TopicTitle = ENGLISH_TopicTitle | JS_TopicTitle;
