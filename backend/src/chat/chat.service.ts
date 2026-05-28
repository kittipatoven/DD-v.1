import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  // สร้าง conversation ใหม่
  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    const conversation = this.conversationRepository.create(createConversationDto);
    return await this.conversationRepository.save(conversation);
  }

  // ดึง conversations ทั้งหมดของ user
  async getUserConversations(userId: number): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: { user_id: userId },
      relations: ['admin', 'product', 'messages'],
      order: { updated_at: 'DESC' },
    });
  }

  // ดึง conversations ทั้งหมดของ admin
  async getAdminConversations(adminId: number): Promise<Conversation[]> {
    return await this.conversationRepository.find({
      where: { admin_id: adminId },
      relations: ['user', 'product', 'messages'],
      order: { updated_at: 'DESC' },
    });
  }

  // ดึง conversation ตาม ID
  async getConversationById(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['user', 'admin', 'product', 'messages'],
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  // สร้าง message ใหม่
  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);
    const savedMessage = await this.messageRepository.save(message);

    // อัปเดต updated_at ของ conversation
    await this.conversationRepository.update(
      createMessageDto.conversation_id,
      { updated_at: new Date() },
    );

    return savedMessage;
  }

  // ดึง messages ทั้งหมดของ conversation
  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { conversation_id: conversationId },
      relations: ['sender'],
      order: { created_at: 'ASC' },
    });
  }

  // อัปเดตสถานะ message ว่าอ่านแล้ว
  async markMessageAsRead(messageId: number): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    message.is_read = true;
    message.read_at = new Date();
    return await this.messageRepository.save(message);
  }

  // อัปเดตสถานะ conversation
  async updateConversationStatus(id: number, status: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({ where: { id } });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    conversation.status = status as any;
    return await this.conversationRepository.save(conversation);
  }

  // ลบ conversation
  async deleteConversation(id: number): Promise<void> {
    const conversation = await this.conversationRepository.findOne({ where: { id } });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    await this.conversationRepository.remove(conversation);
  }
}
