export declare enum UserRole {
    ADMIN = "admin",
    USER = "user"
}
export declare enum UserStatus {
    ACTIVE = "active",
    BANNED = "banned",
    MUTED = "muted"
}
export declare class User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
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
}
