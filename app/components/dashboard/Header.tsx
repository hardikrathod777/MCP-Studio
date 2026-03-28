'use client';

import { motion } from 'framer-motion';
import { Brain, Settings, Download, Upload, Server, Zap, MessageSquare, BarChart3 } from 'lucide-react';
import type { ActiveTab, LLMConfig } from '@/app/types';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  llmConfig: LLMConfig;
  onSettings: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  connectedCount: number;
}

const TABS: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
  { id: 'servers',   label: 'Servers',    icon: Server       },
  { id: 'tools',     label: 'Tools',      icon: Zap          },
  { id: 'chat',      label: 'Chat',       icon: MessageSquare },
  { id: 'analytics', label: 'Analytics',  icon: BarChart3    },
];

export default function Header({
  activeTab, onTabChange, llmConfig, onSettings, onExport, onImport, connectedCount,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(8, 11, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-6">
        {/* Top row */}
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dim))',
                boxShadow: '0 0 14px var(--primary-glow)',
              }}
            >
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold gradient-text">MCP Dashboard</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="label-xs" style={{ letterSpacing: '0.06em' }}>
                  {llmConfig.provider.toUpperCase()}
                </span>
                <span className="label-xs" style={{ color: 'var(--border-strong)' }}>·</span>
                <span className="label-xs text-ellipsis overflow-hidden max-w-[140px]" title={llmConfig.model}>
                  {llmConfig.model || 'no model'}
                </span>
                {connectedCount > 0 && (
                  <>
                    <span className="label-xs" style={{ color: 'var(--border-strong)' }}>·</span>
                    <span className="status-dot connected" style={{ width: 5, height: 5 }} />
                    <span className="label-xs" style={{ color: 'var(--success)' }}>
                      {connectedCount} server{connectedCount > 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button className="btn-icon" title="Settings" onClick={onSettings}>
              <Settings className="w-4 h-4" />
            </button>
            <button className="btn-icon" title="Export Config" onClick={onExport}>
              <Download className="w-4 h-4" />
            </button>
            <label className="btn-icon cursor-pointer" title="Import Config">
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={onImport} className="hidden" />
            </label>
          </div>
        </div>

        {/* Tabs row */}
        <div className="flex gap-0.5 -mb-px">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors"
                style={{ color: isActive ? 'var(--primary-bright)' : 'var(--text-muted)' }}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="tab-active-indicator"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
