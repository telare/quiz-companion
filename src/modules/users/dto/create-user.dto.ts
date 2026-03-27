import { UserRank } from "../entities/user.entity";
import { IsString, IsNumber, IsEnum } from "class-validator";

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
