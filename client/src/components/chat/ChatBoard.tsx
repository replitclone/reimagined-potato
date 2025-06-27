import { useState, useEffect } from 'react';
import { Wifi, WifiOff, LogOut, Settings } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UsersList from './UsersList';
import { useChat } from '@/hooks/useChat';
import { useToast } from '@/hooks/use-toast';

interface ChatBoardProps {
  username: string;
  userId: string;
}

export default function ChatBoard({ username, userId }: ChatBoardProps) {
  const {
    messages,
    onlineUsers,
    isConnected,
    isAiThinking,
    sendMessage,
    leaveChat,
    setupListeners,
    addUserToOnline
  } = useChat(userId, username);
  
  const [showSetup, setShowSetup] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initChat = async () => {
      try {
        await addUserToOnline();
        setupListeners();
      } catch (error) {
        console.error('Error joining chat:', error);
        toast({
          title: "Connection Error",
          description: "Failed to join chat. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    initChat();
  }, [addUserToOnline, setupListeners, toast]);

  const handleSendMessage = async (text: string) => {
    try {
      await sendMessage(text);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Send Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLeaveChat = async () => {
    try {
      await leaveChat();
      window.location.reload();
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  };

  const onlineUsersList = Object.values(onlineUsers);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Sidebar - Users List */}
      <div className="w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">💬</span>
              </div>
              AI Chatboard
            </h1>
            <button 
              onClick={() => setShowSetup(true)}
              className="text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span>{onlineUsersList.length} users online</span>
          </div>
        </div>

        {/* Users List */}
        <UsersList users={onlineUsersList} />

        {/* Connection Status */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center text-sm mb-3">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-green-600 font-medium">Connected to Firebase</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500 mr-2" />
                <span className="text-red-600 font-medium">Disconnected</span>
              </>
            )}
          </div>
          <button 
            onClick={handleLeaveChat}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave Chat
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">General Chat</h2>
              <p className="text-sm text-gray-600">Real-time chat with AI assistance</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-500">
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-500 mr-2" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-500 mr-2" />
                    Disconnected
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <MessageList 
          messages={messages} 
          isAiThinking={isAiThinking} 
          currentUsername={username}
        />

        {/* Message Input */}
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
