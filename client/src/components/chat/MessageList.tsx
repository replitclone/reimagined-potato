import { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  isAiThinking: boolean;
  currentUsername: string;
}

export default function MessageList({ messages, isAiThinking, currentUsername }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-blue-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-purple-600',
      'from-indigo-500 to-blue-600',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (username: string) => {
    return username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message) => (
        <div key={message.id} className="animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${
              message.isAi 
                ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
                : `bg-gradient-to-br ${getAvatarColor(message.username)}`
            }`}>
              {message.isAi ? (
                <Bot className="w-4 h-4" />
              ) : (
                getInitials(message.username)
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className={`font-medium ${message.isAi ? 'text-purple-700' : 'text-gray-800'}`}>
                  {message.username}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </span>
                {message.isAi && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                    AI
                  </span>
                )}
              </div>
              <div className={`rounded-lg shadow-sm border p-3 ${
                message.isAi 
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                  : 'bg-white border-gray-200'
              }`}>
                <p className="text-gray-800 whitespace-pre-wrap">{message.text}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* AI Thinking Indicator */}
      {isAiThinking && (
        <div className="animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-purple-700">AI Assistant</span>
                <span className="text-xs text-gray-500">typing...</span>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
