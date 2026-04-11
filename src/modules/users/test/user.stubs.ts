import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserRank } from '../entities/user.entity';

export const userStub = (): CreateUserDto => {
  return {
    username: 'TestUser',
    totalPoints: 100,
    rank: UserRank.Iron,
  };
};

export const updatedUserStub = (): UpdateUserDto => ({
  ...userStub(),
  totalPoints: 150,
  rank: UserRank.Bronze,
});
