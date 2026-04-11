import { PartialType } from '@nestjs/mapped-types';

import { CreateQuestionDTO } from './create-question.dto';

export class UpdateQuestionDto extends PartialType(CreateQuestionDTO) {}
