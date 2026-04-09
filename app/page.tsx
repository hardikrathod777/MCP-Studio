'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import SetupScreen   from '@/app/components/dashboard/SetupScreen';
import Header        from '@/app/components/dashboard/Header';
import ServersTab    from '@/app/components/dashboard/ServersTab';
import ToolsTab      from '@/app/components/dashboard/ToolsTab';
import ChatTab       from '@/app/components/dashboard/ChatTab';
import AnalyticsTab  from '@/app/components/dashboard/AnalyticsTab';

import type {
  LLMConfig, MCPServer, MCPTool, Message, TokenUsage,
  ActiveTab, AppView, LLMProvider,
} from '@/app/types';
import { PROVIDER_LIST } from '@/app/components/ui/ProviderSelector';

/* ─── Helpers ──────────────────────────────────────────────────────── */
const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful AI assistant with access to MCP tools. Use the available tools to help the user accomplish their tasks. Always explain what tools you're using and why.";

const DEFAULT_LLM: LLMConfig = {
  provider: 'anthropic',
  apiUrl:   'https://api.anthropic.com/v1/messages',
  apiKey:   '',
  model:    'claude-sonnet-4-20250514',
};

function providerDefaults(provider: LLMProvider): Partial<LLMConfig> {
  const def = PROVIDER_LIST.find(p => p.value === provider);
  if (!def) return {};
  return { apiUrl: def.url, model: def.models[0]?.value ?? '' };
}

function calculateCost(usage: { input_tokens?: number; output_tokens?: number }) {
  const inp = (usage.input_tokens  ?? 0) / 1_000_000 * 3;
  const out = (usage.output_tokens ?? 0) / 1_000_000 * 15;
  return inp + out;
}

function normalizeServerConfig(partial: Partial<MCPServer>): MCPServer | null {
  if (!partial.name) return null;

  const type = partial.type ?? 'url';
  const command = type === 'stdio' ? (partial.command ?? partial.url ?? '').trim() : partial.command;
  const url = type === 'url' ? (partial.url ?? '').trim() : (partial.url ?? command ?? '').trim();

  if (type === 'url' && !url) return null;
  if (type === 'stdio' && !command) return null;

  return {
    id: Date.now().toString(),
    name: partial.name,
    url,
    type,
    status: 'disconnected',
    errorMessage: undefined,
    command,
    args: partial.args,
    env: partial.env,
  };
}

