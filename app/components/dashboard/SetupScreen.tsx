'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Eye, EyeOff, Sparkles, ChevronRight, KeyRound, Link2, Cpu } from 'lucide-react';
import ProviderSelector, { PROVIDER_LIST } from '@/app/components/ui/ProviderSelector';
import ModelSelector from '@/app/components/ui/ModelSelector';
import type { LLMConfig } from '@/app/types';

interface SetupScreenProps {
  llmConfig: LLMConfig;
  onChange:  (config: LLMConfig) => void;
  onSave:    () => void;
}

export default function SetupScreen({ llmConfig, onChange, onSave }: SetupScreenProps) {
  const [showKey,       setShowKey]       = useState(false);
  const [providerOpen,  setProviderOpen]  = useState(false);

  const currentDef = PROVIDER_LIST.find(p => p.value === llmConfig.provider) ?? PROVIDER_LIST[0];

  const handleProviderSelect = (def: typeof PROVIDER_LIST[number]) => {
    onChange({
      ...llmConfig,
      provider: def.value,
      apiUrl:   def.url,
      model:    def.models[0]?.value ?? '',
    });
  };

  const isOllama = llmConfig.provider === 'ollama';

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4 py-12">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.15, 0.32, 0.15] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.13) 0%, transparent 65%)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Hero */}
        <div className="text-center mb-9">
          <motion.div
            initial={{ scale: 0.65, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.08, type: 'spring', bounce: 0.38 }}
            className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-2xl mb-5"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dim))',
              boxShadow: '0 0 40px var(--primary-glow), 0 0 80px rgba(139,92,246,0.08)',
            }}
          >
            <Brain className="w-9 h-9 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text mb-1.5">MCP Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Connect your LLM — then add MCP servers and start chatting
          </p>
        </div>

        {/* Glass card */}
        <div
          className="glass rounded-2xl overflow-visible"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)' }}
        >
          {/* Coloured top bar */}
          <div
            className="h-1 w-full rounded-t-2xl"
            style={{ background: `linear-gradient(90deg, ${currentDef.color}, var(--accent))` }}
          />

          <div className="p-7 space-y-5">
            {/* ── Provider ── */}
            <div>
              <label className="label-sm flex items-center gap-1.5 mb-2">
                <Cpu className="w-3 h-3" /> LLM Provider
              </label>
              <ProviderSelector
                value={llmConfig.provider}
                open={providerOpen}
                onToggle={() => setProviderOpen(v => !v)}
                onClose={() => setProviderOpen(false)}
                onSelect={handleProviderSelect}
              />
            </div>

            {/* ── API URL ── */}
            <div>
              <label className="label-sm flex items-center gap-1.5 mb-2">
                <Link2 className="w-3 h-3" /> API URL
              </label>
              <input
                type="url"
                value={llmConfig.apiUrl}
                onChange={e => onChange({ ...llmConfig, apiUrl: e.target.value })}
                placeholder={currentDef.url || 'https://your-api.example.com/v1/...'}
                className="input-field mono text-xs"
                style={{ color: 'var(--accent)' }}
              />
            </div>

            {/* ── API Key ── */}
            <div>
              <label className="label-sm flex items-center gap-1.5 mb-2">
                <KeyRound className="w-3 h-3" /> API Key
                {isOllama && (
                  <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                    not required
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={llmConfig.apiKey}
                  onChange={e => onChange({ ...llmConfig, apiKey: e.target.value })}
                  placeholder={isOllama ? 'Leave blank for local Ollama' : currentDef.placeholder}
                  className="input-field"
                  style={{ paddingRight: '2.75rem' }}
                  disabled={isOllama}
                />
                {!isOllama && (
                  <button
                    type="button"
                    onClick={() => setShowKey(v => !v)}
                    className="btn-icon absolute right-1 top-1/2 -translate-y-1/2"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>

            {/* ── Model ── */}
            <div>
              <label className="label-sm flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3 h-3" /> Model
              </label>
              <ModelSelector
                models={currentDef.models}
                value={llmConfig.model}
                onChange={model => onChange({ ...llmConfig, model })}
                color={currentDef.color}
              />
            </div>

            {/* ── Divider ── */}
            <div style={{ height: 1, background: 'var(--border)' }} />

            {/* ── CTA ── */}
            <button
              onClick={onSave}
              disabled={!isOllama && !llmConfig.apiKey}
              className="btn-primary w-full py-3.5 text-sm"
              style={{
                background: `linear-gradient(135deg, ${currentDef.color}, var(--primary-dim))`,
                boxShadow: `0 0 20px ${currentDef.color}44`,
                borderColor: currentDef.color + '55',
              }}
            >
              <Sparkles className="w-4 h-4" />
              Launch Dashboard
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
          Your API key is stored locally in your browser — never sent anywhere except your configured endpoint.
        </p>
      </motion.div>
    </div>
  );
}
