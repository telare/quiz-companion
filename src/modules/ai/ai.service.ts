import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { Question } from '../question/entities/question.entity';

const AI_MODEL = 'gemini-2.5-flash';
const RESPONSE_TYPE = 'application/json';
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  constructor(
    @Inject('AI_CLIENT')
    private readonly googleGenAI: GoogleGenAI,
  ) {}

  private getPrompt(topic: string = 'promises', difficulty: string = 'middle') {
    return `Act as a Senior Technical Interviewer. Your task is to generate high-quality JavaScript interview questions designed for a Telegram Quiz Bot.

Generate a JSON object based on the topic: ${topic} at the following difficulty level: ${difficulty}.

TOPIC RESTRICTION:
The "topicTitle" field MUST be exactly one of the following strings. If the provided ${topic} does not match exactly, map it to the closest relevant category from this list:
[Closures, Promises, Event loop, Hoisting, Prototypes, Scopes, This keyword, Async/Await, Generators, Garbage collection, Classes, Currying, Destructuring, Map and Set, WeakMap, Proxy, Reflect, Modules, Strict mode, Type coercion, Symbols, Memory management, Web APIs, DOM API, Design patterns, Performance]

Strict Rules for the JSON output:
1. ONLY output valid JSON. Do not include any conversational text or markdown formatting (like json) before or after the JSON.
2. Adapt complexity to the ${difficulty} level. Focus on syntax/basics for Junior; focus on edge cases, engine internals, and performance for Senior.
3. The "codeSnippet" field must be a single string with properly escaped newlines (\\n) and quotes (\\"). If theoretical, set to null.
4. The "options" field must be an array of exactly 4 strings.
5. The "correctOptionIndex" must be an integer (0-3).
6. The "explanation" field MUST be strictly under 200 characters. Concisely explain the logic or the "gotcha".
7. Use only double quotes "" for JSON keys and string values. Inside code snippets, use single quotes '' where possible.

Structure:
{
  "topicTitle": "Chosen from the restricted list",
  "difficulty": "${difficulty}",
  "questionText": "Question string",
  "codeSnippet": "code_string_or_null",
  "options": ["A", "B", "C", "D"],
  "correctOptionIndex": 0,
  "explanation": "Brief explanation < 200 chars"
}`;
  }
  async getRandomQuestion(): Promise<Question | undefined> {
    const prompt = this.getPrompt();

    try {
      const resp = await this.googleGenAI.models.generateContent({
        model: AI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: RESPONSE_TYPE,
        },
      });
      if (!resp.text) {
        throw new ServiceUnavailableException('Empty response from Gemini');
      }

      //fix
      const questionData: Question = JSON.parse(resp.text) as Question;

      if (!questionData) {
        throw new ServiceUnavailableException('Error in response of the AI');
      }

      return questionData;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to generate random question: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
