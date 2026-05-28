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
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const setting_entity_1 = require("./entities/setting.entity");
let SettingsService = class SettingsService {
    constructor(settingsRepository) {
        this.settingsRepository = settingsRepository;
    }
    async findAll() {
        return this.settingsRepository.find();
    }
    async findByKey(key) {
        return this.settingsRepository.findOne({ where: { key_name: key } });
    }
    async update(updateData) {
        for (const item of updateData) {
            const existing = await this.findByKey(item.key);
            if (existing) {
                await this.settingsRepository.update({ key_name: item.key }, { value: item.value });
            }
            else {
                const newSetting = this.settingsRepository.create({
                    key_name: item.key,
                    value: item.value,
                });
                await this.settingsRepository.save(newSetting);
            }
        }
        return { success: true };
    }
    async getSettingsAsObject() {
        const settings = await this.findAll();
        const result = {};
        settings.forEach(setting => {
            result[setting.key_name] = setting.value;
        });
        return result;
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map