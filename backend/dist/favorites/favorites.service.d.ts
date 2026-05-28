import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
export declare class FavoritesService {
    private favoritesRepository;
    constructor(favoritesRepository: Repository<Favorite>);
    addFavorite(userId: number, productId: number): Promise<Favorite>;
    removeFavorite(userId: number, productId: number): Promise<void>;
    getUserFavorites(userId: number): Promise<Favorite[]>;
    checkFavorite(userId: number, productId: number): Promise<boolean>;
}
