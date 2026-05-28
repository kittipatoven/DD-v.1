import { FavoritesService } from './favorites.service';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    getMyFavorites(req: any): Promise<import("./entities/favorite.entity").Favorite[]>;
    addFavorite(productId: string, req: any): Promise<import("./entities/favorite.entity").Favorite>;
    removeFavorite(productId: string, req: any): Promise<void>;
    checkFavorite(productId: string, req: any): Promise<boolean>;
}
