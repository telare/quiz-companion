import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Question {
  @Prop({ required: true, unique: true })
  questionText: string;

  @Prop({ required: true })
  topicTitle: string;

  @Prop({ required: true })
  difficulty: string;

  @Prop({
    type: String,
    default: null,
  })
  codeSnippet: string | null;

  @Prop({ required: true })
  options: string[];

  @Prop({ required: true })
  correctOptionIndex: number;

  @Prop({ required: true })
  explanation: string;
}

export type QuestionDocument = Question & Document;

export const QuestionSchema = SchemaFactory.createForClass(Question);
