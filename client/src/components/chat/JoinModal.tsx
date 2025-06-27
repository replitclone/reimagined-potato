import { useState } from 'react';
import { MessageCircle, Info } from 'lucide-react';

interface JoinModalProps {
  onJoin: (username: string) => void;
}

export default function JoinModal({ onJoin }: JoinModalProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin(username.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-slide-up">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Join AI Chatboard</h2>
          <p className="text-gray-600 mb-6">Enter your name to join the real-time chat</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              autoFocus
              required
            />
            
            <button
              type="submit"
              disabled={!username.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Chat
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center text-sm text-blue-700">
              <Info className="w-4 h-4 mr-2" />
              <span>Real-time chat with AI assistant powered by Google Gemini</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
