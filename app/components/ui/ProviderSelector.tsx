'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, Globe, Zap, Wind, Layers, Users, Monitor, Settings, Check, ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { LLMProvider } from '@/app/types';

export interface ProviderDef {
  value:       LLMProvider;
  label:       string;
  sublabel:    string;
  color:       string;
  icon:        LucideIcon;
  url:         string;
  placeholder: string;
  models:      { value: string; label: string; badge?: string }[];
  noKey?:      boolean;
}

export const PROVIDER_LIST: ProviderDef[] = [
  {
    value: 'anthropic', label: 'Anthropic', sublabel: 'Claude family',
    color: '#D97706', icon: Brain,
    url: 'https://api.anthropic.com/v1/messages', placeholder: 'sk-ant-...',
    models: [
      { value: 'claude-opus-4-5',            label: 'Claude Opus 4.5',            badge: 'Powerful' },
      { value: 'claude-sonnet-4-5',           label: 'Claude Sonnet 4.5',          badge: 'Balanced' },
      { value: 'claude-haiku-3-5',            label: 'Claude Haiku 3.5',           badge: 'Fast' },
      { value: 'claude-3-5-sonnet-20241022',  label: 'Claude 3.5 Sonnet',          badge: 'Latest' },
      { value: 'claude-3-5-haiku-20241022',   label: 'Claude 3.5 Haiku',           badge: 'Fast' },
      { value: 'claude-3-opus-20240229',      label: 'Claude 3 Opus',              badge: 'Legacy' },
      { value: 'claude-3-haiku-20240307',     label: 'Claude 3 Haiku',             badge: 'Legacy' },
    ],
  },
  {
    value: 'openai', label: 'OpenAI', sublabel: 'GPT & o-series',
    color: '#10B981', icon: Sparkles,
    url: 'https://api.openai.com/v1/chat/completions', placeholder: 'sk-...',
    models: [
      { value: 'gpt-4o',         label: 'GPT-4o',       badge: 'Latest' },
      { value: 'gpt-4o-mini',    label: 'GPT-4o Mini',  badge: 'Fast' },
      { value: 'gpt-4-turbo',    label: 'GPT-4 Turbo',  badge: 'Powerful' },
      { value: 'gpt-4',          label: 'GPT-4',        badge: 'Classic' },
      { value: 'gpt-3.5-turbo',  label: 'GPT-3.5 Turbo', badge: 'Economy' },
      { value: 'o1',             label: 'o1',           badge: 'Reasoning' },
      { value: 'o1-mini',        label: 'o1 Mini',      badge: 'Reasoning' },
      { value: 'o3-mini',        label: 'o3 Mini',      badge: 'New' },
    ],
  },
  {
    value: 'google', label: 'Google', sublabel: 'Gemini models',
    color: '#4285F4', icon: Globe,
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', placeholder: 'AIza...',
    models: [
      { value: 'gemini-2.0-flash-exp',       label: 'Gemini 2.0 Flash',    badge: 'New' },
      { value: 'gemini-2.0-pro-exp',         label: 'Gemini 2.0 Pro',      badge: 'New' },
      { value: 'gemini-1.5-pro-latest',      label: 'Gemini 1.5 Pro',      badge: 'Powerful' },
      { value: 'gemini-1.5-flash-latest',    label: 'Gemini 1.5 Flash',    badge: 'Fast' },
      { value: 'gemini-1.5-flash-8b-latest', label: 'Gemini 1.5 Flash 8B', badge: 'Economy' },
    ],
  },
  {
    value: 'groq', label: 'Groq', sublabel: 'Ultra-fast inference',
    color: '#F59E0B', icon: Zap,
    url: 'https://api.groq.com/openai/v1/chat/completions', placeholder: 'gsk_...',
    models: [
      { value: 'llama-3.3-70b-versatile',  label: 'Llama 3.3 70B',    badge: 'Best' },
      { value: 'llama-3.1-70b-versatile',  label: 'Llama 3.1 70B',    badge: 'Powerful' },
      { value: 'llama-3.1-8b-instant',     label: 'Llama 3.1 8B',     badge: 'Instant' },
      { value: 'mixtral-8x7b-32768',       label: 'Mixtral 8x7B',     badge: 'Large ctx' },
      { value: 'gemma2-9b-it',             label: 'Gemma 2 9B',       badge: 'Google' },
      { value: 'llama-guard-3-8b',         label: 'Llama Guard 3 8B', badge: 'Safety' },
    ],
  },
  {
    value: 'mistral', label: 'Mistral AI', sublabel: 'Mistral models',
    color: '#FF7000', icon: Wind,
    url: 'https://api.mistral.ai/v1/chat/completions', placeholder: 'your-key',
    models: [
      { value: 'mistral-large-latest',   label: 'Mistral Large',     badge: 'Best' },
      { value: 'mistral-medium-latest',  label: 'Mistral Medium',    badge: 'Balanced' },
      { value: 'mistral-small-latest',   label: 'Mistral Small',     badge: 'Fast' },
      { value: 'codestral-latest',       label: 'Codestral',         badge: 'Code' },
      { value: 'open-mixtral-8x22b',     label: 'Mixtral 8x22B',    badge: 'Open' },
      { value: 'open-mistral-nemo',      label: 'Mistral Nemo',      badge: 'Open' },
    ],
  },
  {
    value: 'cohere', label: 'Cohere', sublabel: 'Command models',
    color: '#8B5CF6', icon: Layers,
    url: 'https://api.cohere.ai/v1/chat', placeholder: 'your-cohere-key',
    models: [
      { value: 'command-r-plus-08-2024', label: 'Command R+ (Aug)',  badge: 'Latest' },
      { value: 'command-r-plus',         label: 'Command R+',        badge: 'Powerful' },
      { value: 'command-r',              label: 'Command R',         badge: 'Balanced' },
      { value: 'command',                label: 'Command',           badge: 'Classic' },
      { value: 'command-light',          label: 'Command Light',     badge: 'Fast' },
    ],
  },
  {
    value: 'together', label: 'Together AI', sublabel: 'Open-source models',
    color: '#06B6D4', icon: Users,
    url: 'https://api.together.xyz/v1/chat/completions', placeholder: 'your-together-key',
    models: [
      { value: 'meta-llama/Llama-3-70b-chat-hf',           label: 'Llama 3 70B',          badge: 'Meta' },
      { value: 'meta-llama/Llama-3-8b-chat-hf',            label: 'Llama 3 8B',           badge: 'Meta' },
      { value: 'mistralai/Mixtral-8x7B-Instruct-v0.1',     label: 'Mixtral 8x7B',        badge: 'Mistral' },
      { value: 'mistralai/Mistral-7B-Instruct-v0.3',       label: 'Mistral 7B',           badge: 'Mistral' },
      { value: 'NousResearch/Nous-Hermes-2-Yi-34B',        label: 'Nous Hermes 2 34B',   badge: 'Nous' },
      { value: 'Qwen/Qwen2.5-72B-Instruct-Turbo',         label: 'Qwen 2.5 72B',         badge: 'Alibaba' },
    ],
  },
  {
    value: 'ollama', label: 'Ollama', sublabel: 'Local inference',
    color: '#6366F1', icon: Monitor, noKey: true,
    url: 'http://localhost:11434/v1/chat/completions', placeholder: 'none required',
    models: [
      { value: 'llama3.2',        label: 'Llama 3.2',     badge: 'Meta' },
      { value: 'llama3.1',        label: 'Llama 3.1',     badge: 'Meta' },
      { value: 'mistral',         label: 'Mistral 7B',    badge: 'Mistral' },
      { value: 'codellama',       label: 'Code Llama',    badge: 'Code' },
      { value: 'phi3',            label: 'Phi-3',         badge: 'Microsoft' },
      { value: 'gemma2',          label: 'Gemma 2',       badge: 'Google' },
      { value: 'qwen2.5',         label: 'Qwen 2.5',      badge: 'Alibaba' },
      { value: 'deepseek-r1',     label: 'DeepSeek R1',   badge: 'DeepSeek' },
    ],
  },
  {
    value: 'custom', label: 'Custom API', sublabel: 'OpenAI-compatible',
    color: '#64748B', icon: Settings,
    url: '', placeholder: 'your-api-key',
    models: [],
  },
];

