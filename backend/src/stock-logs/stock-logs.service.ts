import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockLog, StockLogType } from './entities/stock-log.entity';
import { CreateStockLogDto } from './dto/create-stock-log.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class StockLogsService {
  constructor(
    @InjectRepository(StockLog)
    private stockLogsRepository: Repository<StockLog>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createStockLogDto: CreateStockLogDto): Promise<StockLog> {
    const stockLog = this.stockLogsRepository.create(createStockLogDto);
    return this.stockLogsRepository.save(stockLog);
  }

  async findByProduct(productId: number): Promise<StockLog[]> {
    return this.stockLogsRepository.find({
      where: { product_id: productId },
      relations: ['product'],
      order: { created_at: 'DESC' },
    });
  }

  async findAll(page = 1, limit = 10): Promise<{ data: StockLog[]; total: number }> {
    const [data, total] = await this.stockLogsRepository.findAndCount({
      relations: ['product'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: number): Promise<StockLog> {
    const stockLog = await this.stockLogsRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!stockLog) {
      throw new Error(`Stock log with ID ${id} not found`);
    }

    return stockLog;
  }

  async logStockMovement(
    productId: number,
    quantity: number,
    type: StockLogType,
    note?: string,
  ): Promise<void> {
    const stockLog = this.stockLogsRepository.create({
      product_id: productId,
      type,
      quantity,
      note,
    });
    await this.stockLogsRepository.save(stockLog);
  }
}
