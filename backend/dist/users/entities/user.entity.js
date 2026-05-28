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
exports.User = exports.UserStatus = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["BANNED"] = "banned";
    UserStatus["MUTED"] = "muted";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_online', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], User.prototype, "last_online", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_online', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "is_online", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reset_token', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "reset_token", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reset_token_expiry', nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], User.prototype, "reset_token_expiry", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('Product', 'createdBy'),
    __metadata("design:type", Array)
], User.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('Review', 'user'),
    __metadata("design:type", Array)
], User.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('Favorite', 'user'),
    __metadata("design:type", Array)
], User.prototype, "favorites", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('Notification', 'user'),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('ProductView', 'user'),
    __metadata("design:type", Array)
], User.prototype, "productViews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('Order', 'user'),
    __metadata("design:type", Array)
], User.prototype, "orders", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map