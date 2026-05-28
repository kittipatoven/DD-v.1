'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useChatStore } from '@/store/chat-store';
import { Send, MessageSquare, Users } from 'lucide-react';
import { chatApi, Conversation, Message } from '@/lib/chat-api';

export default function ChatPage() {
  const { user } = useAuthStore();
  const {
    conversations,
    currentConversation,
    messages,
    socket,
    isConnected,
    isTyping,
    setConversations,
    setCurrentConversation,
    setMessages,
    addMessage,
    connectSocket,
    disconnectSocket,
    joinConversation,
    leaveConversation,
    sendMessage,
    setTyping,
    markAsRead,
    loadUserConversations,
    loadConversationMessages,
  } = useChatStore();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user) {
      connectSocket();
      loadUserConversations(user.id);
    }

    return () => {
      disconnectSocket();
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    if (currentConversation) {
      leaveConversation(currentConversation.id);
    }

    setCurrentConversation(conversation);
    await loadConversationMessages(conversation.id);
    joinConversation(conversation.id);

    // Mark unread messages as read
    const unreadMessages = messages.filter((m) => !m.is_read && m.sender_id !== user?.id);
    unreadMessages.forEach((m) => markAsRead(m.id));
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && currentConversation && user) {
      sendMessage(currentConversation.id, user.id, newMessage);
      setNewMessage('');
      setTyping(null);
    }
  };

  const handleTyping = () => {
    if (user) {
      setTyping(user.id);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(null);
      }, 1000);
    }
  };

  const handleCreateConversation = async () => {
    if (user) {
      try {
        const newConv = await chatApi.createConversation({
          user_id: user.id,
          admin_id: 1, // Default admin ID
        });
        setConversations([...conversations, newConv]);
        handleSelectConversation(newConv);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex gap-4 h-[calc(100vh-2rem)]">
          {/* Conversation List */}
          <div className="w-1/3 bg-slate-800 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  แชท
                </h2>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-400">
                    {isConnected ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCreateConversation}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                + เริ่มแชทใหม่
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  ยังไม่มีการแชท
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors ${
                      currentConversation?.id === conv.id ? 'bg-slate-700' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">การสนทนา #{conv.id}</div>
                        <div className="text-sm text-gray-400">
                          {conv.status === 'active' ? 'กำลังดำเนินการ' : conv.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="w-2/3 bg-slate-800 rounded-lg overflow-hidden flex flex-col">
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-700">
                  <h3 className="font-semibold">การสนทนา #{currentConversation.id}</h3>
                  <div className="text-sm text-gray-400">
                    สถานะ: {currentConversation.status}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400">
                      เริ่มการสนทนา...
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender_id === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          <div>{msg.message}</div>
                          <div className="text-xs mt-1 opacity-70">
                            {new Date(msg.created_at).toLocaleTimeString('th-TH')}
                            {msg.is_read && ' ✓'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isTyping && isTyping !== user?.id && (
                    <div className="text-gray-400 text-sm">กำลังพิมพ์...</div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                      placeholder="พิมพ์ข้อความ..."
                      className="flex-1 bg-slate-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                เลือกการสนทนาเพื่อเริ่มแชท
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
