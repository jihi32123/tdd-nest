import { PointHistory, TransactionType } from './point-history.model';

export class PointManager {
  private point: number; // 보유한 포인트
  private updateMillis: number; // 마지막 포인트 업데이트 시간
  private history: PointHistory[]; // 수정 히스토리

  constructor(
    userPoint: number,
    updateMillis: number,
    history: PointHistory[],
  ) {
    this.point = userPoint;
    this.updateMillis = updateMillis;
    this.history = history;
  }

  public getPoint() {
    return this.point;
  }

  public getUpdateMillis() {
    return this.updateMillis;
  }

  public getHistory(): PointHistory[] {
    return this.history;
  }

  public charge(amount: number): void {
    this.point += amount;
    this.updateMillis = Date.now();
    this.addHistory(TransactionType.CHARGE, amount, this.updateMillis);
  }

  public use(amount: number): void {
    this.point -= amount;
    this.updateMillis = Date.now();
    this.addHistory(TransactionType.USE, amount, this.updateMillis);
  }

  private addHistory(
    transactionType: TransactionType,
    amount: number,
    updateMillis: number,
  ): void {
    const historyRecord: PointHistory = {
      id: -1, // 신규 히스토리
      type: transactionType,
      amount,
      timeMillis: updateMillis,
    };
    this.history.push(historyRecord);
  }
}
