# 동시성 보장을 위한 설계 및 구현

## 1. 서론
포인트 충전 및 사용 기능은 여러 사용자가 동시에 이용할 수 있는 환경에서 동시성 문제가 발생할 수 있습니다. 이 보고서는 그러한 동시성 문제를 해결하기 위해 서버에서 락(Lock)을 이용한 방법을 설명하고, 동시성 보장을 위한 다양한 접근 방식을 제시합니다.

## 2. 시스템 설계
본 프로젝트는 Nest.js 기반의 서버로, 포인트 충전 및 사용을 관리하는 백엔드 시스템을 설계했습니다. 포인트는 사용자의 고유 ID를 기준으로 충전 및 사용이 가능하며, 각 사용자는 개별적인 포인트 잔액을 가지고 있습니다. 여러 사용자가 동시에 동일한 사용자의 포인트를 충전하거나 사용할 때 발생하는 동시성 문제를 해결하기 위해 락을 포함한 다양한 동시성 제어 방안을 도입했습니다.

## 3. 동시성 문제 정의
동시에 여러 사용자가 동일한 사용자 계정에 접근하여 포인트를 충전하거나 사용할 경우 데이터 레이스가 발생할 수 있습니다. 데이터 레이스는 두 개 이상의 트랜잭션이 동시에 동일한 데이터에 접근해 의도하지 않은 결과를 초래하는 문제입니다. 이러한 문제는 포인트가 잘못 계산되거나 잔액이 음수로 표현되는 상황을 만들 수 있습니다.

## 4. 동시성 문제 해결을 위한 접근
동시성 문제를 해결하기 위해 락 메커니즘을 도입했습니다. 각 사용자별로 동기화를 적용하여, 특정 사용자의 포인트 데이터를 처리할 때 락을 이용하여 안전하게 접근하도록 보장했습니다. 그 외에도 동시성 문제를 해결할 수 있는 여러 방법을 검토하고, 락 이외에도 트랜잭션, 데이터 분할, CQRS, 이벤트 소싱 등의 동시성 제어 방법을 고려할 수 있습니다.

## 5. 락(Lock) 메커니즘

### 5.1. 락의 종류

#### 5.1.1. 비관적 락 (Pessimistic Lock)
비관적 락은 **다른 작업이 해당 리소스에 접근할 가능성을 항상 고려**하고, 이를 방지하기 위해 미리 락을 걸어 두는 방식입니다. 데이터베이스에서 특정 리소스를 수정하는 동안 해당 리소스에 대한 접근을 차단합니다.

- **장점**: 데이터 무결성이 확실히 보장됨
- **단점**: 성능 저하 및 대기 시간 발생 가능

#### 5.1.2. 낙관적 락 (Optimistic Lock)
낙관적 락은 **다른 작업이 동시에 접근하지 않을 것이라고 가정**하며 작업을 진행한 후, 충돌이 발생하면 롤백하는 방식입니다. 이 방식은 주로 데이터의 버전 관리로 구현됩니다.

- **장점**: 충돌이 적은 환경에서는 성능 우수
- **단점**: 충돌이 잦을 경우 성능 저하

### 5.2. 락 사용 예시 코드:
```typescript
await lock.acquire(userId, async () => {
   // 포인트 충전 혹은 사용 로직
   user.balance += points;
});
```
## 6. 동시성 보장 방법

### 6.1. 트랜잭션 (Transaction)
트랜잭션은 데이터베이스에서 **원자성**을 보장하여 작업 중 데이터 무결성을 유지합니다. 트랜잭션 내부에서 이루어지는 모든 작업은 성공적으로 완료되거나 실패 시 모두 롤백되며, **ACID**(Atomicity, Consistency, Isolation, Durability) 속성을 통해 동시성 문제를 방지할 수 있습니다. 특히 **Isolation**(격리성)은 여러 트랜잭션이 동시에 진행될 때, 각각이 독립적으로 처리되도록 보장해줍니다.

### 6.2. 데이터 분할 (Sharding)
**샤딩**은 데이터베이스를 물리적으로 분할하여, 여러 서버에 데이터를 분산 저장하는 방식입니다. 이를 통해 특정 리소스에 대한 동시 접근이 줄어들고, 각 샤드(Shard)에서 독립적으로 트랜잭션을 처리함으로써 동시성 문제를 완화할 수 있습니다. 이 방법은 특히 대규모 시스템에서 성능 개선을 위해 많이 사용됩니다.

