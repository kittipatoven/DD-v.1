import { Conversation } from './conversation.entity';
export declare class Message {
    id: number;
    conversation_id: number;
    conversation: Conversation;
    sender_id: number;
    sender: any;
    message: string;
    is_read: boolean;
    read_at: Date;
    created_at: Date;
}
