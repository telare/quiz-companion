import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Favorite {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  questionId: string;
  @Prop({ default: Date.now })
  savedAt: number;
}

export type FavoriteDocument = Document & Favorite;

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);
