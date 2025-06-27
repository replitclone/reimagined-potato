export interface Message {
  id: string;
  text: string;
  username: string;
  userId: string;
  timestamp: number;
  isAi: boolean;
}

export interface OnlineUser {
  userId: string;
  username: string;
  joinedAt: number;
  lastSeen: number;
}

export interface ChatState {
  messages: Message[];
  onlineUsers: Record<string, OnlineUser>;
  isConnected: boolean;
  isAiThinking: boolean;
}
