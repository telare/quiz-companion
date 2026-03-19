import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { FavoriteQuestionService } from "./favorite-question.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
@ApiTags("favorites")
@Controller("favorites")
export class FavoriteQuestionController {
  constructor(private readonly favoriteService: FavoriteQuestionService) {}

  @ApiOperation({ summary: "Post a favorite question" })
  @ApiResponse({ status: 200 })
  @Post(":questionId")
  async save(
    @Param("questionId") questionId: string,
    @Body("userId") userId: string,
  ) {
    return await this.favoriteService.create({
      questionId,
      userId,
    });
  }

  @ApiOperation({ summary: "Get all favorite questions of a user" })
  @Get()
  async findAll(@Query("userId") userId: string) {
    return await this.favoriteService.findAll(userId);
  }
}
