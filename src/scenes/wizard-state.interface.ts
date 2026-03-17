import {
  Difficulty,
  JS_TopicTitle,
  ENGLISH_TopicTitle,
  Category,
} from "../schemas/question.schema";
import { Scenes } from "telegraf";
export type TopicTitle = ENGLISH_TopicTitle | JS_TopicTitle;
export interface MyWizardState extends Scenes.WizardSessionData {
  userName?: string;
  userId?: string;
  topic?: TopicTitle;
  difficulty?: Difficulty;
  category?: Category;
  quizLength?: number;
  questionIds?: string[];
  currentIndex?: number;
  runStatistic: {
    correct: number;
    incorrect: number;
  };
}
