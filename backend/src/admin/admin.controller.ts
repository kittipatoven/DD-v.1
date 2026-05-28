import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('activity')
  getRecentActivity() {
    return this.adminService.getRecentActivity();
  }

  @Post('track-view')
  trackView(@Body() data: { productId: number }, @Request() req) {
    return this.adminService.trackProductView(data.productId, req.user.id);
  }

  @Get('product-views/:productId')
  getProductViews(@Param('productId') productId: string) {
    return this.adminService.getProductViews(+productId);
  }
}
