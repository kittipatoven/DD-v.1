import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getMyNotifications(@Request() req) {
    return this.notificationsService.getUserNotifications(req.user.id);
  }

  @Get('unread')
  getUnread(@Request() req) {
    return this.notificationsService.getUnreadNotifications(req.user.id);
  }

  @Post()
  create(@Body() data: { message: string; type?: string; data?: any }, @Request() req) {
    return this.notificationsService.create(req.user.id, data.message, data.type, data.data);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(+id, req.user.id);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.notificationsService.delete(+id, req.user.id);
  }
}
