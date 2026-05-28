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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
const create_message_dto_1 = require("./dto/create-message.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async createConversation(createConversationDto) {
        return await this.chatService.createConversation(createConversationDto);
    }
    async getUserConversations(userId) {
        return await this.chatService.getUserConversations(+userId);
    }
    async getAdminConversations(adminId) {
        return await this.chatService.getAdminConversations(+adminId);
    }
    async getConversationById(id) {
        return await this.chatService.getConversationById(+id);
    }
    async updateConversationStatus(id, status) {
        return await this.chatService.updateConversationStatus(+id, status);
    }
    async deleteConversation(id) {
        await this.chatService.deleteConversation(+id);
        return { message: 'Conversation deleted successfully' };
    }
    async createMessage(createMessageDto) {
        return await this.chatService.createMessage(createMessageDto);
    }
    async getConversationMessages(conversationId) {
        return await this.chatService.getConversationMessages(+conversationId);
    }
    async markMessageAsRead(id) {
        return await this.chatService.markMessageAsRead(+id);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conversation_dto_1.CreateConversationDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('conversations/user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserConversations", null);
__decorate([
    (0, common_1.Get)('conversations/admin/:adminId'),
    __param(0, (0, common_1.Param)('adminId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getAdminConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversationById", null);
__decorate([
    (0, common_1.Put)('conversations/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateConversationStatus", null);
__decorate([
    (0, common_1.Delete)('conversations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)('messages'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createMessage", null);
__decorate([
    (0, common_1.Get)('messages/conversation/:conversationId'),
    __param(0, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversationMessages", null);
__decorate([
    (0, common_1.Put)('messages/:id/read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markMessageAsRead", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map