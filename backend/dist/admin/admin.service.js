"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_view_entity_1 = require("./entities/product-view.entity");
const users_service_1 = require("../users/users.service");
const products_service_1 = require("../products/products.service");
let AdminService = class AdminService {
    constructor(productViewsRepository, usersService, productsService) {
        this.productViewsRepository = productViewsRepository;
        this.usersService = usersService;
        this.productsService = productsService;
    }
    async getDashboardStats() {
        const totalUsers = await this.usersService.findAll(1, 1000);
        const totalProducts = await this.productsService.findAll(1, 1000);
        const totalViews = await this.productViewsRepository.count();
        return {
            totalUsers: totalUsers.total,
            totalProducts: totalProducts.total,
            totalViews,
        };
    }
    async trackProductView(productId, userId) {
        const view = this.productViewsRepository.create({
            product_id: productId,
            user_id: userId,
        });
        return this.productViewsRepository.save(view);
    }
    async getProductViews(productId) {
        return this.productViewsRepository.find({
            where: { product_id: productId },
            relations: ['user'],
            order: { created_at: 'DESC' },
            take: 100,
        });
    }
    async getRecentActivity() {
        const recentViews = await this.productViewsRepository.find({
            relations: ['product', 'user'],
            order: { created_at: 'DESC' },
            take: 10,
        });
        return {
            recentViews,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_view_entity_1.ProductView)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        products_service_1.ProductsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map