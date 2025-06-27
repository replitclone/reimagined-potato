import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Bot, MessageCircle, Wifi, WifiOff, LogOut } from 'lucide-react';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Firebase configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAfX9xEEoJrkLDGU0DDSxmmBwELCffEHU4",
  authDomain: "multiuserchatapp-953e6.firebaseapp.com",
  databaseURL: "https://multiuserchatapp-953e6-default-rtdb.firebaseio.com",
  projectId: "multiuserchatapp-953e6",
  storageBucket: "multiuserchatapp-953e6.firebasestorage.app",
  messagingSenderId: "631023246649",
  appId: "1:631023246649:web:988a7d00dc254563ee1ce8",
  measurementId: "G-VC035DYMNV"
};

// NEW: Add your Google AI API Key here
const GEMINI_API_KEY = 'YOUR_GOOGLE_AI_API_KEY'; // <-- ⚠️ PASTE YOUR KEY HERE

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Firebase SDK imports and initialization
let database = null;
let onValue = null;
let ref = null;
let push = null;
let set = null;
let serverTimestamp = null;
let onDisconnect = null;

// NEW: Google AI SDK variables
let GoogleGenerativeAI = null;
let genAI = null;
let geminiModel = null;

// Initialize Firebase and Google AI when component mounts
const initializeServices = async () => {
  try {
    // Import Firebase modules
    const { getDatabase, ref: dbRef, push: dbPush, set: dbSet, onValue: dbOnValue, serverTimestamp: dbServerTimestamp, onDisconnect: dbOnDisconnect } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    ref = dbRef;
    push = dbPush;
    set = dbSet;
    onValue = dbOnValue;
    serverTimestamp = dbServerTimestamp;
    onDisconnect = dbOnDisconnect;

    // NEW: Dynamically import and initialize Google AI SDK
    if (GEMINI_API_KEY === 'YOUR_GOOGLE_AI_API_KEY') {
        console.warn("Google AI API Key not set. AI features will be disabled.");
        return false; // Return false but don't throw an error, so the chat can still work.
    }
    const aiModule = await import('https://esm.sh/@google/generative-ai');
    GoogleGenerativeAI = aiModule.GoogleGenerativeAI;
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: "gemma-3-27b-it" }); // Using Gemini Flash for speed
    
    return true;
  } catch (error) {
    console.error('Initialization failed:', error);
    return false;
  }
};


