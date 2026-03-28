export type ServerType = 'url' | 'stdio';
export type ServerStatus = 'connected' | 'disconnected' | 'error';
export type LLMProvider =
  | 'anthropic'
  | 'openai'
  | 'google'
  | 'groq'
  | 'mistral'
  | 'cohere'
  | 'together'
  | 'ollama'
  | 'custom';
export type MessageRole = 'user' | 'assistant';
export type ActiveTab = 'servers' | 'tools' | 'chat' | 'analytics';
export type AppView = 'setup' | 'dashboard';

export interface LLMConfig {
  provider: LLMProvider;
  apiUrl: string;
  apiKey: string;
  model: string;
}

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  type: ServerType;
  status: ServerStatus;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  serverId: string;
}

export interface ToolCall {
  name: string;
  type: string;
}

export interface Message {
  role: MessageRole;
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
}
