import { Difficulty, TopicTitle, Category } from "../schemas/question.schema";
import { Scenes } from "telegraf";

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
