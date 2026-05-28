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
exports.Order = exports.OrderStatus = void 0;
const typeorm_1 = require("typeorm");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["CONFIRMED"] = "confirmed";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["COMPLETED"] = "completed";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
let Order = class Order {
};
exports.Order = Order;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Order.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('User'),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Object)
], Order.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", Number)
], Order.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Order.prototype, "total_price", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Order.prototype, "shipping_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 20 }),
    __metadata("design:type", String)
], Order.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Order.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Order.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'updated_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Order.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('OrderItem', 'order'),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
exports.Order = Order = __decorate([
    (0, typeorm_1.Entity)('orders')
], Order);
//# sourceMappingURL=order.entity.js.map