/* ─────────────────────────────────────────────── */

interface ProviderSelectorProps {
  value: LLMProvider;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (provider: ProviderDef) => void;
}

export default function ProviderSelector({ value, open, onToggle, onClose, onSelect }: ProviderSelectorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const current = PROVIDER_LIST.find(p => p.value === value)!;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 50 }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={onToggle}
        className="input-field text-left flex items-center gap-3"
        style={{ cursor: 'pointer', justifyContent: 'space-between' }}
      >
        <span className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: current.color + '22', border: `1px solid ${current.color}44` }}
          >
            <current.icon className="w-3.5 h-3.5" style={{ color: current.color }} />
          </span>
          <span>
            <span className="text-sm font-semibold block" style={{ color: 'var(--text-primary)' }}>
              {current.label}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{current.sublabel}</span>
          </span>
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 1px rgba(255,255,255,0.06)',
              padding: '0.5rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.375rem',
              maxHeight: '60vh',
              overflowY: 'auto',
            }}
          >
            {PROVIDER_LIST.map(p => {
              const isSelected = p.value === value;
              const Icon = p.icon;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => { onSelect(p); onClose(); }}
                  className="flex items-center gap-2.5 text-left rounded-lg px-3 py-2.5 transition-colors"
                  style={{
                    background: isSelected ? p.color + '18' : 'transparent',
                    border: `1px solid ${isSelected ? p.color + '55' : 'transparent'}`,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)'; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: p.color + '22', border: `1px solid ${p.color}33` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: p.color }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-xs font-semibold block truncate" style={{ color: isSelected ? p.color : 'var(--text-primary)' }}>
                      {p.label}
                    </span>
                    <span className="text-xs truncate block" style={{ color: 'var(--text-muted)' }}>
                      {p.sublabel}
                    </span>
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: p.color }} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
