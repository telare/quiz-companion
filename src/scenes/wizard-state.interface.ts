import { Scenes } from "telegraf";

export interface MyWizardState extends Scenes.WizardSessionData {
  userName?: string;
  userId?: string;
  topic?: string;
  difficulty?: string;
  quizLength?: number;
  questionIds?: string[];
  currentIndex?: number;
  score?: number;
  runStatistic: {
    correct: number;
    incorrect: number;
  };
}
