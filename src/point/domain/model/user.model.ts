import { PointHistory, TransactionType } from './point-history.model';

export class User {
  private id: number;
  private point: number; // 보유한 포인트
  private updateMillis: number; // 마지막 포인트 업데이트 시간
  private pointHistory: PointHistory[]; // 수정 히스토리

  public static readonly MAX_POINTS = 1_000_000; // 최대 포인트 보유 한도 설정

  constructor(
    id: number,
    userPoint: number,
    updateMillis: number,
    pointHistory: PointHistory[],
  ) {
    this.id = id;
    this.point = userPoint;
    this.updateMillis = updateMillis;
    this.pointHistory = pointHistory;
    this.validatePoint(userPoint);
  }

  private validatePoint(point: number): void {
    if (point < 0) {
      throw new Error(`Insufficient points'`);
    }
    if (point > User.MAX_POINTS) {
      throw new Error(
        `Cannot exceed maximum points limit of ${User.MAX_POINTS}`,
      );
    }
    if (!Number.isInteger(point)) {
      throw new Error(`Points must be integers`);
    }
  }

  public getId() {
    return this.id;
  }

  public getPoint() {
    return this.point;
  }

  public getUpdateMillis() {
    return this.updateMillis;
  }

  public getPointHistory(): PointHistory[] {
    return this.pointHistory;
  }

  public chargePoint(amount: number): void {
    if (amount == 0) throw new Error(`Cannot charge zero points`);
    if (amount < 0) {
      throw new Error(`Cannot charge negative points`);
    }
    const result = this.point + amount;
    this.validatePoint(result);
    this.point += amount;
    this.updateMillis = Date.now();
    this.addPointHistory(TransactionType.CHARGE, amount, this.updateMillis);
  }

  public usePoint(amount: number): void {
    if (amount == 0) throw new Error(`Cannot use zero points`);
    if (amount < 0) {
      throw new Error(`Cannot use negative points`);
    }
    const result = this.point - amount;
    this.validatePoint(result);
    this.point = result;
    this.updateMillis = Date.now();
    this.addPointHistory(TransactionType.USE, amount, this.updateMillis);
  }

  private addPointHistory(
    transactionType: TransactionType,
    amount: number,
    updateMillis: number,
  ): void {
    if (!this.pointHistory) {
      throw new Error(`History is not initialized`);
    }
    const historyRecord: PointHistory = {
      id: -1, // 신규 히스토리
      type: transactionType,
      amount,
      timeMillis: updateMillis,
    };
    this.pointHistory.push(historyRecord);
  }
}
