"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCartItemDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const add_to_cart_dto_1 = require("./add-to-cart.dto");
class UpdateCartItemDto extends (0, mapped_types_1.PartialType)(add_to_cart_dto_1.AddToCartDto) {
}
exports.UpdateCartItemDto = UpdateCartItemDto;
//# sourceMappingURL=update-cart-item.dto.js.map