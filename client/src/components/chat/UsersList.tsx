import { Bot } from 'lucide-react';
import { OnlineUser } from '@/types/chat';

interface UsersListProps {
  users: OnlineUser[];
}

export default function UsersList({ users }: UsersListProps) {
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
    <div className="flex-1 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Online Users</h3>
      
      <div className="space-y-2">
        {/* AI Assistant - Always shown */}
        <div key="ai-assistant" className="flex items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div className="flex-1 ml-3">
            <div className="font-medium text-gray-800">AI Assistant</div>
            <div className="text-xs text-purple-600 flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-1 animate-pulse"></div>
              Always available
            </div>
          </div>
        </div>

        {/* Online Users */}
        {users.map((user) => (
          <div key={user.userId} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className={`w-8 h-8 bg-gradient-to-br ${getAvatarColor(user.username)} rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3`}>
              {getInitials(user.username)}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{user.username}</div>
              <div className="text-xs text-green-600 flex items-center">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                Active now
              </div>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            No other users online
          </div>
        )}
      </div>
    </div>
  );
}
