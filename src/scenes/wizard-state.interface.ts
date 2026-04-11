import {
  Difficulty,
  JS_TopicTitle,
  ENGLISH_TopicTitle,
  Category,
} from '../modules/question/entities/question.entity';
import { Scenes } from 'telegraf';
import { UserRank } from '../modules/users/entities/user.entity';
export type TopicTitle = ENGLISH_TopicTitle | JS_TopicTitle;
export interface MyWizardState extends Scenes.WizardSessionData {
  userName?: string;
  userId?: string;
  topic?: TopicTitle;
  mode?: 'popular';
  totalPoints?: number;
  difficulty?: Difficulty;
  rank?: UserRank;
  category?: Category;
  quizLength?: number;
  questionIds?: string[];
  currentIndex?: number;
  runStatistic: {
    correct: number;
    incorrect: number;
  };
}
