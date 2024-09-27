import { Test, TestingModule } from '@nestjs/testing';
import { PointController } from '../../../../point/api/point.controller';
import { PointService } from '../../../../point/domain/point.service';
import { PointBody as PointDto } from '../../../../point/api/point.dto';

// 유틸 함수: 랜덤 지연을 추가
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('PointController Concurrency', () => {
  let pointController: PointController;
  let pointServiceMock: Partial<PointService>;

  beforeEach(async () => {
    // PointService Mock 설정
    pointServiceMock = {
      charge: jest.fn().mockImplementation(async (userId, amount) => {
        await delay(1000); // 0.5초 지연을 고정
        return { userId, newPoint: 100 + amount };
      }),
      use: jest.fn().mockImplementation(async (userId, amount) => {
        await delay(1000); // 0.5초 지연을 고정
        return { userId, remainingPoint: 100 - amount };
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PointController],
      providers: [
        {
          provide: PointService,
          useValue: pointServiceMock, // Mock된 PointService 사용
        },
      ],
    }).compile();

    pointController = module.get<PointController>(PointController);
  });

  it('should execute charge requests sequentially when multiple requests are made', async () => {
    const userId = '1';
    const pointDto1: PointDto = { amount: 10 };
    const pointDto2: PointDto = { amount: 20 };
    const pointDto3: PointDto = { amount: 30 };
    const pointDto4: PointDto = { amount: 40 };
    const pointDto5: PointDto = { amount: 50 };
    const pointDto6: PointDto = { amount: 60 };

    // 동시에 여러 개의 charge 요청을 Promise.all로 보냅니다.
    const chargePromises = [
      pointController.charge(userId, pointDto1),
      pointController.charge(userId, pointDto2),
      pointController.charge(userId, pointDto3),
      pointController.charge(userId, pointDto4),
      pointController.charge(userId, pointDto5),
      pointController.charge(userId, pointDto6),
    ];

    const results = await Promise.all(chargePromises);
    console.log(results);
    expect(results[0]).toEqual({ userId: 1, newPoint: 110 });
    expect(results[1]).toEqual({ userId: 1, newPoint: 120 });
    expect(results[2]).toEqual({ userId: 1, newPoint: 130 });
    expect(results[3]).toEqual({ userId: 1, newPoint: 140 });
    expect(results[4]).toEqual({ userId: 1, newPoint: 150 });
    expect(results[5]).toEqual({ userId: 1, newPoint: 160 });

    // Mock 서비스 메서드가 순차적으로 호출되었는지 확인 (jest의 호출 순서 검증)
    expect(pointServiceMock.charge).toHaveBeenNthCalledWith(1, 1, 10);
    expect(pointServiceMock.charge).toHaveBeenNthCalledWith(1, 1, 20);
    expect(pointServiceMock.charge).toHaveBeenNthCalledWith(1, 1, 30);
    expect(pointServiceMock.charge).toHaveBeenNthCalledWith(1, 1, 40);
    expect(pointServiceMock.charge).toHaveBeenNthCalledWith(1, 1, 50);
    expect(pointServiceMock.charge).toHaveBeenNthCalledWith(1, 1, 60);
    expect(pointServiceMock.charge).toHaveBeenNthCalledWith(1, 1, 70);
  });

  it('should execute use requests sequentially when multiple requests are made', async () => {
    const userId = '1';
    const pointDto1: PointDto = { amount: 20 };
    const pointDto2: PointDto = { amount: 40 };

    // 동시에 두 개의 use 요청을 Promise.all로 보냅니다.
    const usePromises = [
      pointController.use(userId, pointDto1),
      pointController.use(userId, pointDto2),
    ];

    const results = await Promise.all(usePromises);

    // 첫 번째 요청이 먼저 처리되었는지 확인
    expect(results[0]).toEqual({ userId: 1, remainingPoint: 80 });
    // 두 번째 요청이 나중에 처리되었는지 확인
    expect(results[1]).toEqual({ userId: 1, remainingPoint: 60 });

    // Mock 서비스 메서드가 순차적으로 호출되었는지 확인 (jest의 호출 순서 검증)
    expect(pointServiceMock.use).toHaveBeenNthCalledWith(1, 1, 20);
    expect(pointServiceMock.use).toHaveBeenNthCalledWith(2, 1, 40);
  });
});
