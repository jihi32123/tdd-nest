import {
  PointHistory,
  TransactionType,
} from '../../../../point/domain/model/point-history.model';
import { User } from '../../../../point/domain/model/user.model';

describe('PointUser', () => {
  let user: User;
  let userId: number;
  let initialPoints: number;
  let initialUpdateMillis: number;
  let initialHistory: PointHistory[];

  beforeEach(() => {
    userId = 1;
    initialPoints = 100;
    initialUpdateMillis = 1000;
    initialHistory = [
      {
        id: 1,
        type: TransactionType.CHARGE,
        amount: 50,
        timeMillis: Date.now() - 10000,
      },
      {
        id: 2,
        type: TransactionType.USE,
        amount: 20,
        timeMillis: Date.now() - 5000,
      },
    ];

    user = new User(userId, initialPoints, initialUpdateMillis, initialHistory);
  });

  it('should initialize with given points, updateMillis, and history', () => {
    expect(user.getPoint()).toBe(100);
    expect(user.getUpdateMillis()).toBe(1000);
    expect(user.getPointHistory()).toEqual(initialHistory);
  });

  it('should charge points correctly', () => {
    const amountToCharge = 50;
    const previousPoints = user.getPoint();
    const previousHistoryLength = user.getPointHistory().length;

    user.chargePoint(amountToCharge);

    expect(user.getPoint()).toBe(previousPoints + amountToCharge);
    expect(user.getPointHistory().length).toBe(previousHistoryLength + 1);

    const lastHistory = user.getPointHistory().pop();
    expect(lastHistory?.type).toBe(TransactionType.CHARGE);
    expect(lastHistory?.amount).toBe(amountToCharge);
  });

  it('should use points correctly', () => {
    const amountToUse = 30;
    const previousPoints = user.getPoint();
    const previousHistoryLength = user.getPointHistory().length;

    user.usePoint(amountToUse);

    expect(user.getPoint()).toBe(previousPoints - amountToUse);
    expect(user.getPointHistory().length).toBe(previousHistoryLength + 1);

    const lastHistory = user.getPointHistory().pop();
    expect(lastHistory?.type).toBe(TransactionType.USE);
    expect(lastHistory?.amount).toBe(amountToUse);
  });

  it('should update the updateMillis when points are charged', () => {
    const beforeMillis = user.getUpdateMillis();
    user.chargePoint(50);
    expect(user.getUpdateMillis()).toBeGreaterThan(beforeMillis);
  });

  it('should update the updateMillis when points are used', () => {
    const beforeMillis = user.getUpdateMillis();
    user.usePoint(30);
    expect(user.getUpdateMillis()).toBeGreaterThan(beforeMillis);
  });

  it('should not allow point usage that exceeds current points', () => {
    const excessiveAmount = user.getPoint() + 50; // 현재 포인트보다 50 많이 사용하려 함
    expect(() => user.usePoint(excessiveAmount)).toThrow('Insufficient points');
  });

  it('should not allow negative amounts to be charged', () => {
    const negativeAmount = -50;
    expect(() => user.chargePoint(negativeAmount)).toThrow(
      'Cannot charge negative points',
    );
  });

  it('should not allow negative amounts to be used', () => {
    const negativeAmount = -30;
    expect(() => user.usePoint(negativeAmount)).toThrow(
      'Cannot use negative points',
    );
  });

  it('should handle null or undefined history array safely', () => {
    const userWithNullHistory = new User(
      1,
      100,
      Date.now(),
      null as unknown as PointHistory[],
    );
    expect(() => userWithNullHistory.chargePoint(10)).toThrow(
      'History is not initialized',
    );
  });

  it('should not allow charging zero points', () => {
    const zeroAmount = 0;
    expect(() => user.chargePoint(zeroAmount)).toThrow(
      'Cannot charge zero points',
    );
  });

  it('should not allow using zero points', () => {
    const zeroAmount = 0;
    expect(() => user.usePoint(zeroAmount)).toThrow('Cannot use zero points');
  });

  it('should not allow initialization with negative points', () => {
    expect(() => {
      new User(1, -100, Date.now(), initialHistory);
    }).toThrow('Insufficient points');
  });

  it('should not allow non-integer points to be charged or used', () => {
    expect(() => user.chargePoint(10.5)).toThrow('Points must be integers');
    expect(() => user.usePoint(20.75)).toThrow('Points must be integers');
  });

  it('should allow charging points without exceeding the max points limit', () => {
    const amountToCharge = User.MAX_POINTS - initialPoints;
    user.chargePoint(amountToCharge);

    expect(user.getPoint()).toBe(initialPoints + amountToCharge);
  });

  it('should not allow charging points that exceed the max points limit', () => {
    const amountToCharge = User.MAX_POINTS + 1; // 상한선 초과

    expect(() => {
      user.chargePoint(amountToCharge);
    }).toThrow(`Cannot exceed maximum points limit of ${User.MAX_POINTS}`);
  });

  it('should initialize with points below the max points limit', () => {
    const initialPointsWithinLimit = User.MAX_POINTS;
    user = new User(1, initialPointsWithinLimit, Date.now(), initialHistory);

    expect(user.getPoint()).toBe(initialPointsWithinLimit);
  });

  it('should not initialize with points exceeding the max points limit', () => {
    const initialPointsExceedingLimit = User.MAX_POINTS + 1;

    expect(() => {
      new User(1, initialPointsExceedingLimit, Date.now(), initialHistory);
    }).toThrow(`Cannot exceed maximum points limit of ${User.MAX_POINTS}`);
  });
});
