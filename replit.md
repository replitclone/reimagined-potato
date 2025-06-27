# Multi-User AI Chat Application

## Overview

This is a real-time multi-user chat application built with React frontend and Express backend. The application features AI integration through Google's Gemini API and real-time messaging capabilities via Firebase Realtime Database. Users can join chat rooms, send messages, and interact with an AI assistant that responds intelligently to conversations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React hooks with custom chat hook (useChat)
- **UI Library**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for server bundling

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured via Drizzle but not actively used in current implementation)
- **Real-time Data**: Firebase Realtime Database for chat messages and user presence
- **In-Memory Storage**: MemStorage class for user management (fallback/development)

### Authentication and Authorization
- **Current Implementation**: Simple username-based identification without authentication
- **User Management**: In-memory storage with auto-generated user IDs
- **Session Handling**: Basic user session management via unique user IDs

### External Service Integrations
- **Firebase Realtime Database**: Real-time message synchronization and user presence
- **Google Gemini AI**: AI assistant for intelligent chat responses
- **Environment Configuration**: Supports both client and server-side environment variables

## Key Components

### Chat System
- **Real-time Messaging**: Firebase Realtime Database for instant message delivery
- **User Presence**: Online/offline status tracking with automatic cleanup
- **AI Integration**: Smart AI responses triggered by questions or conversation patterns
- **Message History**: Persistent chat history stored in Firebase

### AI Assistant
- **Model**: Google Gemini 2.5 Flash
- **Trigger Logic**: Responds to questions, keywords, or randomly (15% chance)
- **Context Awareness**: Uses recent message history and online user context
- **Fallback Handling**: Graceful degradation when AI services are unavailable

### User Interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Comprehensive UI components from Radix UI
- **Real-time Updates**: Live chat interface with typing indicators
- **User Management**: Join modal, online users list, connection status

## Data Flow

1. **User Joins**: User enters username → generates unique ID → joins Firebase presence system
2. **Message Sending**: User types message → sends to Firebase → broadcasts to all connected users
3. **AI Processing**: Message triggers → Gemini API processes → AI response sent to Firebase
4. **Real-time Updates**: Firebase listeners → React state updates → UI re-renders
5. **User Leaves**: Disconnect handling → Firebase cleanup → presence updates

## External Dependencies

### Required Services
- **Firebase**: Realtime Database for chat functionality
- **Google AI**: Gemini API for AI assistant features
- **PostgreSQL**: Database (configured but not actively used)

### Development Tools
- **Replit**: Development environment with auto-configuration
- **Vite**: Frontend build tool with HMR
- **Drizzle Kit**: Database migrations and schema management
- **TypeScript**: Type safety across frontend and backend

### Production Dependencies
- **Express**: Web server framework
- **React Query**: Data fetching and state management
- **Wouter**: Lightweight routing solution
- **Various UI Libraries**: Radix UI primitives and utility packages

## Deployment Strategy

### Development
- **Environment**: Replit with Node.js 20, PostgreSQL 16
- **Hot Reload**: Vite dev server with Express backend
- **Port Configuration**: Backend on 5000, frontend proxied

### Production Build
- **Frontend**: Vite build to dist/public directory
- **Backend**: esbuild bundling to dist/index.js
- **Static Serving**: Express serves built frontend assets
- **Environment**: Production mode with optimized builds

### Configuration
- **Environment Variables**: Support for Firebase and Gemini API keys
- **Database**: Drizzle with PostgreSQL connection string
- **Auto-scaling**: Configured for Replit autoscale deployment

## Changelog
```
Changelog:
- June 27, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```