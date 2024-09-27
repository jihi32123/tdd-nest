import { Injectable } from '@nestjs/common';

@Injectable()
export class LockService {
  private locks: Map<number, Promise<void>> = new Map();
  private queues: Map<number, Array<() => void>> = new Map();

  async acquireLock(userId: number): Promise<void> {
    if (!this.queues.has(userId)) {
      this.queues.set(userId, []);
    }

    const queue = this.queues.get(userId);

    // 대기 중인 작업이 없으면 바로 Promise.resolve() 반환
    const existingLock = this.locks.get(userId) || Promise.resolve();

    let releaseLock: () => void;

    const newLock = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    // 새로운 락을 대기열에 추가
    queue.push(releaseLock!);

    this.locks.set(
      userId,
      existingLock.then(() => newLock),
    );

    // 이전 락이 해제될 때까지 기다림
    await existingLock;

    // 대기열의 첫 번째 작업을 가져와 실행
    if (queue.length > 0) {
      queue.shift()!(); // 첫 번째 작업 실행 (FIFO 방식)
    }

    return new Promise((resolve) => {
      releaseLock!(); // release the lock when done
      resolve();
    });
  }

  releaseLock(userId: number): void {
    // 락 해제 시 대기열에서 다음 작업 처리
    if (this.queues.has(userId)) {
      const queue = this.queues.get(userId);
      if (queue && queue.length > 0) {
        queue.shift()!(); // 다음 작업 실행
      } else {
        this.locks.delete(userId); // 대기열이 없으면 락 해제
      }
    }
  }
}
