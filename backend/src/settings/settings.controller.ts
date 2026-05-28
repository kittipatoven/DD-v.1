import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public endpoint - no auth required for LINE integration
  @Get('public')
  async getPublic() {
    return this.settingsService.getSettingsAsObject();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAll() {
    return this.settingsService.findAll();
  }

  @Get('object')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAsObject() {
    return this.settingsService.getSettingsAsObject();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(@Body() updateData: { key: string; value: string }[]) {
    return this.settingsService.update(updateData);
  }
}
