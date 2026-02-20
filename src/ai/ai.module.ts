import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { ENV_KEYS } from "src/utils/keys";

@Module({
  imports: [HttpModule],
  providers: [
    AiService,
    {
      provide: "AI_CLIENT",
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>(ENV_KEYS.googleStudio);
        if (!apiKey) {
          throw new Error("Error in credentials");
        }
        return new GoogleGenAI({ apiKey });
      },
      inject: [ConfigService],
    },
  ],
  exports: [AiService],
})
export class AiModule {}
