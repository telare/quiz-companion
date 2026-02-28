import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Question {
  @Prop({ required: true, index: true })
  questionText: string;

  @Prop({ required: true })
  topicTitle: string;

  @Prop({ required: true })
  difficulty: string;

  @Prop({ required: true })
  codeSnippet: string;

  @Prop({ required: true })
  options: string[];

  @Prop({ required: true })
  correctOptionIndex: number;

  @Prop({ required: true })
  explanation: string;
}

export type QuestionDocument = Question & Document;

export const QuestionSchema = SchemaFactory.createForClass(Question);
