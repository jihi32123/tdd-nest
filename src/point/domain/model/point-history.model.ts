export enum TransactionType {
  CHARGE,
  USE,
}

export type PointHistory = {
  id: number; // 히스토리 ID, -1은 신규 히스토리를 의미한다.
  type: TransactionType;
  amount: number;
  timeMillis: number;
};
