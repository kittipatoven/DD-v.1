import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { StockLogsModule } from '../stock-logs/stock-logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product]), StockLogsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
