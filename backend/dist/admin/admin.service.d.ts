import { Repository } from 'typeorm';
import { ProductView } from './entities/product-view.entity';
import { UsersService } from '../users/users.service';
import { ProductsService } from '../products/products.service';
export declare class AdminService {
    private productViewsRepository;
    private usersService;
    private productsService;
    constructor(productViewsRepository: Repository<ProductView>, usersService: UsersService, productsService: ProductsService);
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalProducts: number;
        totalViews: number;
    }>;
    trackProductView(productId: number, userId: number): Promise<ProductView>;
    getProductViews(productId: number): Promise<ProductView[]>;
    getRecentActivity(): Promise<{
        recentViews: ProductView[];
    }>;
}
