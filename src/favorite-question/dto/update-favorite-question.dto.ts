import { PartialType } from "@nestjs/mapped-types";
import { CreateFavoriteQuestionDto } from "./create-favorite-question.dto";

export class UpdateFavoriteQuestionDto extends PartialType(
  CreateFavoriteQuestionDto,
) {}
