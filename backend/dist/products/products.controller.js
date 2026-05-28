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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const path_2 = require("path");
let ProductsController = class ProductsController {
    constructor(productsService) {
        this.productsService = productsService;
    }
    findAll(page, limit, search, categoryId, minPrice, maxPrice, sortBy, sortOrder, type, brand) {
        return this.productsService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 10, search, categoryId ? parseInt(categoryId) : undefined, minPrice ? parseFloat(minPrice) : undefined, maxPrice ? parseFloat(maxPrice) : undefined, sortBy, sortOrder, type, brand);
    }
    search(keyword) {
        return this.productsService.search(keyword);
    }
    getTopViewed(limit, start, end) {
        return this.productsService.getTopViewedProducts(limit ? parseInt(limit) : 10, start, end);
    }
    findOne(id, req) {
        return this.productsService.findOne(+id, req);
    }
    create(createProductDto, req) {
        return this.productsService.create(createProductDto, req.user.id);
    }
    update(id, updateProductDto) {
        return this.productsService.update(+id, updateProductDto);
    }
    remove(id) {
        return this.productsService.remove(+id);
    }
    async uploadFile(file, req) {
        try {
            console.log('[BACKEND DEBUG] Upload request received');
            console.log('[BACKEND DEBUG] Request body:', req.body);
            console.log('[BACKEND DEBUG] Request headers:', req.headers);
            console.log('[BACKEND DEBUG] File received:', file);
            if (!file) {
                console.error('[BACKEND ERROR] No file uploaded - file is undefined');
                console.error('[BACKEND ERROR] Request content-type:', req.headers['content-type']);
                throw new common_1.BadRequestException('No file uploaded - file is undefined');
            }
            console.log('[BACKEND DEBUG] File details:', {
                originalname: file.originalname,
                filename: file.filename,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path,
                destination: file.destination,
            });
            const result = {
                filename: file.filename,
                originalname: file.originalname,
                url: `${process.env.API_URL || 'http://localhost:3001'}/uploads/${file.filename}`,
            };
            console.log('[BACKEND DEBUG] Returning result:', result);
            return result;
        }
        catch (error) {
            console.error('[BACKEND ERROR] Upload failed:', error);
            console.error('[BACKEND ERROR] Error stack:', error.stack);
            console.error('[BACKEND ERROR] Error message:', error.message);
            console.error('[BACKEND ERROR] Error name:', error.name);
            throw new common_1.BadRequestException(`Upload failed: ${error.message}`);
        }
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Query)('categoryId')),
    __param(4, (0, common_1.Query)('minPrice')),
    __param(5, (0, common_1.Query)('maxPrice')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __param(8, (0, common_1.Query)('type')),
    __param(9, (0, common_1.Query)('brand')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('top-viewed'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('start')),
    __param(2, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "getTopViewed", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadDir = (0, path_2.join)(process.cwd(), 'uploads');
                console.log('[BACKEND DEBUG] Upload directory:', uploadDir);
                const fs = require('fs');
                if (!fs.existsSync(uploadDir)) {
                    console.log('[BACKEND DEBUG] Creating upload directory...');
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                console.log('[BACKEND DEBUG] Directory exists check:', fs.existsSync(uploadDir));
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => (Math.round(Math.random() * 16)).toString(16))
                    .join('');
                const filename = `${randomName}${(0, path_1.extname)(file.originalname)}`;
                console.log('[BACKEND DEBUG] Generated filename:', filename);
                cb(null, filename);
            },
        }),
        fileFilter: (req, file, cb) => {
            console.log('[BACKEND DEBUG] File filter check:', file.mimetype);
            console.log('[BACKEND DEBUG] File originalname:', file.originalname);
            if (file.mimetype && file.mimetype.startsWith('image/')) {
                console.log('[BACKEND DEBUG] File accepted:', file.mimetype);
                cb(null, true);
            }
            else {
                console.error('[BACKEND ERROR] Invalid file type:', file.mimetype);
                cb(null, false);
            }
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "uploadFile", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map