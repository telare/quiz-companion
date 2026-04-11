import { GoogleGenAI } from '@google/genai';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { getEnvValue } from '../../common/utils';
import { AiService } from './ai.service';

@Module({
  imports: [HttpModule],
  providers: [
    AiService,
    {
      provide: 'AI_CLIENT',
      useFactory: (configService: ConfigService) => {
        const apiKey = getEnvValue(configService, 'googleStudio');
        return new GoogleGenAI({ apiKey });
      },
      inject: [ConfigService],
    },
  ],
  exports: [AiService],
})
export class AiModule {}
