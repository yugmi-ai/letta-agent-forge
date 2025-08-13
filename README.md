# Yugmi Dashboard - AI Agent Management Platform

## Overview
Yugmi is a production-ready dashboard for managing and interacting with Letta AI agents. Built for both individual users and organizations, it provides comprehensive agent lifecycle management, real-time communication, and enterprise-grade security.

## Features

### 🔐 Authentication & Authorization
- Individual and Organization sign-up/login
- Role-based access control (Admin, Manager, User)
- JWT-based authentication
- Multi-tenant organization support

### 🤖 Agent Management
- Create, configure, and deploy Letta agents
- Real-time agent monitoring and analytics
- Memory block visualization and editing
- Tool integration and custom tool creation

### 💬 Communication
- Real-time chat with agents
- Message history and context preservation
- Multi-agent conversations
- Export conversation logs

### 🏢 Organization Features
- Team management and user roles
- Shared agent libraries
- Usage analytics and billing
- Audit logs and compliance

### 🔧 Integration
- Docker-based Letta server connection
- RESTful API integration
- WebSocket real-time updates
- Custom tool marketplace

## User Stories

### Individual Users
- **As an individual user**, I want to sign up and create my personal AI agents
- **As a developer**, I want to integrate custom tools with my agents
- **As a researcher**, I want to export conversation data for analysis

### Organizations
- **As an organization admin**, I want to manage team members and their access levels
- **As a team lead**, I want to create shared agents for my team
- **As a compliance officer**, I want to audit all agent interactions

## Architecture

```
Frontend (React/TypeScript) ↔ Backend API ↔ Letta Server (Docker)
                              ↕
                          Database (PostgreSQL)
```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (for production)

### Development Setup

1. Clone the repository
```bash
git clone <repository-url>
cd yugmi-dashboard
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start Letta server (Docker)
```bash
docker-compose up letta-server
```

5. Start development server
```bash
npm run dev
```

## Letta Server Integration

### Docker Configuration
The Letta server runs in a Docker container with the following setup:

```yaml
# docker-compose.yml
version: '3.8'
services:
  letta-server:
    image: letta/letta:latest
    ports:
      - "8283:8283"
    environment:
      - LETTA_SERVER_HOST=0.0.0.0
      - LETTA_SERVER_PORT=8283
    volumes:
      - letta_data:/app/data
```

### API Integration
- **Base URL**: `http://localhost:8283`
- **Authentication**: Bearer token
- **WebSocket**: `ws://localhost:8283/ws`

## Environment Variables

```env
# Frontend
VITE_API_URL=http://localhost:3001
VITE_LETTA_SERVER_URL=http://localhost:8283
VITE_WS_URL=ws://localhost:8283/ws

# Backend (if separate)
DATABASE_URL=postgresql://user:password@localhost:5432/yugmi
JWT_SECRET=your-jwt-secret
LETTA_SERVER_URL=http://localhost:8283
```

## Deployment

### Production Deployment
1. Build the application
```bash
npm run build
```

2. Deploy to your preferred platform (Vercel, Netlify, AWS, etc.)

3. Configure environment variables for production

### Docker Deployment
```bash
docker-compose up -d
```

## Contributing
Please read our contributing guidelines and code of conduct.

## License
MIT License - see LICENSE file for details.