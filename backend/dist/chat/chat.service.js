"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_entity_1 = require("./entities/message.entity");
let ChatService = class ChatService {
    constructor(conversationRepository, messageRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }
    async createConversation(createConversationDto) {
        const conversation = this.conversationRepository.create(createConversationDto);
        return await this.conversationRepository.save(conversation);
    }
    async getUserConversations(userId) {
        return await this.conversationRepository.find({
            where: { user_id: userId },
            relations: ['admin', 'product', 'messages'],
            order: { updated_at: 'DESC' },
        });
    }
    async getAdminConversations(adminId) {
        return await this.conversationRepository.find({
            where: { admin_id: adminId },
            relations: ['user', 'product', 'messages'],
            order: { updated_at: 'DESC' },
        });
    }
    async getConversationById(id) {
        const conversation = await this.conversationRepository.findOne({
            where: { id },
            relations: ['user', 'admin', 'product', 'messages'],
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        return conversation;
    }
    async createMessage(createMessageDto) {
        const message = this.messageRepository.create(createMessageDto);
        const savedMessage = await this.messageRepository.save(message);
        await this.conversationRepository.update(createMessageDto.conversation_id, { updated_at: new Date() });
        return savedMessage;
    }
    async getConversationMessages(conversationId) {
        return await this.messageRepository.find({
            where: { conversation_id: conversationId },
            relations: ['sender'],
            order: { created_at: 'ASC' },
        });
    }
    async markMessageAsRead(messageId) {
        const message = await this.messageRepository.findOne({ where: { id: messageId } });
        if (!message) {
            throw new common_1.NotFoundException('Message not found');
        }
        message.is_read = true;
        message.read_at = new Date();
        return await this.messageRepository.save(message);
    }
    async updateConversationStatus(id, status) {
        const conversation = await this.conversationRepository.findOne({ where: { id } });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        conversation.status = status;
        return await this.conversationRepository.save(conversation);
    }
    async deleteConversation(id) {
        const conversation = await this.conversationRepository.findOne({ where: { id } });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        await this.conversationRepository.remove(conversation);
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map