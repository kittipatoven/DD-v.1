import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StockLogsService } from './stock-logs.service';
import { CreateStockLogDto } from './dto/create-stock-log.dto';

@Controller('stock-logs')
@UseGuards(JwtAuthGuard)
export class StockLogsController {
  constructor(private readonly stockLogsService: StockLogsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(@Body() createStockLogDto: CreateStockLogDto) {
    return this.stockLogsService.create(createStockLogDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.stockLogsService.findAll();
  }

  @Get('product/:productId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findByProduct(@Param('productId') productId: string) {
    return this.stockLogsService.findByProduct(+productId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.stockLogsService.findOne(+id);
  }
}
