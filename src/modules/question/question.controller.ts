import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { QuestionService } from "./question.service";
import { CreateQuestionDTO } from "./dto/create-question.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";

@ApiTags("Questions")
@Controller("questions")
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiOperation({ summary: "Get a question" })
  @ApiResponse({
    status: 200,
    example: {
      success: true,
      data: "",
    },
  })
  @Get(":id")
  async getOne(@Param("id") id: string) {
    return await this.questionService.findById(id);
  }

  @ApiOperation({ summary: "Get all questions" })
  @ApiResponse({
    status: 200,
    example: {
      success: true,
      data: "",
    },
  })
  @Get()
  async getAll() {
    return await this.questionService.findAll();
  }

  @ApiOperation({ summary: "Post a question" })
  @ApiResponse({
    status: 200,
    example: {
      success: true,
      data: "",
    },
  })
  @Post()
  async createOne(@Body() question: CreateQuestionDTO) {
    return await this.questionService.createOne(question);
  }

  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: "Post many questions" })
  @ApiResponse({
    status: 200,
    example: {
      success: true,
      data: "",
    },
  })
  @Post("bulk")
  async createMany(
    @Body(new ParseArrayPipe({ items: CreateQuestionDTO }))
    questions: CreateQuestionDTO[],
  ) {
    return await this.questionService.createMany(questions);
  }

  @ApiOperation({ summary: "Update a question" })
  @ApiResponse({
    status: 200,
    example: {
      success: true,
      data: "",
    },
  })
  @Patch(":id")
  async updateOne(
    @Param("id") id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return await this.questionService.updateOne(id, updateQuestionDto);
  }

  @ApiOperation({ summary: "Delete a question" })
  @ApiResponse({
    status: 200,
    example: {
      success: true,
      data: "",
    },
  })
  @Delete(":id")
  async deleteOne(@Param("id") id: string) {
    return await this.questionService.removeOne(id);
  }
}
