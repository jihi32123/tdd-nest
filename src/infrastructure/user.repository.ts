import { Injectable } from '@nestjs/common';
import { PointHistoryTable } from 'src/database/pointhistory.table';
import { UserPointTable } from 'src/database/userpoint.table';
import { UserRepositoryInterface } from 'src/point/domain/external/user-repository.inteface';
import { User } from 'src/point/domain/model/user.model';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    private readonly userPointTable: UserPointTable,
    private readonly pointHistoryTable: PointHistoryTable,
  ) {}
  async selectById(userId: number): Promise<User> {
    const userPoint = await this.userPointTable.selectById(userId);
    const pointHistory = await this.pointHistoryTable.selectAllByUserId(userId);
    return new User(
      userId,
      userPoint.point,
      userPoint.updateMillis,
      pointHistory,
    );
  }
  async save(user: User): Promise<User> {
    await this.userPointTable.insertOrUpdate(user.getId(), user.getPoints());
    // user의 history중 변경된 것(history id가 -1인 것)들만 저장
    const histories = user.getPointHistory().filter((v) => v.id === -1);
    for (const history of histories) {
      await this.pointHistoryTable.insert(
        user.getId(),
        history.amount,
        history.type,
        history.timeMillis,
      );
    }
    return this.selectById(user.getId());
  }
}
