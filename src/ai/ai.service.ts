import { Inject, Injectable } from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctOption: string;
}

const RANDOM_GRAMMAR_PROMPT = `
      You are an expert in English grammar.
      Generate one multiple-choice grammar question suitable for an intermediate learner.
      The question must have 3 possible answers, with only one being correct.

      Return the output *only* as a valid JSON object with the following structure:
      {
        "question": "The full question text",
        "options": ["answer text 1", "answer text 2", "answer text 3"],
        "correctOption": "the text of the correct answer"
      }
    `;
const AI_MODEL = "gemini-2.5-flash";
const RESPONSE_TYPE = "application/json";
@Injectable()
export class AiService {
  constructor(
    @Inject("AI_CLIENT")
    private readonly googleGenAI: GoogleGenAI,
  ) {}
  async getRandomQuestion(): Promise<GeneratedQuestion | undefined> {
    const prompt = RANDOM_GRAMMAR_PROMPT;

    try {
      const resp = await this.googleGenAI.models.generateContent({
        model: AI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: RESPONSE_TYPE,
        },
      });
      if (!resp.text) {
        throw new Error("Empty response from Gemini");
      }

      //fix
      const questionData: GeneratedQuestion = JSON.parse(
        resp.text,
      ) as GeneratedQuestion;

      if (!questionData) {
        throw new Error("Error in response of the AI");
      }

      return questionData;
    } catch (error: unknown) {
      console.error(`[AiService] Error generating question:`, error);
      throw error;
    }
  }
}
