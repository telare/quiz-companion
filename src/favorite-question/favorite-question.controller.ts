import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { FavoriteQuestionService } from "./favorite-question.service";

@Controller("favorites")
export class FavoriteQuestionController {
  constructor(private readonly favoriteService: FavoriteQuestionService) {}

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

  @Get()
  async findAll(@Query("userId") userId: string) {
    return await this.favoriteService.findAll(userId);
  }
}
