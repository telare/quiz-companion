export const ENV_KEYS = {
  tgBot: "TELEGRAM_BOT_TOKEN",
  googleStudio: "GOOGLE_AI_STUDIO_API_KEY",
  mongoURI: "MONGO_URI",
};
export type EvnKey = keyof typeof ENV_KEYS;
