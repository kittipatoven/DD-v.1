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
exports.CartsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("./entities/cart.entity");
const cart_item_entity_1 = require("./entities/cart-item.entity");
let CartsService = class CartsService {
    constructor(cartRepository, cartItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }
    async createCart(createCartDto) {
        const cart = this.cartRepository.create(createCartDto);
        return await this.cartRepository.save(cart);
    }
    async getUserCart(userId) {
        let cart = await this.cartRepository.findOne({
            where: { user_id: userId },
            relations: ['items', 'items.product'],
        });
        if (!cart) {
            cart = await this.createCart({ user_id: userId });
        }
        return cart;
    }
    async addToCart(userId, addToCartDto) {
        const cart = await this.getUserCart(userId);
        let cartItem = await this.cartItemRepository.findOne({
            where: { cart_id: cart.id, product_id: addToCartDto.product_id },
            relations: ['product'],
        });
        if (cartItem) {
            cartItem.quantity += addToCartDto.quantity;
            return await this.cartItemRepository.save(cartItem);
        }
        cartItem = this.cartItemRepository.create({
            cart_id: cart.id,
            ...addToCartDto,
        });
        return await this.cartItemRepository.save(cartItem);
    }
    async updateCartItem(cartItemId, updateDto) {
        const cartItem = await this.cartItemRepository.findOne({ where: { id: cartItemId } });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        cartItem.quantity = updateDto.quantity;
        return await this.cartItemRepository.save(cartItem);
    }
    async removeCartItem(cartItemId) {
        const cartItem = await this.cartItemRepository.findOne({ where: { id: cartItemId } });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        await this.cartItemRepository.remove(cartItem);
    }
    async clearCart(userId) {
        const cart = await this.getUserCart(userId);
        await this.cartItemRepository.delete({ cart_id: cart.id });
    }
    async getCartTotal(userId) {
        const cart = await this.getUserCart(userId);
        let total = 0;
        for (const item of cart.items) {
            if (item.product) {
                total += Number(item.product.price) * item.quantity;
            }
        }
        return total;
    }
};
exports.CartsService = CartsService;
exports.CartsService = CartsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CartsService);
//# sourceMappingURL=carts.service.js.map