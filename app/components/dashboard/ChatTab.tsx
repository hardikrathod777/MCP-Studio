'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageSquare, Send, Trash2, Terminal, Save, Wrench } from 'lucide-react';
import type { Message } from '@/app/types';

interface ChatTabProps {
  messages: Message[];
  userInput: string;
  systemPrompt: string;
  isLoading: boolean;
  onInputChange: (val: string) => void;
  onSend: () => void;
  onClear: () => void;
  onSystemPromptChange: (val: string) => void;
  onSavePrompt: () => void;
  connectedServers: number;
}

export default function ChatTab({
  messages, userInput, systemPrompt, isLoading,
  onInputChange, onSend, onClear, onSystemPromptChange, onSavePrompt,
  connectedServers,
}: ChatTabProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ height: 'calc(100vh - 200px)', minHeight: 500 }}>
      {/* ── Chat Area ──────────────────────────────────────────────── */}
      <div
        className="lg:col-span-2 surface-elevated rounded-xl flex flex-col overflow-hidden"
      >
        {/* Chat header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dim))', boxShadow: '0 0 12px var(--primary-glow)' }}
            >
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Chat Interface</p>
              <p className="label-xs" style={{ color: connectedServers > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                {connectedServers > 0 ? `${connectedServers} server${connectedServers > 1 ? 's' : ''} connected` : 'No servers connected'}
              </p>
            </div>
          </div>
          <button className="btn-icon danger" title="Clear Chat" onClick={onClear}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--bg-overlay)' }}
              >
                <Brain className="w-6 h-6" style={{ color: 'var(--primary-bright)' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Start a Conversation</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Your LLM will use connected MCP tools to help you
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: msg.role === 'assistant'
                        ? 'linear-gradient(135deg, var(--primary), var(--primary-dim))'
                        : 'var(--bg-overlay)',
                      boxShadow: msg.role === 'assistant' ? '0 0 10px var(--primary-glow)' : undefined,
                      border: msg.role === 'user' ? '1px solid var(--border-strong)' : undefined,
                    }}
                  >
                    {msg.role === 'assistant'
                      ? <Brain className="w-3.5 h-3.5 text-white" />
                      : <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>U</span>
                    }
                  </div>

                  {/* Bubble */}
                  <div
                    className="max-w-[75%] rounded-xl px-4 py-3"
                    style={
                      msg.role === 'user'
                        ? { background: 'linear-gradient(135deg, var(--primary), var(--primary-dim))', boxShadow: '0 0 16px var(--primary-glow)' }
                        : { background: 'var(--bg-overlay)', border: '1px solid var(--border)' }
                    }
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: msg.role === 'user' ? '#fff' : 'var(--text-primary)' }}>
                      {msg.content}
                    </p>

                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mt-3 pt-3 space-y-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="label-xs flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> Tools Used
                        </p>
                        {msg.toolCalls.map((tc, ti) => (
                          <span
                            key={ti}
                            className="mono inline-block text-xs px-2 py-0.5 rounded mr-1"
                            style={{ background: 'var(--primary-glow)', color: 'var(--primary-bright)', border: '1px solid var(--primary-border)' }}
                          >
                            {tc.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs mt-2 opacity-40">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Typing indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dim))', boxShadow: '0 0 10px var(--primary-glow)' }}
              >
                <Brain className="w-3.5 h-3.5 text-white animate-pulse" />
              </div>
              <div
                className="px-4 py-3 rounded-xl flex items-center gap-1.5"
                style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
              >
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={e => onInputChange(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message… (Enter to send)"
              disabled={isLoading}
              className="input-field flex-1"
            />
            <button
              onClick={onSend}
              disabled={!userInput.trim() || isLoading}
              className="btn-primary px-4"
              style={{ flexShrink: 0 }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── System Prompt Panel ─────────────────────────────────────── */}
      <div className="surface-elevated rounded-xl flex flex-col overflow-hidden">
        <div
          className="flex items-center gap-2 px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Terminal className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>System Prompt</span>
        </div>

        <textarea
          value={systemPrompt}
          onChange={e => onSystemPromptChange(e.target.value)}
          placeholder="Enter system prompt to guide LLM behaviour…"
          className="flex-1 px-5 py-4 mono text-xs resize-none outline-none"
          style={{
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: 'none',
            lineHeight: 1.7,
          }}
        />

        <div className="px-5 pb-4 flex-shrink-0">
          <button onClick={onSavePrompt} className="btn-ghost w-full justify-center gap-2">
            <Save className="w-3.5 h-3.5" />
            Save Prompt
          </button>
        </div>
      </div>
    </div>
  );
}
