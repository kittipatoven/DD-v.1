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
exports.StockLogsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const stock_logs_service_1 = require("./stock-logs.service");
const create_stock_log_dto_1 = require("./dto/create-stock-log.dto");
let StockLogsController = class StockLogsController {
    constructor(stockLogsService) {
        this.stockLogsService = stockLogsService;
    }
    create(createStockLogDto) {
        return this.stockLogsService.create(createStockLogDto);
    }
    findAll() {
        return this.stockLogsService.findAll();
    }
    findByProduct(productId) {
        return this.stockLogsService.findByProduct(+productId);
    }
    findOne(id) {
        return this.stockLogsService.findOne(+id);
    }
};
exports.StockLogsController = StockLogsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_stock_log_dto_1.CreateStockLogDto]),
    __metadata("design:returntype", void 0)
], StockLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StockLogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockLogsController.prototype, "findByProduct", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StockLogsController.prototype, "findOne", null);
exports.StockLogsController = StockLogsController = __decorate([
    (0, common_1.Controller)('stock-logs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [stock_logs_service_1.StockLogsService])
], StockLogsController);
//# sourceMappingURL=stock-logs.controller.js.map