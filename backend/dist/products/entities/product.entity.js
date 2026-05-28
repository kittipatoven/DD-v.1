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
exports.Product = exports.ProductType = exports.ProductStatus = void 0;
const typeorm_1 = require("typeorm");
const product_image_entity_1 = require("./product-image.entity");
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["ACTIVE"] = "active";
    ProductStatus["INACTIVE"] = "inactive";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
var ProductType;
(function (ProductType) {
    ProductType["NOTEBOOK"] = "notebook";
    ProductType["PC"] = "pc";
})(ProductType || (exports.ProductType = ProductType = {}));
let Product = class Product {
    constructor() {
        this.type = ProductType.PC;
        this.status = ProductStatus.ACTIVE;
    }
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('Category'),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", Object)
], Product.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id' }),
    __metadata("design:type", Number)
], Product.prototype, "category_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Product.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProductType,
        default: ProductType.PC,
    }),
    __metadata("design:type", String)
], Product.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProductStatus,
        default: ProductStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Product.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('User'),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", Object)
], Product.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", Number)
], Product.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_at', type: 'timestamp' }),
    __metadata("design:type", Date)
], Product.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_image_entity_1.ProductImage, (image) => image.product),
    __metadata("design:type", Array)
], Product.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('Review', 'product'),
    __metadata("design:type", Array)
], Product.prototype, "reviews", void 0);
__decorate([
    (0, typeorm_1.OneToMany)('Favorite', 'product'),
    __metadata("design:type", Array)
], Product.prototype, "favorites", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)('products')
], Product);
//# sourceMappingURL=product.entity.js.map