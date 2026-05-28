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
exports.RepairsController = void 0;
const common_1 = require("@nestjs/common");
const repairs_service_1 = require("./repairs.service");
const create_repair_dto_1 = require("./dto/create-repair.dto");
const update_repair_dto_1 = require("./dto/update-repair.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const path_2 = require("path");
let RepairsController = class RepairsController {
    constructor(repairsService) {
        this.repairsService = repairsService;
    }
    findAll(page, limit, status) {
        return this.repairsService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 10, status);
    }
    findOne(id) {
        return this.repairsService.findOne(+id);
    }
    async create(createRepairDto, req, files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('At least one image is required');
        }
        const imageUrls = files.map(file => `${process.env.API_URL || 'http://localhost:3001'}/uploads/repairs/${file.filename}`);
        const { RepairImageType } = require('./entities/repair-image.entity');
        const repairWithImages = {
            ...createRepairDto,
            images: imageUrls.map(url => ({ image_url: url, image_type: RepairImageType.AFTER })),
        };
        return this.repairsService.create(repairWithImages, req.user.id);
    }
    update(id, updateRepairDto) {
        return this.repairsService.update(+id, updateRepairDto);
    }
    remove(id) {
        return this.repairsService.remove(+id);
    }
};
exports.RepairsController = RepairsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RepairsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RepairsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 10, {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadDir = (0, path_2.join)(process.cwd(), 'uploads', 'repairs');
                const fs = require('fs');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const randomName = Array(32)
                    .fill(null)
                    .map(() => (Math.round(Math.random() * 16)).toString(16))
                    .join('');
                const filename = `${randomName}${(0, path_1.extname)(file.originalname)}`;
                cb(null, filename);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype && file.mimetype.startsWith('image/')) {
                cb(null, true);
            }
            else {
                cb(null, false);
            }
        },
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_repair_dto_1.CreateRepairDto, Object, Array]),
    __metadata("design:returntype", Promise)
], RepairsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_repair_dto_1.UpdateRepairDto]),
    __metadata("design:returntype", void 0)
], RepairsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RepairsController.prototype, "remove", null);
exports.RepairsController = RepairsController = __decorate([
    (0, common_1.Controller)('repairs'),
    __metadata("design:paramtypes", [repairs_service_1.RepairsService])
], RepairsController);
//# sourceMappingURL=repairs.controller.js.map