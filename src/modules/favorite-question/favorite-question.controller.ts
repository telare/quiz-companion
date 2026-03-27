import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { FavoriteQuestionService } from "./favorite-question.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Favorite Questions")
@Controller("favorites")
export class FavoriteQuestionController {
  constructor(private readonly favoriteService: FavoriteQuestionService) {}

  @ApiOperation({ summary: "Get all favorite questions of a user" })
  @ApiResponse({
    status: 200,
    example: {
      success: true,
      data: "",
    },
  })
  @Get()
  async findAll(@Query("userId") userId: string) {
    return await this.favoriteService.findAll(userId);
  }

  @ApiOperation({ summary: "Post a favorite question" })
  @ApiResponse({
    status: 200,
    example: {
      success: true,
      data: "",
    },
  })
  @Post(":questionId")
  async createOne(
    @Param("questionId") questionId: string,
    @Body("userId") userId: string,
  ) {
    return await this.favoriteService.create({
      questionId,
      userId,
    });
  }
}
