import { useState, useEffect } from 'react';
import ChatBoard from '@/components/chat/ChatBoard';
import JoinModal from '@/components/chat/JoinModal';
import { initializeFirebase } from '@/services/firebase';
import { useToast } from '@/hooks/use-toast';

export default function Chat() {
  const [showJoinModal, setShowJoinModal] = useState(true);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [servicesInitialized, setServicesInitialized] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const init = async () => {
      try {
        await initializeFirebase();
        setServicesInitialized(true);
      } catch (error) {
        console.error('Failed to initialize services:', error);
        setError('Failed to initialize services. Please check your configuration.');
        toast({
          title: "Initialization Error",
          description: "Failed to connect to Firebase. Please refresh and try again.",
          variant: "destructive",
        });
      }
    };
    init();
  }, [toast]);

  const handleJoinChat = (name: string) => {
    const newUserId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    setUsername(name);
    setUserId(newUserId);
    setShowJoinModal(false);
  };

  if (!servicesInitialized && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Initializing Services...</h1>
            <p className="text-gray-600">Please wait while we connect to Firebase and Google AI.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 mb-4 text-4xl">⚠️</div>
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

  if (showJoinModal) {
    return <JoinModal onJoin={handleJoinChat} />;
  }

  return <ChatBoard username={username} userId={userId} />;
}
