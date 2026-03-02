import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";
import { Question } from "../schemas/question.schema";

const AI_MODEL = "gemini-2.5-flash";
const RESPONSE_TYPE = "application/json";
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  constructor(
    @Inject("AI_CLIENT")
    private readonly googleGenAI: GoogleGenAI,
  ) {}

  private getPrompt(topic: string = "promises", difficulty: string = "middle") {
    return `Act as a Senior Technical Interviewer. Your task is to generate high-quality JavaScript interview questions designed for a Telegram Quiz Bot.

Generate a JSON object based on the topic: ${topic} at the following difficulty level: ${difficulty}.

Strict Rules for the JSON output:
1. ONLY output valid JSON. Do not include any conversational text or markdown formatting (like \`\`\`json) before or after the JSON array.
2. Adapt the complexity to the ${difficulty} level. If Easy/Junior, focus on syntax and basic definitions. If Hard/Senior, focus on tricky edge cases, performance, memory, and engine behavior.
3. The "codeSnippet" field must be a single string with properly escaped newlines (\\n) and quotes (\\"). If this question is theoretical you can mark this field with null value.
4. The "options" field must be an array of exactly 4 strings.
5. The "correctOptionIndex" must be an integer between 0 and 3.
6. The "explanation" field MUST be strictly under 200 characters to respect Telegram's API limits. It should concisely explain why the correct option is right.
7. TOPIC NORMALIZATION: "topicTitle" must be 1-2 words max, first letter uppercase than all lowercase, and use standard terms (e.g., "Promises", "This keyword", "Closures", "Event loop"). No "JS" prefix.

DON'T REPEAT YOURSELF!!! For quotes use only "" for outside and '' for inside!
Use the exact following structure:
  {
    "topicTitle": "{{Short Title}}",
    "difficulty": "{{DIFFICULTY}}",
    "questionText": "{{The question?}}",
    "codeSnippet": "{{code_with_escaped_newlines_or_null}}",
    "options": [
      "{{option_1}}",
      "{{option_2}}",
      "{{option_3}}",
      "{{option_4}}"
    ],
    "correctOptionIndex": {{0_to_3}},
    "explanation": "{{Concise explanation under 200 chars}}"
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
        throw new ServiceUnavailableException("Empty response from Gemini");
      }

      //fix
      const questionData: Question = JSON.parse(resp.text) as Question;

      if (!questionData) {
        throw new ServiceUnavailableException("Error in response of the AI");
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
