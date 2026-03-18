import {
  Body,
  Controller,
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
import { Question } from "src/schemas";
@ApiTags("questions")
@Controller("questions")
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiOperation({ summary: "Post a question" })
  @ApiResponse({ status: 200 })
  @Post()
  async createOne(@Body() question: CreateQuestionDTO) {
    return await this.questionService.createOne(question);
  }

  @ApiOperation({ summary: "Get all questions" })
  @ApiResponse({ status: 200 })
  @Get()
  async getAll(): Promise<Question[]> {
    return await this.questionService.findAll();
  }

  @ApiOperation({ summary: "Get a question" })
  @ApiResponse({ status: 200 })
  @Get(":id")
  async getOne(@Param("id") id: string): Promise<Question | null> {
    return await this.questionService.findById(id);
  }

  @ApiOperation({ summary: "Post many questions" })
  @ApiResponse({ status: 200 })
  @Post("bulk")
  async createMany(
    @Body(new ParseArrayPipe({ items: CreateQuestionDTO }))
    questions: CreateQuestionDTO[],
  ): Promise<Question[]> {
    return await this.questionService.createMany(questions);
  }

  @ApiOperation({ summary: "Update a question" })
  @ApiResponse({ status: 200 })
  @Patch(":id")
  async updateOne(
    @Param("id") id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return await this.questionService.updateOne(id, updateQuestionDto);
  }
}
