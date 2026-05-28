import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // เข้าร่วม conversation
  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() conversationId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation-${conversationId}`);
    console.log(`Client ${client.id} joined conversation ${conversationId}`);
  }

  // ออกจาก conversation
  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @MessageBody() conversationId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`conversation-${conversationId}`);
    console.log(`Client ${client.id} left conversation ${conversationId}`);
  }

  // ส่งข้อความใหม่
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.chatService.createMessage(createMessageDto);
      
      // ส่งข้อความไปยังทุกคนใน conversation
      this.server.to(`conversation-${createMessageDto.conversation_id}`).emit('newMessage', message);
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  // พิมพ์อยู่ (typing indicator)
  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { conversationId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(`conversation-${data.conversationId}`).emit('userTyping', data.userId);
  }

  // หยุดพิมพ์
  @SubscribeMessage('stopTyping')
  async handleStopTyping(
    @MessageBody() data: { conversationId: number; userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(`conversation-${data.conversationId}`).emit('userStoppedTyping', data.userId);
  }

  // อ่านข้อความ
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(@MessageBody() messageId: number) {
    try {
      const message = await this.chatService.markMessageAsRead(messageId);
      this.server.to(`conversation-${message.conversation_id}`).emit('messageRead', message);
      return message;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  }
}
