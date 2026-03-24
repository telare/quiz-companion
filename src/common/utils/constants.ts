import { Difficulty } from "../../schemas";

export const DIFFICULTY_MULTIPLIERS: Readonly<Record<Difficulty, number>> = {
  junior: 1,
  middle: 2,
  senior: 3,
};

export const REPLY_KEYBOARD_BUTTONS_TEXT: Readonly<Record<string, string>> = {
  StartQuiz: "🚀 Start Quiz",
  Ranking: "🏆 Ranking",
  MyProfile: "📊 My Profile",
  HelpMe: "💡 Help Me",
  ShowSaved: "📌 Show Saved",
  CancelQuiz: "🚫 Cancel Quiz",
};

export const AVAILABLE_COMMANDS: Readonly<Record<string, string>> = {
  start: "/start",
  quiz: "/quiz",
  saved: "/saved",
  my: "/my",
  ranking: "/ranking",
  help: "/help",
};

export const DEFAULT_REPLY_KEYBOARD_MSG =
  "Look at buttons at the bottom! Feel free to use them for navigation";
