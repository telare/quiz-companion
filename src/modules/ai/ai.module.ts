import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";
import { getEnvValue } from "../../common/utils";

@Module({
  imports: [HttpModule],
  providers: [
    AiService,
    {
      provide: "AI_CLIENT",
      useFactory: (configService: ConfigService) => {
        const apiKey = getEnvValue(configService, "googleStudio");
        return new GoogleGenAI({ apiKey });
      },
      inject: [ConfigService],
    },
  ],
  exports: [AiService],
})
export class AiModule {}
