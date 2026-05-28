import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboard(): Promise<{
        totalUsers: number;
        totalProducts: number;
        totalViews: number;
    }>;
    getRecentActivity(): Promise<{
        recentViews: import("./entities/product-view.entity").ProductView[];
    }>;
    trackView(data: {
        productId: number;
    }, req: any): Promise<import("./entities/product-view.entity").ProductView>;
    getProductViews(productId: string): Promise<import("./entities/product-view.entity").ProductView[]>;
}
