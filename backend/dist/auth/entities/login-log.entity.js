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
exports.LoginLog = void 0;
const typeorm_1 = require("typeorm");
let LoginLog = class LoginLog {
};
exports.LoginLog = LoginLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LoginLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], LoginLog.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LoginLog.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LoginLog.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], LoginLog.prototype, "user_agent", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['success', 'failed', 'locked'],
        default: 'failed',
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], LoginLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], LoginLog.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_at', type: 'timestamp' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Date)
], LoginLog.prototype, "created_at", void 0);
exports.LoginLog = LoginLog = __decorate([
    (0, typeorm_1.Entity)('login_logs')
], LoginLog);
//# sourceMappingURL=login-log.entity.js.map