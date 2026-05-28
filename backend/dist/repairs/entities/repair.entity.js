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
exports.Repair = exports.RepairStatus = void 0;
const typeorm_1 = require("typeorm");
const repair_image_entity_1 = require("./repair-image.entity");
var RepairStatus;
(function (RepairStatus) {
    RepairStatus["COMPLETED"] = "completed";
    RepairStatus["IN_PROGRESS"] = "in_progress";
    RepairStatus["PENDING"] = "pending";
})(RepairStatus || (exports.RepairStatus = RepairStatus = {}));
let Repair = class Repair {
    constructor() {
        this.status = RepairStatus.COMPLETED;
    }
};
exports.Repair = Repair;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Repair.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Repair.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Repair.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Repair.prototype, "device_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RepairStatus,
        default: RepairStatus.COMPLETED,
    }),
    __metadata("design:type", String)
], Repair.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('User'),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", Object)
], Repair.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", Number)
], Repair.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Repair.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Repair.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => repair_image_entity_1.RepairImage, (image) => image.repair, { cascade: true }),
    __metadata("design:type", Array)
], Repair.prototype, "images", void 0);
exports.Repair = Repair = __decorate([
    (0, typeorm_1.Entity)('repairs')
], Repair);
//# sourceMappingURL=repair.entity.js.map