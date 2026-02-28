import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  IsNumber,
} from "class-validator";

export class CreateQuestionDTO {
  @IsString()
  questionText: string;

  @IsString()
  topicTitle: string;

  @IsString()
  difficulty: string;

  @IsString()
  codeSnippet: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  @ArrayMinSize(3)
  options: string[];

  @IsNumber()
  correctOptionIndex: number;

  @IsString()
  explanation: string;
}
