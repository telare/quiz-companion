import { IsString, IsNumber, IsEnum } from 'class-validator';

import { UserRank } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsNumber()
  totalPoints: number;

  @IsEnum({
    ...Object.keys(UserRank),
  })
  rank: UserRank;
}
