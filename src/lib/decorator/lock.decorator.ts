import { LockService } from './lock.service';

const lockService = new LockService();
export function Lock(userIdParamKey: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const userId = args[0];

      await lockService.acquireLock(userId); // 락 획득
      try {
        return await originalMethod.apply(this, args); // 원래 메서드 실행
      } finally {
        lockService.releaseLock(userId); // 락 해제
      }
    };
  };
}
