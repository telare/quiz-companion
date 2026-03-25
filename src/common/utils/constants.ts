import { Difficulty } from "../../modules/question/entities/question.entity";

export const DIFFICULTY_MULTIPLIERS = {
  junior: 1,
  middle: 2,
  senior: 3,
} as const satisfies Record<Difficulty, number>;

export const REPLY_KEYBOARD_BUTTONS_TEXT = {
  StartQuiz: "🚀 Start Quiz",
  Ranking: "🏆 Ranking",
  MyProfile: "📊 My Profile",
  HelpMe: "💡 Help Me",
  ShowSaved: "📌 Show Saved",
  CancelQuiz: "🚫 Cancel Quiz",
} as const;

export const AVAILABLE_COMMANDS = {
  start: "/start",
  quiz: "/quiz",
  saved: "/saved",
  my: "/my",
  ranking: "/ranking",
  help: "/help",
} as const;

export const DEFAULT_REPLY_KEYBOARD_MSG =
  "Look at buttons at the bottom! Feel free to use them for navigation";
