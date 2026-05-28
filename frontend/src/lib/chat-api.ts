import api from './api';

export interface Conversation {
  id: number;
  user_id: number;
  admin_id: number;
  product_id?: number;
  status: 'active' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
  user?: any;
  admin?: any;
  product?: any;
  messages?: Message[];
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender?: any;
}

export interface CreateConversationDto {
  user_id: number;
  admin_id: number;
  product_id?: number;
}

export interface CreateMessageDto {
  conversation_id: number;
  sender_id: number;
  message: string;
}

export const chatApi = {
  // สร้าง conversation ใหม่
  createConversation: async (data: CreateConversationDto): Promise<Conversation> => {
    const response = await api.post('/chat/conversations', data);
    return response.data;
  },

  // ดึง conversations ทั้งหมดของ user
  getUserConversations: async (userId: number): Promise<Conversation[]> => {
    const response = await api.get(`/chat/conversations/user/${userId}`);
    return response.data;
  },

  // ดึง conversations ทั้งหมดของ admin
  getAdminConversations: async (adminId: number): Promise<Conversation[]> => {
    const response = await api.get(`/chat/conversations/admin/${adminId}`);
    return response.data;
  },

  // ดึง conversation ตาม ID
  getConversationById: async (id: number): Promise<Conversation> => {
    const response = await api.get(`/chat/conversations/${id}`);
    return response.data;
  },

  // อัปเดตสถานะ conversation
  updateConversationStatus: async (id: number, status: string): Promise<Conversation> => {
    const response = await api.put(`/chat/conversations/${id}/status`, { status });
    return response.data;
  },

  // ลบ conversation
  deleteConversation: async (id: number): Promise<void> => {
    await api.delete(`/chat/conversations/${id}`);
  },

  // สร้าง message ใหม่
  createMessage: async (data: CreateMessageDto): Promise<Message> => {
    const response = await api.post('/chat/messages', data);
    return response.data;
  },

  // ดึง messages ทั้งหมดของ conversation
  getConversationMessages: async (conversationId: number): Promise<Message[]> => {
    const response = await api.get(`/chat/messages/conversation/${conversationId}`);
    return response.data;
  },

  // อัปเดตสถานะ message ว่าอ่านแล้ว
  markMessageAsRead: async (messageId: number): Promise<Message> => {
    const response = await api.put(`/chat/messages/${messageId}/read`);
    return response.data;
  },
};
