"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const app_controller_1 = require("./app.controller");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const products_module_1 = require("./products/products.module");
const categories_module_1 = require("./categories/categories.module");
const favorites_module_1 = require("./favorites/favorites.module");
const reviews_module_1 = require("./reviews/reviews.module");
const notifications_module_1 = require("./notifications/notifications.module");
const admin_module_1 = require("./admin/admin.module");
const orders_module_1 = require("./orders/orders.module");
const stock_logs_module_1 = require("./stock-logs/stock-logs.module");
const settings_module_1 = require("./settings/settings.module");
const repairs_module_1 = require("./repairs/repairs.module");
const chat_module_1 = require("./chat/chat.module");
const carts_module_1 = require("./carts/carts.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 10,
                },
            ]),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT) || 3306,
                username: process.env.DB_USERNAME || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_DATABASE || 'dd_computer',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: false,
                logging: true,
                charset: 'utf8mb4',
                extra: {
                    connectionLimit: 10,
                    charset: 'utf8mb4',
                },
                supportBigNumbers: true,
                bigNumberStrings: true,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            categories_module_1.CategoriesModule,
            favorites_module_1.FavoritesModule,
            reviews_module_1.ReviewsModule,
            notifications_module_1.NotificationsModule,
            admin_module_1.AdminModule,
            orders_module_1.OrdersModule,
            settings_module_1.SettingsModule,
            stock_logs_module_1.StockLogsModule,
            repairs_module_1.RepairsModule,
            chat_module_1.ChatModule,
            carts_module_1.CartsModule,
        ],
        controllers: [app_controller_1.AppController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map