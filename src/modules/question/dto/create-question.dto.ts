import {
  IsString,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  IsNumber,
  ValidateIf,
  IsEnum,
} from "class-validator";
import {
  Category,
  Difficulty,
  ENGLISH_TopicTitle,
  JS_TopicTitle,
} from "../../../schemas";

export class CreateQuestionDTO {
  @IsString()
  questionText: string;

  @IsEnum({ ...JS_TopicTitle, ...ENGLISH_TopicTitle })
  topicTitle: JS_TopicTitle | ENGLISH_TopicTitle;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsEnum(Category)
  category: Category;

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
