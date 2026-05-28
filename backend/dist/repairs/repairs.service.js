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
exports.RepairsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const repair_entity_1 = require("./entities/repair.entity");
const repair_image_entity_1 = require("./entities/repair-image.entity");
let RepairsService = class RepairsService {
    constructor(repairsRepository, repairImagesRepository) {
        this.repairsRepository = repairsRepository;
        this.repairImagesRepository = repairImagesRepository;
    }
    async create(createRepairDto, userId) {
        const { images, ...repairData } = createRepairDto;
        const repair = this.repairsRepository.create({
            ...repairData,
            created_by: userId,
        });
        const savedRepair = await this.repairsRepository.save(repair);
        if (images && images.length > 0) {
            const repairImages = images.map((img) => this.repairImagesRepository.create({
                image_url: img.image_url,
                image_type: img.image_type || repair_image_entity_1.RepairImageType.AFTER,
                caption: img.caption,
                repair_id: savedRepair.id,
            }));
            await this.repairImagesRepository.save(repairImages);
        }
        return this.findOne(savedRepair.id);
    }
    async findAll(page = 1, limit = 10, status) {
        const queryBuilder = this.repairsRepository
            .createQueryBuilder('repair')
            .leftJoinAndSelect('repair.images', 'images')
            .leftJoinAndSelect('repair.createdBy', 'createdBy');
        if (status) {
            queryBuilder.andWhere('repair.status = :status', { status });
        }
        const [repairs, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('repair.created_at', 'DESC')
            .getManyAndCount();
        return { repairs, total };
    }
    async findOne(id) {
        const repair = await this.repairsRepository.findOne({
            where: { id },
            relations: ['images', 'createdBy'],
        });
        if (!repair) {
            throw new common_1.NotFoundException('Repair record not found');
        }
        return repair;
    }
    async update(id, updateRepairDto) {
        const repair = await this.findOne(id);
        const { images, ...repairData } = updateRepairDto;
        const updateData = {};
        if (repairData.title !== undefined)
            updateData.title = repairData.title;
        if (repairData.description !== undefined)
            updateData.description = repairData.description;
        if (repairData.device_type !== undefined)
            updateData.device_type = repairData.device_type;
        if (repairData.status !== undefined)
            updateData.status = repairData.status;
        await this.repairsRepository.update(id, updateData);
        if (images !== undefined) {
            await this.repairImagesRepository.delete({ repair_id: id });
            if (images && images.length > 0) {
                const repairImages = images.map((img) => this.repairImagesRepository.create({
                    image_url: img.image_url,
                    image_type: img.image_type || repair_image_entity_1.RepairImageType.AFTER,
                    caption: img.caption,
                    repair_id: id,
                }));
                await this.repairImagesRepository.save(repairImages);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const repair = await this.findOne(id);
        await this.repairsRepository.remove(repair);
    }
};
exports.RepairsService = RepairsService;
exports.RepairsService = RepairsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(repair_entity_1.Repair)),
    __param(1, (0, typeorm_1.InjectRepository)(repair_image_entity_1.RepairImage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RepairsService);
//# sourceMappingURL=repairs.service.js.map