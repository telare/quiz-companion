import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Find a user' })
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Find users' })
  @ApiResponse({ status: 200, type: User })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Users not found' })
  @Get()
  async findMany() {
    return await this.userService.findAll();
  }

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: User, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post()
  async createOne(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Create new users' })
  @ApiResponse({ status: 201, type: User, description: 'Users created' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @Post('bulk')
  async createMany(@Body() createUserDtos: CreateUserDto[]) {
    return await this.userService.createMany(createUserDtos);
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'The UUID of the user to update',
  }) // Maps to @Param("id")
  @ApiResponse({
    status: 200,
    type: User,
    description: 'User updated successfully',
  }) // Maps to the successful 'return'
  @ApiResponse({ status: 400, description: 'Validation failed (Bad Request)' }) // Maps to class-validator on DTO
  @ApiResponse({ status: 404, description: 'User not found' }) // Maps to throw new NotFoundException()
  @Patch(':id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.updateOne(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, type: User, description: 'User deleted' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    return await this.userService.removeOne(id);
  }
}
