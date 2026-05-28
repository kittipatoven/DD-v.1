import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { ProductView } from './entities/product-view.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, ProductView])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
