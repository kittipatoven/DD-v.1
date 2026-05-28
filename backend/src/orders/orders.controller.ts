import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'user')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll(@Request() req) {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    return this.ordersService.findAll(undefined, page, limit);
  }

  @Get('my-orders')
  @UseGuards(RolesGuard)
  @Roles('admin', 'user')
  findMyOrders(@Request() req) {
    return this.ordersService.findByUser(req.user.id);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getStats() {
    return this.ordersService.getStats();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'user')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
