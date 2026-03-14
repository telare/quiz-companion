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
  Difficulty,
  Category,
  TopicTitle,
} from "../../schemas/question.schema";

export class CreateQuestionDTO {
  @IsString()
  questionText: string;

  @IsEnum(TopicTitle)
  topicTitle: TopicTitle;

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
