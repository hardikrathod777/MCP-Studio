'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Eye, EyeOff, Sparkles, ChevronRight } from 'lucide-react';
import type { LLMConfig, LLMProvider } from '@/app/types';

interface SetupScreenProps {
  llmConfig: LLMConfig;
  onChange: (config: LLMConfig) => void;
  onSave: () => void;
}

const PROVIDERS: { value: LLMProvider; label: string; url: string; model: string; placeholder: string }[] = [
  { value: 'anthropic', label: 'Anthropic (Claude)', url: 'https://api.anthropic.com/v1/messages',     model: 'claude-sonnet-4-20250514', placeholder: 'sk-ant-...' },
  { value: 'openai',    label: 'OpenAI (GPT)',       url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o-mini',              placeholder: 'sk-...'     },
  { value: 'custom',   label: 'Custom API',          url: '',                                           model: '',                         placeholder: 'your-api-key' },
];

export default function SetupScreen({ llmConfig, onChange, onSave }: SetupScreenProps) {
  const [showKey, setShowKey] = useState(false);

  const handleProvider = (provider: LLMProvider) => {
    const p = PROVIDERS.find(p => p.value === provider)!;
    onChange({ ...llmConfig, provider, apiUrl: p.url || llmConfig.apiUrl, model: p.model || llmConfig.model });
  };

  const currentProvider = PROVIDERS.find(p => p.value === llmConfig.provider)!;

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      {/* Animated ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: 'spring', bounce: 0.35 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 relative"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dim))',
              boxShadow: '0 0 40px var(--primary-glow), 0 0 80px rgba(139,92,246,0.1)',
            }}
          >
            <Brain className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">MCP Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Connect your LLM to get started
          </p>
        </div>

        {/* Card */}
        <div
          className="glass rounded-2xl p-8 space-y-5"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.08)' }}
        >
          {/* Provider */}
          <div>
            <label className="label-sm block mb-2">LLM Provider</label>
            <select
              value={llmConfig.provider}
              onChange={e => handleProvider(e.target.value as LLMProvider)}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              {PROVIDERS.map(p => (
                <option key={p.value} value={p.value} style={{ background: 'var(--bg-surface)' }}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* API URL */}
          <div>
            <label className="label-sm block mb-2">API URL</label>
            <input
              type="url"
              value={llmConfig.apiUrl}
              onChange={e => onChange({ ...llmConfig, apiUrl: e.target.value })}
              placeholder={currentProvider.url || 'https://your-api.com/v1/...'}
              className="input-field"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="label-sm block mb-2">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={llmConfig.apiKey}
                onChange={e => onChange({ ...llmConfig, apiKey: e.target.value })}
                placeholder={currentProvider.placeholder}
                className="input-field"
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="btn-icon absolute right-1 top-1/2 -translate-y-1/2"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="label-sm block mb-2">Model</label>
            <input
              type="text"
              value={llmConfig.model}
              onChange={e => onChange({ ...llmConfig, model: e.target.value })}
              placeholder={currentProvider.model || 'model-name'}
              className="input-field"
            />
          </div>

          {/* CTA */}
          <button
            onClick={onSave}
            disabled={!llmConfig.apiKey}
            className="btn-primary w-full py-3 mt-2"
          >
            <Sparkles className="w-4 h-4" />
            Launch Dashboard
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
          Your API key is stored locally — never sent anywhere except your configured endpoint.
        </p>
      </motion.div>
    </div>
  );
}