/* ─── Page ─────────────────────────────────────────────────────────── */
export default function MCPDashboard() {
  const [view,        setView]        = useState<AppView>('setup');
  const [activeTab,   setActiveTab]   = useState<ActiveTab>('servers');
  const [llmConfig,   setLLMConfig]   = useState<LLMConfig>(DEFAULT_LLM);
  const [servers,     setServers]     = useState<MCPServer[]>([]);
  const [tools,       setTools]       = useState<MCPTool[]>([]);
  const [selectedTools, setSelected]  = useState<string[]>([]);
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [userInput,   setUserInput]   = useState('');
  const [systemPrompt, setPrompt]     = useState(DEFAULT_SYSTEM_PROMPT);
  const [isLoading,   setIsLoading]   = useState(false);
  const [tokenUsage,  setTokenUsage]  = useState<TokenUsage>({
    inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0,
  });

  /* ── Hydrate from localStorage ─────────────────────────────────── */
  useEffect(() => {
    try {
      const cfg   = localStorage.getItem('llmConfig');
      const svrs  = localStorage.getItem('mcpServers');
      const msgs  = localStorage.getItem('chatMessages');
      const usage = localStorage.getItem('tokenUsage');
      const sys   = localStorage.getItem('systemPrompt');

      if (cfg)   { const c = JSON.parse(cfg); setLLMConfig(c); if (c.apiKey) setView('dashboard'); }
      if (svrs)  setServers(JSON.parse(svrs));
      if (msgs)  setMessages(JSON.parse(msgs));
      if (usage) setTokenUsage(JSON.parse(usage));
      if (sys)   setPrompt(sys);
    } catch { /* ignore */ }
  }, []);

  /* ── Server helpers ────────────────────────────────────────────── */
  const persistServers = (s: MCPServer[]) => {
    setServers(s);
    localStorage.setItem('mcpServers', JSON.stringify(s));
  };

  const handleAddServer = (partial: Partial<MCPServer>) => {
    const server = normalizeServerConfig(partial);
    if (!server) return;
    persistServers([...servers, server]);
  };

  const handleDeleteServer = (id: string) => {
    persistServers(servers.filter(s => s.id !== id));
    setTools(tools.filter(t => t.serverId !== id));
  };

  const updateServer = (id: string, updates: Partial<MCPServer>) =>
    persistServers(servers.map(s => (s.id === id ? { ...s, ...updates } : s)));

  const handleTestConnection = async (server: MCPServer) => {
    updateServer(server.id, { status: 'disconnected', errorMessage: undefined });
    try {
      const res = await fetch('/api/mcp/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(server),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to discover MCP tools');
      }

      const discoveredTools: MCPTool[] = Array.isArray(data?.tools) ? data.tools : [];
      setTools(prev => [...prev.filter(t => t.serverId !== server.id), ...discoveredTools]);
      updateServer(server.id, { status: 'connected', errorMessage: undefined });
    } catch (error) {
      updateServer(server.id, {
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Failed to discover MCP tools',
      });
    }
  };

  /* ── Chat ──────────────────────────────────────────────────────── */
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: userInput, timestamp: new Date() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setUserInput('');
    setIsLoading(true);

    try {
      const isAnthropic = llmConfig.provider === 'anthropic';
      const isOpenAI    = llmConfig.provider === 'openai';

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (isAnthropic) { headers['x-api-key'] = llmConfig.apiKey; headers['anthropic-version'] = '2023-06-01'; }
      else             { headers['Authorization'] = `Bearer ${llmConfig.apiKey}`; }

      const mcpConnected = servers
        .filter(s => s.status === 'connected')
        .map(s => (
          s.type === 'stdio'
            ? { type: s.type, name: s.name, command: s.command ?? s.url, ...(s.args && { args: s.args }), ...(s.env && { env: s.env }) }
            : { type: s.type, url: s.url, name: s.name, ...(s.env && { env: s.env }) }
        ));

      const apiMsgs = updated.map(m => ({ role: m.role, content: m.content }));

      const body = isAnthropic
        ? { model: llmConfig.model, max_tokens: 4096, system: systemPrompt, messages: apiMsgs, ...(mcpConnected.length > 0 && { mcp_servers: mcpConnected }) }
        : { model: llmConfig.model, messages: [{ role: 'system', content: systemPrompt }, ...apiMsgs] };

      const res = await fetch(llmConfig.apiUrl, { method: 'POST', headers, body: JSON.stringify(body) });

      if (!res.ok) {
        let detail = res.statusText;
        try { const j = await res.json(); detail = j?.error?.message ?? j?.message ?? detail; } catch { /* noop */ }
        throw new Error(`API Error ${res.status}: ${detail}`);
      }

      const data = await res.json();

      const content = isAnthropic
        ? data.content.filter((x: { type: string }) => x.type === 'text').map((x: { text: string }) => x.text).join('\n')
        : data.choices?.[0]?.message?.content ?? '';

      const toolCalls = isAnthropic
        ? data.content.filter((x: { type: string }) => x.type === 'mcp_tool_use' || x.type === 'tool_use')
        : data.choices?.[0]?.message?.tool_calls ?? [];

      const assistantMsg: Message = {
        role: 'assistant',
        content: content || 'I processed your request.',
        timestamp: new Date(),
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      };

      const final = [...updated, assistantMsg];
      setMessages(final);
      localStorage.setItem('chatMessages', JSON.stringify(final));

      if (data.usage) {
        const inp = data.usage.input_tokens ?? data.usage.prompt_tokens ?? 0;
        const out = data.usage.output_tokens ?? data.usage.completion_tokens ?? 0;
        const newUsage: TokenUsage = {
          inputTokens:  tokenUsage.inputTokens  + inp,
          outputTokens: tokenUsage.outputTokens + out,
          totalTokens:  tokenUsage.totalTokens  + inp + out,
          cost:         tokenUsage.cost + (isAnthropic ? calculateCost(data.usage) : 0),
        };
        setTokenUsage(newUsage);
        localStorage.setItem('tokenUsage', JSON.stringify(newUsage));
      }
    } catch (err) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to send message'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Config I/O ────────────────────────────────────────────────── */
  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ llmConfig: { ...llmConfig, apiKey: '***' }, servers, systemPrompt, tokenUsage }, null, 2)],
      { type: 'application/json' },
    );
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'mcp-dashboard-config.json' });
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const cfg = JSON.parse(ev.target?.result as string);
        if (cfg.servers)       persistServers(cfg.servers);
        if (cfg.systemPrompt)  { setPrompt(cfg.systemPrompt); localStorage.setItem('systemPrompt', cfg.systemPrompt); }
        if (cfg.tokenUsage)    setTokenUsage(cfg.tokenUsage);
      } catch { /* ignore bad json */ }
    };
    reader.readAsText(file);
  };

  const handleSaveLLM = () => {
    localStorage.setItem('llmConfig', JSON.stringify(llmConfig));
    setView('dashboard');
  };

  const handleSavePrompt = () => {
    localStorage.setItem('systemPrompt', systemPrompt);
  };

  const handleToolToggle = (name: string) =>
    setSelected(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);

  /* ── Render ────────────────────────────────────────────────────── */
  if (view === 'setup') {
    return (
      <SetupScreen
        llmConfig={llmConfig}
        onChange={config => {
          const defaults = providerDefaults(config.provider);
          setLLMConfig({ ...config, ...defaults, apiKey: config.apiKey });
        }}
        onSave={handleSaveLLM}
      />
    );
  }

  const connectedCount = servers.filter(s => s.status === 'connected').length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        llmConfig={llmConfig}
        onSettings={() => setView('setup')}
        onExport={handleExport}
        onImport={handleImport}
        connectedCount={connectedCount}
      />

      <main className="max-w-screen-xl mx-auto px-6 py-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'servers' && (
              <ServersTab
                servers={servers}
                tools={tools}
                onAdd={handleAddServer}
                onDelete={handleDeleteServer}
                onTest={handleTestConnection}
              />
            )}
            {activeTab === 'tools' && (
              <ToolsTab
                tools={tools}
                servers={servers}
                selectedTools={selectedTools}
                onToggle={handleToolToggle}
              />
            )}
            {activeTab === 'chat' && (
              <ChatTab
                messages={messages}
                userInput={userInput}
                systemPrompt={systemPrompt}
                isLoading={isLoading}
                onInputChange={setUserInput}
                onSend={handleSendMessage}
                onClear={() => { setMessages([]); localStorage.removeItem('chatMessages'); }}
                onSystemPromptChange={val => { setPrompt(val); localStorage.setItem('systemPrompt', val); }}
                onSavePrompt={handleSavePrompt}
                connectedServers={connectedCount}
              />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsTab
                tokenUsage={tokenUsage}
                servers={servers}
                messages={messages}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
