export const ENV_KEYS = {
  tgBot: "TELEGRAM_BOT_TOKEN",
  googleStudio: "GOOGLE_AI_STUDIO_API_KEY",
  mongoURI: "MONGO_URI",
  nodeEnv: "NODE_ENV",
  vercelDomain: "VERCEL_DOMAIN",
  telegramWebhookPath: "TELEGRAM_WEBHOOK_PATH",
};
export type EvnKey = keyof typeof ENV_KEYS;
