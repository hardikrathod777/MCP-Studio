'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, PenLine } from 'lucide-react';

interface ModelOption {
  value: string;
  label: string;
  badge?: string;
}

interface ModelSelectorProps {
  models:   ModelOption[];
  value:    string;
  onChange: (val: string) => void;
  color:    string;
}

const BADGE_COLORS: Record<string, string> = {
  Powerful:  '#8B5CF6',
  Balanced:  '#06B6D4',
  Fast:      '#10B981',
  Latest:    '#3B82F6',
  New:       '#F59E0B',
  Economy:   '#64748B',
  Reasoning: '#EC4899',
  'Large ctx': '#F97316',
  Instant:   '#10B981',
  Code:      '#6366F1',
  Open:      '#94A3B8',
  Best:      '#F59E0B',
  Safety:    '#EF4444',
  Classic:   '#64748B',
  Legacy:    '#475569',
  Meta:      '#4285F4',
  Mistral:   '#FF7000',
  Nous:      '#8B5CF6',
  Google:    '#4285F4',
  Microsoft: '#0078D4',
  Alibaba:   '#FF6900',
  DeepSeek:  '#06B6D4',
};

export default function ModelSelector({ models, value, onChange, color }: ModelSelectorProps) {
  const [open,       setOpen]       = useState(false);
  const [query,      setQuery]      = useState('');
  const [customMode, setCustomMode] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // If current value isn't in the list, switch to custom mode
  const isCustomValue = value && !models.some(m => m.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = models.filter(
    m => m.label.toLowerCase().includes(query.toLowerCase()) || m.value.toLowerCase().includes(query.toLowerCase()),
  );

  const currentModel = models.find(m => m.value === value);
  const displayLabel = currentModel?.label ?? value ?? 'Select a model';

  if (customMode || isCustomValue) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="e.g. my-custom-model-name"
          className="input-field flex-1"
          autoFocus
        />
        {models.length > 0 && (
          <button
            type="button"
            onClick={() => { setCustomMode(false); onChange(models[0].value); }}
            className="btn-ghost flex-shrink-0"
            title="Pick from list"
          >
            List
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: 'relative', zIndex: 40 }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="input-field text-left flex items-center gap-2.5"
        style={{ cursor: 'pointer', justifyContent: 'space-between' }}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate" style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {displayLabel}
          </span>
          {currentModel?.badge && (
            <span
              className="text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
              style={{
                background: (BADGE_COLORS[currentModel.badge] ?? color) + '22',
                color: BADGE_COLORS[currentModel.badge] ?? color,
                border: `1px solid ${(BADGE_COLORS[currentModel.badge] ?? color)}33`,
              }}
            >
              {currentModel.badge}
            </span>
          )}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.65)',
              overflow: 'hidden',
            }}
          >
            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2.5"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search models…"
                autoFocus
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)', caretColor: color }}
              />
            </div>

            {/* Model list */}
            <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No models found</p>
              ) : (
                filtered.map(m => {
                  const isActive = m.value === value;
                  const badgeColor = BADGE_COLORS[m.badge ?? ''] ?? color;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => { onChange(m.value); setOpen(false); setQuery(''); }}
                      className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors"
                      style={{
                        background: isActive ? color + '18' : 'transparent',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)'; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-medium truncate" style={{ color: isActive ? color : 'var(--text-primary)' }}>
                          {m.label}
                        </span>
                        {m.badge && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                            style={{ background: badgeColor + '20', color: badgeColor }}
                          >
                            {m.badge}
                          </span>
                        )}
                      </span>
                      {isActive && <Check className="w-3 h-3 flex-shrink-0" style={{ color }} />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Custom model option */}
            <button
              type="button"
              onClick={() => { setOpen(false); setCustomMode(true); onChange(''); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors"
              style={{
                borderTop: '1px solid var(--border)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
              <PenLine className="w-3.5 h-3.5" />
              Enter custom model name…
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
