import { Inject, Injectable } from '@nestjs/common';
import {
  UserRepositoryInterface,
  UserRepositoryToken,
} from './external/user-repository.inteface';
@Injectable()
export class PointService {
  constructor(
    @Inject(UserRepositoryToken)
    private userRepository: UserRepositoryInterface,
  ) {}
  /**
   * 사용자의 보유 포인트를 조회합니다.
   * @param userId
   * @returns UserPoint   */
  async getPoint(userId: number) {
    const user = await this.userRepository.selectById(userId);
    return { point: user.getPoints(), updateMillis: user.getUpdateMillis };
  }
  /**
   * 사용자의 포인트 히스토리를 조회합니다.
   * @param userId
   * @returns UserPoint   */
  async getHistory(userId: number) {
    const user = await this.userRepository.selectById(userId);
    return user.getPointHistory();
  }
  /**
   * 사용자의 포인트를 충전합니다.
   * @param userId, ammount
   * @returns UserPoint   */
  async charge(userId: number, amount: number) {
    const user = await this.userRepository.selectById(userId);
    user.chargePoints(amount);
    const updatedUser = await this.userRepository.save(user);
    return {
      point: updatedUser.getPoints(),
      updateMillis: updatedUser.getUpdateMillis,
    };
  }
  /**
   * 사용자의 포인트를 사용합니다.
   * @param userId, ammount
   * @returns UserPoint   */
  async use(userId: number, amount: number) {
    const user = await this.userRepository.selectById(userId);
    user.usePoints(amount);
    const updatedUser = await this.userRepository.save(user);
    return {
      point: updatedUser.getPoints(),
      updateMillis: updatedUser.getUpdateMillis,
    };
  }
}
