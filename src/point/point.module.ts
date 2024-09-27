import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/database/database.module';
import { PointController } from './api/point.controller';
import { PointService } from './domain/point.service';
import { UserRepository } from 'src/infrastructure/user.repository';
import { UserRepositoryToken } from './domain/external/user-repository.inteface';

@Module({
  imports: [DatabaseModule],
  controllers: [PointController],
  providers: [
    PointService,
    {
      provide: UserRepositoryToken,
      useClass: UserRepository,
    },
  ],
})
export class PointModule {}
