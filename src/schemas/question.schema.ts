import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Question {
  @Prop({ required: true, unique: true, index: true })
  text: string;

  @Prop({ required: true })
  options: string[];

  @Prop({ required: true, unique: true })
  correctAnswer: string;
}

export type QuestionDocument = Question & Document;

export const QuestionSchema = SchemaFactory.createForClass(Question);