### 6.3. CQRS (Command Query Responsibility Segregation)
**CQRS**는 명령(Command)과 조회(Query) 작업을 분리하여 동시성을 관리하는 패턴입니다. 읽기 작업과 쓰기 작업을 다른 모델과 인프라에서 처리함으로써 성능을 높이고, 동시성 제어를 더욱 세밀하게 할 수 있습니다. 쓰기 작업에 락이나 트랜잭션을 적용하고, 읽기 작업에서는 캐싱 또는 복제본을 사용하여 성능을 향상시킬 수 있습니다.

### 6.4. 이벤트 소싱 (Event Sourcing)
**이벤트 소싱**은 상태 변경을 직접 저장하지 않고, 상태 변경이 일어날 때마다 그 변화를 이벤트로 기록하는 방식입니다. 이후 이 이벤트들을 기반으로 시스템의 상태를 재구성할 수 있으며, 동시성 충돌이 발생했을 때도 각 이벤트의 순서와 타임스탬프를 사용해 충돌을 방지할 수 있습니다. 또한 이벤트 로그를 통해 변경 기록이 모두 남아 있어 데이터 복원에 유리합니다.

### 6.5. 타임스탬프 기반 제어 (Timestamp-Based Concurrency Control)
이 방식은 각 트랜잭션에 **고유한 타임스탬프**를 부여하여, 트랜잭션 간의 처리 순서를 보장하는 방법입니다. 트랜잭션이 리소스에 접근할 때, 해당 리소스의 타임스탬프를 비교하여 처리 순서가 어긋나지 않도록 제어합니다. 이 방식을 통해 동시성 문제를 해결할 수 있으며, 데이터 충돌이 발생하지 않도록 합니다.

---

## 7. 성능 및 확장성 분석
락을 적용하기 전과 후의 성능을 비교하여 분석한 결과, 락을 도입하기 전에는 여러 사용자가 동시에 포인트를 충전하거나 사용할 때 **데이터 충돌** 문제가 빈번히 발생했습니다. 특히, **데이터 레이스**와 같은 문제가 있었고, 포인트 계산 오류가 나타났습니다. 하지만 락을 적용한 후, 포인트 충전 및 사용이 안정적으로 처리되었으며, 데이터 무결성이 보장되었습니다.

그러나 락을 적용함으로써 일부 **성능 저하**가 발생할 수 있음을 확인했습니다. 특히 다수의 사용자가 동시에 동일한 리소스에 접근할 경우, 락에 의해 대기 시간이 증가하여 시스템의 처리 속도가 느려질 수 있었습니다. 따라서 동시 사용자 수가 증가할수록 병목 현상이 발생할 가능성이 커집니다. 이를 해결하기 위해 추가적인 성능 최적화 및 락의 효율적인 사용이 필요합니다.

---

## 8. 테스트 및 검증
동시성 문제를 해결한 후, 다양한 시나리오에서 시스템을 테스트했습니다. **100명 이상의 사용자가 동시에 동일한 사용자 계정에 접근하여 포인트를 충전하거나 사용하는 상황**을 시뮬레이션했습니다. 그 결과, 락을 사용함으로써 데이터 충돌이 발생하지 않았으며, 모든 트랜잭션이 안정적으로 처리되었습니다.

테스트 결과는 다음과 같습니다:
- **포인트 충전 및 사용**: 100명의 사용자가 동시에 포인트를 충전/사용하는 경우, 락 없이 충돌이 발생했으나, 락 도입 후 모든 트랜잭션이 성공적으로 처리됨.
- **성능 테스트**: 락 도입 후 성능 저하가 발생할 수 있으나, 트랜잭션의 일관성과 안정성이 보장됨.

---

## 9. 결론
본 프로젝트에서 사용된 **락 메커니즘**을 통해 포인트 충전 및 사용 시 발생할 수 있는 동시성 문제를 성공적으로 해결할 수 있었습니다. 데이터 무결성을 보장하면서도 성능 저하를 최소화할 수 있었으며, **비관적 락**을 사용하여 모든 트랜잭션의 안전성을 보장했습니다. 그러나 성능 최적화를 위해 **낙관적 락**이나 **CQRS**, **이벤트 소싱** 등의 추가적인 동시성 제어 방법을 고려할 필요가 있습니다.

향후 개선점으로는:
1. **락 사용 최적화**: 락을 필요 최소한으로 적용하여 성능을 더욱 향상시킬 수 있는 방법을 모색.

