import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRank {
  'Iron' = 'Iron',
  'Bronze' = 'Bronze',
  'Silver' = 'Silver',
  'Gold' = 'Gold',
  'Platinum' = 'Platinum',
  'Diamond' = 'Diamond',
  'Master' = 'Master',
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

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
