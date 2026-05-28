import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepairsService } from './repairs.service';
import { RepairsController } from './repairs.controller';
import { Repair } from './entities/repair.entity';
import { RepairImage } from './entities/repair-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Repair, RepairImage])],
  controllers: [RepairsController],
  providers: [RepairsService],
  exports: [RepairsService],
})
export class RepairsModule {}
