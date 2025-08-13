import {
  LettaApiClient,
  LettaAgent,
  LettaMessage,
  MemoryBlock,
  ChatSession,
  LettaTool,
  LettaServerStats,
  AgentCreateRequest,
  MessageSendRequest,
  LettaServerResponse,
  WebSocketMessage
} from '@/types/letta';

class LettaClient implements LettaApiClient {
  private baseUrl: string;
  private apiKey?: string;
  private timeout: number;
  private retryAttempts: number;
  private ws?: WebSocket;
  private wsListeners: Map<string, (data: any) => void> = new Map();

  constructor(config: {
    baseUrl: string;
    apiKey?: string;
    timeout?: number;
    retryAttempts?: number;
  }) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Add user token from localStorage
    const token = localStorage.getItem('yugmi_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    };

    let lastError: Error;

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data: LettaServerResponse<T> = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Request failed');
        }

        return data.data as T;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.retryAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError!;
  }

  // Agent Management
  async createAgent(request: AgentCreateRequest): Promise<LettaAgent> {
    return this.request<LettaAgent>('/agents', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAgent(agentId: string): Promise<LettaAgent> {
    return this.request<LettaAgent>(`/agents/${agentId}`);
  }

  async updateAgent(agentId: string, updates: Partial<LettaAgent>): Promise<LettaAgent> {
    return this.request<LettaAgent>(`/agents/${agentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteAgent(agentId: string): Promise<void> {
    await this.request<void>(`/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  async listAgents(userId?: string, organizationId?: string): Promise<LettaAgent[]> {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (organizationId) params.append('organization_id', organizationId);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<LettaAgent[]>(`/agents${query}`);
  }

  // Memory Management
  async getMemoryBlocks(agentId: string): Promise<MemoryBlock[]> {
    return this.request<MemoryBlock[]>(`/agents/${agentId}/memory`);
  }

  async updateMemoryBlock(
    agentId: string,
    blockId: string,
    updates: Partial<MemoryBlock>
  ): Promise<MemoryBlock> {
    return this.request<MemoryBlock>(`/agents/${agentId}/memory/${blockId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async createMemoryBlock(
    agentId: string,
    block: Omit<MemoryBlock, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MemoryBlock> {
    return this.request<MemoryBlock>(`/agents/${agentId}/memory`, {
      method: 'POST',
      body: JSON.stringify(block),
    });
  }

  async deleteMemoryBlock(agentId: string, blockId: string): Promise<void> {
    await this.request<void>(`/agents/${agentId}/memory/${blockId}`, {
      method: 'DELETE',
    });
  }

  // Chat Management
  async sendMessage(agentId: string, message: MessageSendRequest): Promise<LettaMessage> {
    return this.request<LettaMessage>(`/agents/${agentId}/messages`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async getMessages(
    agentId: string,
    sessionId?: string,
    limit?: number
  ): Promise<LettaMessage[]> {
    const params = new URLSearchParams();
    if (sessionId) params.append('session_id', sessionId);
    if (limit) params.append('limit', limit.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<LettaMessage[]>(`/agents/${agentId}/messages${query}`);
  }

  async createChatSession(agentId: string, title?: string): Promise<ChatSession> {
    return this.request<ChatSession>(`/agents/${agentId}/sessions`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  async getChatSessions(agentId: string): Promise<ChatSession[]> {
    return this.request<ChatSession[]>(`/agents/${agentId}/sessions`);
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    await this.request<void>(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Tools
  async getAvailableTools(): Promise<LettaTool[]> {
    return this.request<LettaTool[]>('/tools');
  }

  async createCustomTool(tool: LettaTool): Promise<LettaTool> {
    return this.request<LettaTool>('/tools', {
      method: 'POST',
      body: JSON.stringify(tool),
    });
  }

  // Server Stats
  async getServerStats(): Promise<LettaServerStats> {
    return this.request<LettaServerStats>('/stats');
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; timestamp: string }> {
    return this.request<{ status: 'healthy' | 'unhealthy'; timestamp: string }>('/health');
  }

  // WebSocket Management
  connect(sessionId?: string): WebSocket {
    const wsUrl = this.baseUrl.replace(/^http/, 'ws');
    const url = sessionId ? `${wsUrl}/ws?session_id=${sessionId}` : `${wsUrl}/ws`;
    
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      console.log('Connected to Letta server WebSocket');
      this.emit('connection', { status: 'connected' });
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.emit(message.type, message.data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    this.ws.onclose = () => {
      console.log('Disconnected from Letta server WebSocket');
      this.emit('connection', { status: 'disconnected' });
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', { error: 'WebSocket connection error' });
    };
    
    return this.ws;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }

  // Event handling
  on(event: string, callback: (data: any) => void): void {
    this.wsListeners.set(event, callback);
  }

  off(event: string): void {
    this.wsListeners.delete(event);
  }

  private emit(event: string, data: any): void {
    const callback = this.wsListeners.get(event);
    if (callback) {
      callback(data);
    }
  }

  // Send WebSocket message
  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }
}

// Create singleton instance
const lettaClient = new LettaClient({
  baseUrl: import.meta.env.VITE_LETTA_SERVER_URL || 'http://localhost:8283',
  timeout: 30000,
  retryAttempts: 3,
});

export default lettaClient;