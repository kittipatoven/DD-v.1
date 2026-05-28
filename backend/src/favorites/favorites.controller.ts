import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getMyFavorites(@Request() req) {
    return this.favoritesService.getUserFavorites(req.user.id);
  }

  @Post(':productId')
  addFavorite(@Param('productId') productId: string, @Request() req) {
    return this.favoritesService.addFavorite(req.user.id, +productId);
  }

  @Delete(':productId')
  removeFavorite(@Param('productId') productId: string, @Request() req) {
    return this.favoritesService.removeFavorite(req.user.id, +productId);
  }

  @Get('check/:productId')
  checkFavorite(@Param('productId') productId: string, @Request() req) {
    return this.favoritesService.checkFavorite(req.user.id, +productId);
  }
}
