import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateFavoriteQuestionDto {
  @IsString()
  userId: string;
  @IsString()
  questionId: string;
  @IsNumber()
  @IsOptional()
  savedAt?: number;
}
