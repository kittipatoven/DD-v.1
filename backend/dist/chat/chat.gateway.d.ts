import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinConversation(conversationId: number, client: Socket): Promise<void>;
    handleLeaveConversation(conversationId: number, client: Socket): Promise<void>;
    handleSendMessage(createMessageDto: CreateMessageDto, client: Socket): Promise<import("./entities/message.entity").Message>;
    handleTyping(data: {
        conversationId: number;
        userId: number;
    }, client: Socket): Promise<void>;
    handleStopTyping(data: {
        conversationId: number;
        userId: number;
    }, client: Socket): Promise<void>;
    handleMarkAsRead(messageId: number): Promise<import("./entities/message.entity").Message>;
}
