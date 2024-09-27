import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from '../../../../point/domain/point.service';
import {
  UserRepositoryInterface,
  UserRepositoryToken,
} from '../../../../point/domain/external/user-repository.inteface';

// 유저 객체 Mock 생성
const mockUser = {
  getPoint: jest.fn().mockReturnValue(100),
  getUpdateMillis: jest.fn().mockReturnValue(Date.now()),
  getPointHistory: jest.fn().mockReturnValue([{ amount: 50, type: 'charge' }]),
  chargePoint: jest.fn(),
  usePoint: jest.fn(),
};

const mockUserRepository = {
  selectById: jest.fn().mockResolvedValue(mockUser),
  save: jest.fn().mockResolvedValue(mockUser),
};

describe('PointService', () => {
  let pointService: PointService;
  let userRepository: UserRepositoryInterface;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointService,
        {
          provide: UserRepositoryToken,
          useValue: mockUserRepository, // UserRepository Mock
        },
      ],
    }).compile();

    pointService = module.get<PointService>(PointService);
    userRepository = module.get<UserRepositoryInterface>(UserRepositoryToken);
  });

  afterEach(() => {
    jest.clearAllMocks(); // 각 테스트 후 mock 호출 기록 초기화
  });

  it('should get user point successfully', async () => {
    const userId = 1;
    const result = await pointService.getPoint(userId);

    // 유저 리포지토리의 selectById가 제대로 호출되었는지 확인
    expect(userRepository.selectById).toHaveBeenCalledWith(userId);
    // 유저의 보유 포인트를 반환하는지 확인
    expect(result).toEqual({
      point: 100,
      updateMillis: expect.any(Number),
    });
  });

  it('should get user point history successfully', async () => {
    const userId = 1;
    const result = await pointService.getHistory(userId);

    // 유저 리포지토리의 selectById가 호출되었는지 확인
    expect(userRepository.selectById).toHaveBeenCalledWith(userId);
    // 포인트 히스토리가 올바르게 반환되는지 확인
    expect(result).toEqual([{ amount: 50, type: 'charge' }]);
  });

  it('should charge points successfully', async () => {
    const userId = 1;
    const amount = 50;

    // 충전 메서드 호출
    const result = await pointService.charge(userId, amount);

    // selectById 및 save 메서드가 호출되었는지 확인
    expect(userRepository.selectById).toHaveBeenCalledWith(userId);
    expect(userRepository.save).toHaveBeenCalledWith(mockUser);

    // 유저의 chargePoint 메서드가 호출되었는지 확인
    expect(mockUser.chargePoint).toHaveBeenCalledWith(amount);

    // 결과가 올바르게 반환되었는지 확인
    expect(result).toEqual({
      point: 100,
      updateMillis: expect.any(Number),
    });
  });

  it('should use points successfully', async () => {
    const userId = 1;
    const amount = 30;

    // 포인트 사용 메서드 호출
    const result = await pointService.use(userId, amount);

    // selectById 및 save 메서드가 호출되었는지 확인
    expect(userRepository.selectById).toHaveBeenCalledWith(userId);
    expect(userRepository.save).toHaveBeenCalledWith(mockUser);

    // 유저의 usePoint 메서드가 호출되었는지 확인
    expect(mockUser.usePoint).toHaveBeenCalledWith(amount);

    // 결과가 올바르게 반환되었는지 확인
    expect(result).toEqual({
      point: 100,
      updateMillis: expect.any(Number),
    });
  });
});
