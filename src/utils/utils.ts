import { ConfigService } from "@nestjs/config";
import { ENV_KEYS, EvnKey } from "./keys";

export const getEnvValue = (configService: ConfigService, key: EvnKey) => {
  const value = configService.get<string>(ENV_KEYS[key]);
  if (!value) {
    console.log("getEnvValue - check key argument");
    throw new Error("Error in credentials");
  }
  return value;
};
