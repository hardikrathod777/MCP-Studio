'use client';

import { motion } from 'framer-motion';
import { Settings, Download, Upload, Server, Zap, MessageSquare, BarChart3 } from 'lucide-react';
import type { ActiveTab, LLMConfig } from '@/app/types';

/* ── Inline logo components — more reliable than SVGR imports ──── */
function LogoLong({ height = 30 }: { height?: number }) {
  const w = Math.round(height * (250 / 60));
  return (
    <svg width={w} height={height} viewBox="0 0 250 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      <rect x="5" y="10" width="40" height="40" rx="8" stroke="#8B5CF6" strokeWidth="3" fill="transparent" />
      <path d="M15 40V20L25 30L35 20V40" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="25" cy="40" r="3" fill="#8B5CF6" />
      <text x="60" y="43" fill="white" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="28">MCP</text>
      <text x="131" y="43" fill="#8B5CF6" fontFamily="Inter, sans-serif" fontWeight="400" fontSize="28">Studio</text>
    </svg>
  );
}

function LogoShort({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
      <rect width="32" height="32" rx="6" fill="#8B5CF6" />
      <path d="M8 22V10L16 18L24 10V22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="24" r="2" fill="white" />
    </svg>
  );
}

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
  { id: 'servers',   label: 'Servers',    icon: Server        },
  { id: 'tools',     label: 'Tools',      icon: Zap           },
  { id: 'chat',      label: 'Chat',       icon: MessageSquare },
  { id: 'analytics', label: 'Analytics',  icon: BarChart3     },
];

export default function Header({
  activeTab, onTabChange, llmConfig, onSettings, onExport, onImport, connectedCount,
}: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(8, 11, 20, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-screen-xl mx-auto px-6">
        {/* Top row */}
        <div className="flex items-center justify-between h-14">
          {/* Logo + meta */}
          <div className="flex items-center gap-4 min-w-0">
            {/* Full wordmark on sm+, icon only on mobile */}
            <div className="hidden sm:block">
              <LogoLong height={30} />
            </div>
            <div className="block sm:hidden">
              <LogoShort size={30} />
            </div>

            {/* Separator */}
            <div
              className="hidden sm:block h-5 w-px flex-shrink-0"
              style={{ background: 'var(--border-strong)' }}
            />

            {/* Provider / model / server chips */}
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              <span
                className="label-xs flex-shrink-0"
                style={{ letterSpacing: '0.07em', color: 'var(--text-secondary)' }}
              >
                {llmConfig.provider.toUpperCase()}
              </span>
              <span className="label-xs" style={{ color: 'var(--border-strong)' }}>·</span>
              <span
                className="label-xs truncate"
                style={{ color: 'var(--text-muted)', maxWidth: 160 }}
                title={llmConfig.model}
              >
                {llmConfig.model || 'no model'}
              </span>
              {connectedCount > 0 && (
                <>
                  <span className="label-xs" style={{ color: 'var(--border-strong)' }}>·</span>
                  <span className="status-dot connected flex-shrink-0" style={{ width: 6, height: 6 }} />
                  <span className="label-xs flex-shrink-0" style={{ color: 'var(--success)' }}>
                    {connectedCount} server{connectedCount > 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
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
