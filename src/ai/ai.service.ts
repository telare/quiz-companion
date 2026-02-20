import { Inject, Injectable } from "@nestjs/common";
import { GoogleGenAI } from "@google/genai";

export interface GeneratedQuestion  {
        question:string, 
        options: string[],
        correctOption: string
      }

@Injectable()
export class AiService {
  constructor(
    @Inject("AI_CLIENT")
    private readonly googleGenAI: GoogleGenAI,
  ) {}
  async getRandomQuestion():Promise<GeneratedQuestion| undefined>  {
    const prompt = `
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

    try {
      const resp = await this.googleGenAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      if (!resp.text) {
        throw new Error("Failed to get text from the AI");
      }
      const questionData: GeneratedQuestion = JSON.parse(resp.text);
      console.log(questionData);
      if (!questionData) {
        throw new Error("Error in response of the AI");
      }
      return questionData;
    } catch (error) {
      console.error("Error in ai generation: ", error.message);
      throw new Error("Failed to generate grammar question.");
    }
  }
}
