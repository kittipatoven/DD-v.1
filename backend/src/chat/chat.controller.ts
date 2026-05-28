import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // สร้าง conversation ใหม่
  @Post('conversations')
  async createConversation(@Body() createConversationDto: CreateConversationDto) {
    return await this.chatService.createConversation(createConversationDto);
  }

  // ดึง conversations ทั้งหมดของ user
  @Get('conversations/user/:userId')
  async getUserConversations(@Param('userId') userId: string) {
    return await this.chatService.getUserConversations(+userId);
  }

  // ดึง conversations ทั้งหมดของ admin
  @Get('conversations/admin/:adminId')
  async getAdminConversations(@Param('adminId') adminId: string) {
    return await this.chatService.getAdminConversations(+adminId);
  }

  // ดึง conversation ตาม ID
  @Get('conversations/:id')
  async getConversationById(@Param('id') id: string) {
    return await this.chatService.getConversationById(+id);
  }

  // อัปเดตสถานะ conversation
  @Put('conversations/:id/status')
  async updateConversationStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return await this.chatService.updateConversationStatus(+id, status);
  }

  // ลบ conversation
  @Delete('conversations/:id')
  async deleteConversation(@Param('id') id: string) {
    await this.chatService.deleteConversation(+id);
    return { message: 'Conversation deleted successfully' };
  }

  // สร้าง message ใหม่
  @Post('messages')
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    return await this.chatService.createMessage(createMessageDto);
  }

  // ดึง messages ทั้งหมดของ conversation
  @Get('messages/conversation/:conversationId')
  async getConversationMessages(@Param('conversationId') conversationId: string) {
    return await this.chatService.getConversationMessages(+conversationId);
  }

  // อัปเดตสถานะ message ว่าอ่านแล้ว
  @Put('messages/:id/read')
  async markMessageAsRead(@Param('id') id: string) {
    return await this.chatService.markMessageAsRead(+id);
  }
}
