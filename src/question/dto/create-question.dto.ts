import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  IsNumber,
  ValidateIf,
} from "class-validator";

export class CreateQuestionDTO {
  @IsString()
  questionText: string;

  @IsString()
  topicTitle: string;

  @IsString()
  difficulty: string;

  @IsString()
  @ValidateIf((_, value) => value !== null)
  codeSnippet: string | null;

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
