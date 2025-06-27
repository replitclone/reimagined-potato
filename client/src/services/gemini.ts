import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '@/types/chat';

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

export const initializeGemini = (): boolean => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_GOOGLE_AI_API_KEY') {
    console.warn('Gemini API key not configured. AI features will be disabled.');
    return false;
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    console.log('Gemini AI initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
    return false;
  }
};

export const shouldAiRespond = (message: string): boolean => {
  if (!model) return false;
  
  const triggers = [
    /\?$/,
    /^(what|how|when|where|why|who|can|could|would|should|is|are|do|does)/i,
    /\b(help|explain|wondering|curious|advice|opinion|think|know|ai|bot|assistant|gemini)\b/i
  ];
  
  return triggers.some(trigger => trigger.test(message)) || Math.random() < 0.15;
};

export const generateAiResponse = async (
  triggerMessage: string, 
  triggerUser: string, 
  recentMessages: Message[],
  onlineUsers: string[]
): Promise<string> => {
  if (!model) {
    throw new Error('Gemini model not initialized');
  }

  try {
    const onlineUsersList = onlineUsers.join(', ');
    const messageHistory = recentMessages.slice(-10).map(msg => `${msg.username}: ${msg.text}`).join('\n');
    
    const prompt = `You are a friendly and helpful AI assistant named Gemini in a group chat. The current users are: ${onlineUsersList}.

Here is the recent conversation history:
${messageHistory}

The latest message is from ${triggerUser}: "${triggerMessage}"

Your task is to respond to the latest message in a natural, conversational, and concise way (usually 1-2 sentences). Be helpful and engaging. Do not use markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error) {
    console.error('AI response generation failed:', error);
    throw error;
  }
};

export const isGeminiAvailable = (): boolean => {
  return model !== null;
};
