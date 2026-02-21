import { ConfigService } from "@nestjs/config";
import { ENV_KEYS, EvnKey } from "./keys";
import { InternalServerErrorException } from "@nestjs/common";

export const getEnvValue = (configService: ConfigService, key: EvnKey) => {
  const value = configService.get<string>(ENV_KEYS[key]);
  if (!value) {
    throw new InternalServerErrorException(
      `Missing environment variable for: ${key}`,
    );
  }
  return value;
};
