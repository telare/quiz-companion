import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI } from "@google/genai";

@Module({
  imports: [HttpModule],
  providers: [
    AiService,
    {
      provide: "AI_CLIENT",
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>("GOOGLE_AI_STUDIO_API_KEY");
        return new GoogleGenAI({ apiKey });
      },
      inject: [ConfigService],
    },
  ],
  exports: [AiService],
})
export class AiModule {}