const RealTimeAIChatboard = () => {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showJoinPrompt, setShowJoinPrompt] = useState(true);
  const [servicesInitialized, setServicesInitialized] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const messagesListener = useRef(null);
  const usersListener = useRef(null);

  // Generate unique user ID
  const generateUserId = () => {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  // Initialize Firebase on component mount
  useEffect(() => {
    const init = async () => {
      const success = await initializeServices();
      setServicesInitialized(success);
      if (!success && GEMINI_API_KEY === 'YOUR_GOOGLE_AI_API_KEY') {
        setError('Please add your Google AI API Key to the code to enable the AI assistant.');
      } else if (!success) {
        setError('Failed to initialize services. Please check your configuration and API keys.');
      }
    };
    init();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join chat function
  const joinChat = async () => {
    if (!servicesInitialized) {
      setError('Services not initialized. Please refresh and try again.');
      return;
    }
    
    if (!username.trim()) return;
    
    try {
      const newUserId = generateUserId();
      setUserId(newUserId);
      
      // Add user to online users
      const userRef = ref(database, `users/${newUserId}`);
      await set(userRef, {
        username: username.trim(),
        joinedAt: serverTimestamp(),
        lastSeen: serverTimestamp()
      });
      
      // Set up disconnect handler
      onDisconnect(userRef).remove();
      
      setShowJoinPrompt(false);
      setIsConnected(true);
      
      // Set up listeners
      setupListeners();
      
    } catch (error) {
      console.error('Error joining chat:', error);
      setError('Failed to join chat. Please try again.');
    }
  };

  // Set up Firebase listeners
  const setupListeners = () => {
    if (!database) return;
    
    // Listen to messages
    const messagesRef = ref(database, 'messages');
    messagesListener.current = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList = Object.entries(data)
          .map(([id, msg]) => ({ id, ...msg }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messagesList);
      }
    });
    
    // Listen to online users
    const usersRef = ref(database, 'users');
    usersListener.current = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      setOnlineUsers(data || {});
    });
  };

  // Send message function
  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!currentMessage.trim() || !database) return;

    try {
      const messageData = {
        text: currentMessage.trim(),
        username: username,
        userId: userId,
        timestamp: Date.now(),
        isAi: false
      };

      // Add message to Firebase
      const messagesRef = ref(database, 'messages');
      await push(messagesRef, messageData);

      // Check if AI should respond
      if (shouldAiRespond(currentMessage)) {
        setTimeout(() => {
          generateAiResponse(currentMessage, username);
        }, 1000 + Math.random() * 1000); // Reduced delay for faster response
      }

      setCurrentMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  // AI response logic
  const shouldAiRespond = (message) => {
    // Only respond if the AI model is available
    if (!geminiModel) return false;
      
    const triggers = [
      /\?$/,
      /^(what|how|when|where|why|who|can|could|would|should|is|are|do|does)/i,
      /\b(help|explain|wondering|curious|advice|opinion|think|know|ai|bot|assistant|gemini)\b/i
    ];
    
    return triggers.some(trigger => trigger.test(message)) || Math.random() < 0.2; // Reduced random response chance
  };

  // NEW: Updated to use the Gemini API
  const generateAiResponse = async (triggerMessage, triggerUser) => {
    if (!geminiModel) {
        console.error("Gemini model not initialized.");
        return;
    }
    setIsAiThinking(true);
    
    try {
      const recentMessages = messages.slice(-10000); // Get last 10000 messages for context
      const onlineUsersList = Object.values(onlineUsers).map(user => user.username).join(', ');
      
      const prompt = `You are a friendly and helpful AI assistant named Gemini in a group chat. The current users are: ${onlineUsersList}.

Here is the recent conversation history:
${recentMessages.map(msg => `${msg.username}: ${msg.text}`).join('\n')}

The latest message is from ${triggerUser}: "${triggerMessage}"

Your task is to respond to the latest message in a natural, conversational, and concise way (usually 1-2 sentences). Be helpful and engaging. Do not use markdown.`;

      // Generate content using Gemini
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();
      
      // Add AI response to Firebase
      const aiMessageData = {
        text: aiText.trim(),
        username: 'AI Assistant',
        userId: 'ai_assistant_gemini',
        timestamp: Date.now(),
        isAi: true
      };

      const messagesRef = ref(database, 'messages');
      await push(messagesRef, aiMessageData);
      
    } catch (error) {
      console.error('AI response error:', error);
      // Optionally, send an error message to the chat
      const messagesRef = ref(database, 'messages');
      await push(messagesRef, {
        text: "I'm having a little trouble thinking right now. Please try again in a moment.",
        username: 'AI Assistant',
        userId: 'ai_assistant_gemini',
        timestamp: Date.now(),
        isAi: true
      });
    } finally {
      setIsAiThinking(false);
    }
  };


  // Leave chat function
  const leaveChat = async () => {
    try {
      if (userId && database) {
        const userRef = ref(database, `users/${userId}`);
        await set(userRef, null); // Using set(ref, null) is equivalent to remove()
      }
      
      // Clean up listeners
      if (messagesListener.current) messagesListener.current();
      if (usersListener.current) usersListener.current();
      
      setShowJoinPrompt(true);
      setIsConnected(false);
      setMessages([]);
      setOnlineUsers({});
      setUsername('');
      setUserId('');
      
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Show configuration prompt if Firebase not configured
  if (!servicesInitialized && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <MessageCircle className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Initializing Services...</h1>
            <p className="text-gray-600">Please wait while we connect to Firebase and Google AI.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Configuration Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // The rest of your UI code remains the same...
  if (showJoinPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <MessageCircle className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Join AI Chatboard</h1>
            <p className="text-gray-600">Enter your name to join the real-time chat</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && joinChat()}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={joinChat}
              disabled={!username.trim()}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Join Chat
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Real-time chat:</strong> All users will see your messages instantly and you'll see theirs!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">AI Chatboard</h1>
              <p className="text-sm text-gray-500">Real-time multi-user chat</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{Object.keys(onlineUsers).length} online</span>
            </div>
            <div className="bg-indigo-100 px-3 py-1 rounded-full text-sm font-medium text-indigo-700">
              {username}
            </div>
            <button
              onClick={leaveChat}
              className="text-gray-500 hover:text-red-500 transition-colors"
              title="Leave chat"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Online Users */}
      <div className="bg-white border-b px-6 py-2">
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-500">Online:</span>
          <div className="flex items-center space-x-2 flex-wrap">
            {Object.entries(onlineUsers).map(([id, user]) => (
              <span 
                key={id} 
                className={`px-2 py-1 rounded-full text-xs ${
                  id === userId 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.username}{id === userId ? ' (you)' : ''}
              </span>
            ))}
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center">
              <Bot className="w-3 h-3 mr-1" />
              AI Assistant
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Welcome to the real-time chat!</h3>
            <p className="text-gray-500">Start a conversation and others will see it instantly.</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className="flex justify-start">
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.isAi 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : message.userId === userId
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  : 'bg-white text-gray-800 border shadow-sm'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`text-xs font-medium ${
                  message.isAi ? 'text-green-600' : 
                  message.userId === userId ? 'text-indigo-600' : 'text-gray-600'
                }`}>
                  {message.isAi && <Bot className="w-3 h-3 inline mr-1" />}
                  {message.username}
                  {message.userId === userId && ' (you)'}
                </span>
                <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
              </div>
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        
        {isAiThinking && (
          <div className="flex justify-start">
            <div className="bg-green-100 text-green-800 border border-green-200 px-4 py-2 rounded-lg max-w-xs">
              <div className="flex items-center space-x-2">
                <Bot className="w-3 h-3" />
                <span className="text-xs font-medium text-green-600">AI Assistant</span>
              </div>
              <div className="flex space-x-1 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={sendMessage} className="flex space-x-3">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!currentMessage.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Real-time chat with AI assistant • {Object.keys(onlineUsers).length} users online
        </p>
      </div>
    </div>
  );
};

export default RealTimeAIChatboard;