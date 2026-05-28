import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockLogsService } from './stock-logs.service';
import { StockLogsController } from './stock-logs.controller';
import { StockLog } from './entities/stock-log.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StockLog, Product])],
  controllers: [StockLogsController],
  providers: [StockLogsService],
  exports: [StockLogsService],
})
export class StockLogsModule {}
