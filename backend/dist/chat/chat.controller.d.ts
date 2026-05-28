import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createConversation(createConversationDto: CreateConversationDto): Promise<import("./entities/conversation.entity").Conversation>;
    getUserConversations(userId: string): Promise<import("./entities/conversation.entity").Conversation[]>;
    getAdminConversations(adminId: string): Promise<import("./entities/conversation.entity").Conversation[]>;
    getConversationById(id: string): Promise<import("./entities/conversation.entity").Conversation>;
    updateConversationStatus(id: string, status: string): Promise<import("./entities/conversation.entity").Conversation>;
    deleteConversation(id: string): Promise<{
        message: string;
    }>;
    createMessage(createMessageDto: CreateMessageDto): Promise<import("./entities/message.entity").Message>;
    getConversationMessages(conversationId: string): Promise<import("./entities/message.entity").Message[]>;
    markMessageAsRead(id: string): Promise<import("./entities/message.entity").Message>;
}
