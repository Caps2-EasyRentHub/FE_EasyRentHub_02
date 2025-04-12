import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Chat, Message, ChatState } from '../types/chat';
import { chatService } from '../services/chatService';
import { AuthContext } from '../context/AuthContext';

type ChatAction =
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'SET_CURRENT_CHAT'; payload: Chat | null }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChat: action.payload };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  sendMessage: (content: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  loadAdminChats: (adminId: string) => Promise<void>;
  loadLandlordChats: (landlordId: string) => Promise<void>;
  initiateAdminChat: (landlordId: string, adminId: string, estateId?: string) => Promise<void>;
} | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { idUser, userRole } = useContext(AuthContext);

  const loadChats = async () => {
    if (!idUser) return;
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      let chats;
      if (userRole === 'admin') {
        chats = await chatService.getAdminChats(idUser);
      } else if (userRole === 'landlord') {
        chats = await chatService.getLandlordChats(idUser);
      } else {
        chats = await chatService.getChats(idUser);
      }
      dispatch({ type: 'SET_CHATS', payload: chats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load chats' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  useEffect(() => {
    if (idUser) {
      loadChats();
    }
  }, [idUser, loadChats]);

  const loadMessages = async (chatId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const messages = await chatService.getMessages(chatId);
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load messages' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const sendMessage = async (content: string) => {
    if (!state.currentChat || !idUser) return;
    try {
      const message = await chatService.sendMessage({
        senderId: idUser,
        receiverId: state.currentChat.participant.id,
        content,
      });
      dispatch({ type: 'ADD_MESSAGE', payload: message });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
    }
  };

  const loadAdminChats = async (adminId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const chats = await chatService.getAdminChats(adminId);
      dispatch({ type: 'SET_CHATS', payload: chats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load admin chats' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadLandlordChats = async (landlordId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const chats = await chatService.getLandlordChats(landlordId);
      dispatch({ type: 'SET_CHATS', payload: chats });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load landlord chats' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const initiateAdminChat = async (landlordId: string, adminId: string, estateId?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const chat = await chatService.initiateAdminChat(landlordId, adminId, estateId);
      dispatch({ type: 'SET_CURRENT_CHAT', payload: chat });
      dispatch({ type: 'SET_CHATS', payload: [...state.chats, chat] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initiate admin chat' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <ChatContext.Provider 
      value={{ 
        state, 
        dispatch, 
        sendMessage, 
        loadMessages,
        loadAdminChats,
        loadLandlordChats,
        initiateAdminChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 