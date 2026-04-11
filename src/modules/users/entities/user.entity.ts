import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRank {
  'Bronze' = 'Bronze',
  'Diamond' = 'Diamond',
  'Gold' = 'Gold',
  'Iron' = 'Iron',
  'Master' = 'Master',
  'Platinum' = 'Platinum',
  'Silver' = 'Silver',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: false })
  totalPoints?: number;

  @Prop({
    required: true,
    type: String,
    enum: Object.keys(UserRank),
    default: UserRank.Iron,
  })
  rank?: UserRank;
}

export type UserDocument = Document & User;
export const UserSchema = SchemaFactory.createForClass(User);
