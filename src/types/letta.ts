// Letta Server Integration Types

export interface LettaServerConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retryAttempts: number;
}

export interface LettaAgent {
  id: string;
  name: string;
  description?: string;
  model: string;
  embedding_model: string;
  memory_blocks: MemoryBlock[];
  tools: string[];
  system_prompt?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  organization_id?: string;
  status: AgentStatus;
  metadata: Record<string, any>;
}

export interface MemoryBlock {
  id: string;
  label: string;
  value: string;
  description?: string;
  template: boolean;
  created_at: string;
  updated_at: string;
}

export interface LettaMessage {
  id: string;
  agent_id: string;
  user_id: string;
  role: MessageRole;
  content?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface LettaTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool'
}

export enum AgentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TRAINING = 'training',
  ERROR = 'error'
}

export interface ChatSession {
  id: string;
  agent_id: string;
  user_id: string;
  title: string;
  messages: LettaMessage[];
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface LettaServerResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AgentCreateRequest {
  name: string;
  description?: string;
  model: string;
  embedding_model: string;
  memory_blocks: Omit<MemoryBlock, 'id' | 'created_at' | 'updated_at'>[];
  tools: string[];
  system_prompt?: string;
  metadata?: Record<string, any>;
}

export interface MessageSendRequest {
  content: string;
  role: MessageRole;
  metadata?: Record<string, any>;
}

export interface WebSocketMessage {
  type: 'message' | 'agent_update' | 'error' | 'connection' | 'heartbeat';
  data: any;
  timestamp: string;
  session_id?: string;
}

export interface LettaServerStats {
  total_agents: number;
  active_agents: number;
  total_messages: number;
  total_users: number;
  server_uptime: number;
  memory_usage: number;
  cpu_usage: number;
}

// API Client Interface
export interface LettaApiClient {
  // Agent Management
  createAgent(request: AgentCreateRequest): Promise<LettaAgent>;
  getAgent(agentId: string): Promise<LettaAgent>;
  updateAgent(agentId: string, updates: Partial<LettaAgent>): Promise<LettaAgent>;
  deleteAgent(agentId: string): Promise<void>;
  listAgents(userId?: string, organizationId?: string): Promise<LettaAgent[]>;

  // Memory Management
  getMemoryBlocks(agentId: string): Promise<MemoryBlock[]>;
  updateMemoryBlock(agentId: string, blockId: string, updates: Partial<MemoryBlock>): Promise<MemoryBlock>;
  createMemoryBlock(agentId: string, block: Omit<MemoryBlock, 'id' | 'created_at' | 'updated_at'>): Promise<MemoryBlock>;
  deleteMemoryBlock(agentId: string, blockId: string): Promise<void>;

  // Chat Management
  sendMessage(agentId: string, message: MessageSendRequest): Promise<LettaMessage>;
  getMessages(agentId: string, sessionId?: string, limit?: number): Promise<LettaMessage[]>;
  createChatSession(agentId: string, title?: string): Promise<ChatSession>;
  getChatSessions(agentId: string): Promise<ChatSession[]>;
  deleteChatSession(sessionId: string): Promise<void>;

  // Tools
  getAvailableTools(): Promise<LettaTool[]>;
  createCustomTool(tool: LettaTool): Promise<LettaTool>;

  // Server Stats
  getServerStats(): Promise<LettaServerStats>;
  healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; timestamp: string }>;

  // WebSocket
  connect(sessionId?: string): WebSocket;
  disconnect(): void;
}