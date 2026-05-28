import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatService {
    private conversationRepository;
    private messageRepository;
    constructor(conversationRepository: Repository<Conversation>, messageRepository: Repository<Message>);
    createConversation(createConversationDto: CreateConversationDto): Promise<Conversation>;
    getUserConversations(userId: number): Promise<Conversation[]>;
    getAdminConversations(adminId: number): Promise<Conversation[]>;
    getConversationById(id: number): Promise<Conversation>;
    createMessage(createMessageDto: CreateMessageDto): Promise<Message>;
    getConversationMessages(conversationId: number): Promise<Message[]>;
    markMessageAsRead(messageId: number): Promise<Message>;
    updateConversationStatus(id: number, status: string): Promise<Conversation>;
    deleteConversation(id: number): Promise<void>;
}
