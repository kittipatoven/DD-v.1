import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Conversation, Message, chatApi } from '@/lib/chat-api';
import { getWsUrl } from '@/lib/env';

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  socket: Socket | null;
  isConnected: boolean;
  isTyping: number | null; // user_id ที่กำลังพิมพ์

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  connectSocket: () => void;
  disconnectSocket: () => void;
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  sendMessage: (conversationId: number, senderId: number, message: string) => void;
  setTyping: (userId: number | null) => void;
  markAsRead: (messageId: number) => void;
  loadUserConversations: (userId: number) => Promise<void>;
  loadAdminConversations: (adminId: number) => Promise<void>;
  loadConversationMessages: (conversationId: number) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  socket: null,
  isConnected: false,
  isTyping: null,

  setConversations: (conversations) => set({ conversations }),

  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),

  connectSocket: () => {
    const socket = io(getWsUrl(), {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      set({ isConnected: false });
    });

    socket.on('newMessage', (message: Message) => {
      console.log('New message received:', message);
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });

    socket.on('userTyping', (userId: number) => {
      set({ isTyping: userId });
    });

    socket.on('userStoppedTyping', (userId: number) => {
      set((state) => ({ isTyping: state.isTyping === userId ? null : state.isTyping }));
    });

    socket.on('messageRead', (message: Message) => {
      set((state) => ({
        messages: state.messages.map((m) => (m.id === message.id ? message : m)),
      }));
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinConversation: (conversationId: number) => {
    const { socket } = get();
    if (socket) {
      socket.emit('joinConversation', conversationId);
    }
  },

  leaveConversation: (conversationId: number) => {
    const { socket } = get();
    if (socket) {
      socket.emit('leaveConversation', conversationId);
    }
  },

  sendMessage: (conversationId: number, senderId: number, message: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('sendMessage', {
        conversation_id: conversationId,
        sender_id: senderId,
        message,
      });
    }
  },

  setTyping: (userId: number | null) => {
    const { socket, currentConversation } = get();
    if (socket && currentConversation) {
      if (userId) {
        socket.emit('typing', { conversationId: currentConversation.id, userId });
      } else {
        socket.emit('stopTyping', { conversationId: currentConversation.id, userId });
      }
    }
  },

  markAsRead: async (messageId: number) => {
    const { socket } = get();
    if (socket) {
      socket.emit('markAsRead', messageId);
    }
    await chatApi.markMessageAsRead(messageId);
  },

  loadUserConversations: async (userId: number) => {
    try {
      const conversations = await chatApi.getUserConversations(userId);
      set({ conversations });
    } catch (error) {
      console.error('Failed to load user conversations:', error);
    }
  },

  loadAdminConversations: async (adminId: number) => {
    try {
      const conversations = await chatApi.getAdminConversations(adminId);
      set({ conversations });
    } catch (error) {
      console.error('Failed to load admin conversations:', error);
    }
  },

  loadConversationMessages: async (conversationId: number) => {
    try {
      const messages = await chatApi.getConversationMessages(conversationId);
      set({ messages });
    } catch (error) {
      console.error('Failed to load conversation messages:', error);
    }
  },
}));
