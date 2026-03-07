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
import { Question } from "../schemas/question.schema";
import { UpdateQuestionDto } from "./dto/update-question.dto";

@Controller("questions")
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  async createOne(@Body() question: CreateQuestionDTO) {
    return await this.questionService.createOne(question);
  }

  @Get()
  async getAll(): Promise<Question[]> {
    return await this.questionService.findAll();
  }

  @Get(":id")
  async getOne(@Param("id") id: string): Promise<Question | null> {
    return await this.questionService.findById(id);
  }

  @Post("bulk")
  async createMany(
    @Body(new ParseArrayPipe({ items: CreateQuestionDTO }))
    questions: CreateQuestionDTO[],
  ): Promise<Question[]> {
    return await this.questionService.createMany(questions);
  }

  @Patch(":id")
  async updateOne(
    @Param("id") id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return await this.questionService.updateOne(id, updateQuestionDto);
  }
}
