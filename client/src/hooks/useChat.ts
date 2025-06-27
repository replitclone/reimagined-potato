import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, OnlineUser } from '@/types/chat';
import { 
  getFirebaseDatabase, 
  ref, 
  push, 
  set, 
  onValue, 
  serverTimestamp, 
  onDisconnect,
  type Unsubscribe 
} from '@/services/firebase';
import { initializeGemini, shouldAiRespond, generateAiResponse, isGeminiAvailable } from '@/services/gemini';

export const useChat = (userId: string, username: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const messagesListener = useRef<Unsubscribe | null>(null);
  const usersListener = useRef<Unsubscribe | null>(null);
  const geminiInitialized = useRef(false);
  const [geminiReady, setGeminiReady] = useState(false);

  // Initialize Gemini on first use
  useEffect(() => {
    if (!geminiInitialized.current) {
      console.log('Initializing Gemini...');
      initializeGemini().then((success) => {
        console.log('Gemini initialization result:', success);
        setGeminiReady(success);
        geminiInitialized.current = true;
      });
    }
  }, []);

  const setupListeners = useCallback(() => {
    try {
      const database = getFirebaseDatabase();
      
      // Listen to messages
      const messagesRef = ref(database, 'messages');
      messagesListener.current = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messagesList = Object.entries(data)
            .map(([id, msg]: [string, any]) => ({ id, ...msg }))
            .sort((a, b) => a.timestamp - b.timestamp);
          setMessages(messagesList);
        } else {
          setMessages([]);
        }
      }, (error) => {
        console.error('Messages listener error:', error);
        setIsConnected(false);
      });

      // Listen to online users
      const usersRef = ref(database, 'users');
      usersListener.current = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        setOnlineUsers(data || {});
        setIsConnected(true);
      }, (error) => {
        console.error('Users listener error:', error);
        setIsConnected(false);
      });

    } catch (error) {
      console.error('Error setting up listeners:', error);
      setIsConnected(false);
    }
  }, []);

  const addUserToOnline = useCallback(async () => {
    try {
      const database = getFirebaseDatabase();
      const userRef = ref(database, `users/${userId}`);
      
      await set(userRef, {
        username: username.trim(),
        joinedAt: serverTimestamp(),
        lastSeen: serverTimestamp()
      });

      // Set up disconnect handler
      onDisconnect(userRef).remove();
      
      setIsConnected(true);
    } catch (error) {
      console.error('Error adding user to online list:', error);
      throw error;
    }
  }, [userId, username]);

  const sendMessage = useCallback(async (text: string) => {
    try {
      const database = getFirebaseDatabase();
      const messageData: Omit<Message, 'id'> = {
        text: text.trim(),
        username,
        userId,
        timestamp: Date.now(),
        isAi: false
      };

      const messagesRef = ref(database, 'messages');
      await push(messagesRef, messageData);

      // Check if AI should respond (wait a bit for Gemini to initialize)
      setTimeout(() => {
        console.log('Checking AI response conditions:', {
          geminiReady,
          isGeminiAvailable: isGeminiAvailable(),
          shouldAiRespond: shouldAiRespond(text),
          message: text
        });
        
        if (isGeminiAvailable() && shouldAiRespond(text)) {
          console.log('AI will respond to message:', text);
          setTimeout(() => {
            generateAiResponseAsync(text, username);
          }, 1000 + Math.random() * 1000);
        }
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [username, userId]);

  const generateAiResponseAsync = useCallback(async (triggerMessage: string, triggerUser: string) => {
    console.log('generateAiResponseAsync called with:', { triggerMessage, triggerUser });
    
    if (!isGeminiAvailable()) {
      console.log('Gemini not available, skipping AI response');
      return;
    }
    
    console.log('Starting AI response generation...');
    setIsAiThinking(true);
    
    try {
      const currentOnlineUsers = Object.values(onlineUsers).map(user => user.username);
      const currentMessages = [...messages];
      console.log('Calling generateAiResponse with:', { triggerMessage, triggerUser, currentOnlineUsers, messagesCount: currentMessages.length });
      const aiText = await generateAiResponse(triggerMessage, triggerUser, currentMessages, currentOnlineUsers);
      console.log('AI response generated:', aiText);
      
      const database = getFirebaseDatabase();
      const aiMessageData: Omit<Message, 'id'> = {
        text: aiText,
        username: 'AI Assistant',
        userId: 'ai_assistant_gemini',
        timestamp: Date.now(),
        isAi: true
      };

      const messagesRef = ref(database, 'messages');
      await push(messagesRef, aiMessageData);
      
    } catch (error) {
      console.error('AI response error:', error);
      
      // Send error message to chat
      try {
        const database = getFirebaseDatabase();
        const messagesRef = ref(database, 'messages');
        await push(messagesRef, {
          text: "I'm having a little trouble thinking right now. Please try again in a moment.",
          username: 'AI Assistant',
          userId: 'ai_assistant_gemini',
          timestamp: Date.now(),
          isAi: true
        });
      } catch (fallbackError) {
        console.error('Failed to send error message:', fallbackError);
      }
    } finally {
      setIsAiThinking(false);
    }
  }, [messages, onlineUsers, geminiReady]);

  const leaveChat = useCallback(async () => {
    try {
      const database = getFirebaseDatabase();
      const userRef = ref(database, `users/${userId}`);
      await set(userRef, null);
      
      // Clean up listeners
      if (messagesListener.current) {
        messagesListener.current();
        messagesListener.current = null;
      }
      if (usersListener.current) {
        usersListener.current();
        usersListener.current = null;
      }
      
      setMessages([]);
      setOnlineUsers({});
      setIsConnected(false);
    } catch (error) {
      console.error('Error leaving chat:', error);
      throw error;
    }
  }, [userId]);

  return {
    messages,
    onlineUsers,
    isConnected,
    isAiThinking,
    sendMessage,
    leaveChat,
    setupListeners,
    addUserToOnline
  };
};
