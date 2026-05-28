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
exports.StockLogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stock_log_entity_1 = require("./entities/stock-log.entity");
const product_entity_1 = require("../products/entities/product.entity");
let StockLogsService = class StockLogsService {
    constructor(stockLogsRepository, productsRepository) {
        this.stockLogsRepository = stockLogsRepository;
        this.productsRepository = productsRepository;
    }
    async create(createStockLogDto) {
        const stockLog = this.stockLogsRepository.create(createStockLogDto);
        return this.stockLogsRepository.save(stockLog);
    }
    async findByProduct(productId) {
        return this.stockLogsRepository.find({
            where: { product_id: productId },
            relations: ['product'],
            order: { created_at: 'DESC' },
        });
    }
    async findAll(page = 1, limit = 10) {
        const [data, total] = await this.stockLogsRepository.findAndCount({
            relations: ['product'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
    }
    async findOne(id) {
        const stockLog = await this.stockLogsRepository.findOne({
            where: { id },
            relations: ['product'],
        });
        if (!stockLog) {
            throw new Error(`Stock log with ID ${id} not found`);
        }
        return stockLog;
    }
    async logStockMovement(productId, quantity, type, note) {
        const stockLog = this.stockLogsRepository.create({
            product_id: productId,
            type,
            quantity,
            note,
        });
        await this.stockLogsRepository.save(stockLog);
    }
};
exports.StockLogsService = StockLogsService;
exports.StockLogsService = StockLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stock_log_entity_1.StockLog)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], StockLogsService);
//# sourceMappingURL=stock-logs.service.js.map