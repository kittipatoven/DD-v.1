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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairImage = exports.RepairImageType = void 0;
const typeorm_1 = require("typeorm");
const repair_entity_1 = require("./repair.entity");
var RepairImageType;
(function (RepairImageType) {
    RepairImageType["BEFORE"] = "before";
    RepairImageType["AFTER"] = "after";
    RepairImageType["DURING"] = "during";
})(RepairImageType || (exports.RepairImageType = RepairImageType = {}));
let RepairImage = class RepairImage {
    constructor() {
        this.image_type = RepairImageType.AFTER;
    }
};
exports.RepairImage = RepairImage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RepairImage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => repair_entity_1.Repair, (repair) => repair.images, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'repair_id' }),
    __metadata("design:type", repair_entity_1.Repair)
], RepairImage.prototype, "repair", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RepairImage.prototype, "repair_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], RepairImage.prototype, "image_url", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RepairImageType,
        default: RepairImageType.AFTER,
    }),
    __metadata("design:type", String)
], RepairImage.prototype, "image_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RepairImage.prototype, "caption", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RepairImage.prototype, "created_at", void 0);
exports.RepairImage = RepairImage = __decorate([
    (0, typeorm_1.Entity)('repair_images')
], RepairImage);
//# sourceMappingURL=repair-image.entity.js.map