import { Message } from './message.entity';
export declare enum ConversationStatus {
    ACTIVE = "active",
    CLOSED = "closed",
    ARCHIVED = "archived"
}
export declare class Conversation {
    id: number;
    user_id: number;
    user: any;
    admin_id: number;
    admin: any;
    product_id: number;
    product: any;
    status: ConversationStatus;
    created_at: Date;
    updated_at: Date;
    messages: Message[];
}
