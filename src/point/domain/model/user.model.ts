import { PointManager } from './point-manager.model';
import { PointHistory } from './point-history.model';

export class User {
  private id: number;
  private pointManager: PointManager;

  constructor(
    id: number,
    point: number,
    updateMillis: number,
    pointHistory: PointHistory[],
  ) {
    this.id = id;
    this.pointManager = new PointManager(point, updateMillis, pointHistory);
  }

  public getId() {
    return this.id;
  }

  public getPoints() {
    return this.pointManager.getPoint();
  }

  public getUpdateMillis() {
    return this.pointManager.getUpdateMillis();
  }

  public getPointHistory() {
    return this.pointManager.getHistory();
  }

  public chargePoints(amount: number) {
    this.pointManager.charge(amount);
  }

  public usePoints(amount: number) {
    this.pointManager.use(amount);
  }
}
