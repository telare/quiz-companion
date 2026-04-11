import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import {
  Category,
  Difficulty,
  ENGLISH_TopicTitle,
  JS_TopicTitle,
} from '../entities/question.entity';

export class CreateQuestionDTO {
  @IsString()
  questionText: string;

  @ApiProperty({
    description: 'Choose a topic from either JS or English categories',
    enumName: `[
      ...Object.values(JS_TopicTitle),
      ...Object.values(ENGLISH_TopicTitle),
    ]`,
    enum: [
      ...Object.values(JS_TopicTitle),
      ...Object.values(ENGLISH_TopicTitle),
    ],
    example: JS_TopicTitle.ASYNC_AWAIT,
  })
  @IsEnum({ ...JS_TopicTitle, ...ENGLISH_TopicTitle })
  topicTitle: JS_TopicTitle | ENGLISH_TopicTitle;

  @ApiProperty({
    enum: Difficulty,
    enumName: 'Difficulty',
    example: Difficulty.JUNIOR,
    description: 'The difficulty level of the question',
  })
  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @ApiProperty({
    enum: Category,
    enumName: 'Category',
    example: Category.ENGLISH,
    description: 'The category of the question',
  })
  @IsEnum(Category)
  category: Category;

  @IsOptional()
  @IsString()
  codeSnippet?: string;

  @IsOptional()
  @IsString()
  sentenceExample?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  @ArrayMinSize(3)
  options: string[];

  @IsNumber()
  correctOptionIndex: number;

  @IsString()
  explanation: string;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;
}
