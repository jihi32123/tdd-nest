import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common';

import { PointBody as PointDto } from './point.dto';
import { PointService } from '../domain/point.service';
import { Lock } from '../../lib/decorator';

@Controller('/point')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  /**
   * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
   */
  @Get(':id')
  async point(@Param('id') id) {
    const userId = Number.parseInt(id);
    return this.pointService.getPoint(userId);
  }

  /**
   * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
   */
  @Get(':id/histories')
  async history(@Param('id') id) {
    const userId = Number.parseInt(id);
    return this.pointService.getHistory(userId);
  }

  /**
   * TODO - 특정 유저의 포인트를 충전하는 기능을 작성해주세요.
   */
  @Patch(':id/charge')
  @Lock('id') // 데코레이터 직접 적용
  async charge(@Param('id') id, @Body(ValidationPipe) pointDto: PointDto) {
    const userId = Number.parseInt(id);
    const amount = pointDto.amount;
    return this.pointService.charge(userId, amount);
  }

  /**
   * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
   */
  @Patch(':id/use')
  @Lock('id') // 데코레이터 직접 적용
  async use(@Param('id') id, @Body(ValidationPipe) pointDto: PointDto) {
    const userId = Number.parseInt(id);
    const amount = pointDto.amount;
    return this.pointService.use(userId, amount);
  }
}
