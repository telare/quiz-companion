import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
} from "class-validator";

export class CreateQuestionDTO {
  @IsString()
  text: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  @ArrayMinSize(3)
  options: string[];

  @IsString()
  correctAnswer: string;
}
