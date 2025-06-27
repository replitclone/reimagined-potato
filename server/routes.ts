import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to get configuration and API keys
  app.get('/api/config', (req, res) => {
    res.json({
      geminiApiKey: process.env.GEMINI_API_KEY,
      geminiAvailable: !!process.env.GEMINI_API_KEY,
      firebaseConfigured: !!(process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY)
    });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      services: {
        firebase: !!(process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY),
        gemini: !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
