import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

// Controllers
import { AppController } from './app.controller';

// Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { FavoritesModule } from './favorites/favorites.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { OrdersModule } from './orders/orders.module';
import { StockLogsModule } from './stock-logs/stock-logs.module';
import { SettingsModule } from './settings/settings.module';
import { RepairsModule } from './repairs/repairs.module';
import { ChatModule } from './chat/chat.module';
import { CartsModule } from './carts/carts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'dd_computer',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Use schema from database.sql
      logging: true,
      charset: 'utf8mb4',
      extra: {
        connectionLimit: 10,
        charset: 'utf8mb4',
      },
      supportBigNumbers: true,
      bigNumberStrings: true,
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    FavoritesModule,
    ReviewsModule,
    NotificationsModule,
    AdminModule,
    OrdersModule,
    SettingsModule,
    StockLogsModule,
    RepairsModule,
    ChatModule,
    CartsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
