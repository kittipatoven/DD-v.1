import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private usersService;
    constructor(configService: ConfigService, usersService: UsersService);
    validate(payload: any): Promise<{
        role: any;
        id: number;
        name: string;
        email: string;
        status: import("../../users/entities/user.entity").UserStatus;
        avatar: string;
        last_online: Date;
        is_online: boolean;
        created_at: Date;
        reset_token: string;
        reset_token_expiry: Date;
        products: any[];
        reviews: any[];
        favorites: any[];
        notifications: any[];
        productViews: any[];
        orders: any[];
    }>;
}
export {};
