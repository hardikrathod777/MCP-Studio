'use client';

import { motion } from 'framer-motion';
import { Activity, Cpu, Database, BarChart3, MessageSquare, Send, Bot, AlignLeft } from 'lucide-react';
import StatCard from '@/app/components/ui/StatCard';
import StatusBadge from '@/app/components/ui/StatusBadge';
import type { TokenUsage, MCPServer, Message } from '@/app/types';

interface AnalyticsTabProps {
  tokenUsage: TokenUsage;
  servers: MCPServer[];
  messages: Message[];
}

function ProgressBar({ value, color, label, pct }: { value: string; color: string; label: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="mono text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
          {value} <span style={{ color: 'var(--text-muted)' }}>({pct}%)</span>
        </span>
      </div>
      <div className="progress-bar-track">
        <motion.div
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

function ActivityRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg"
      style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}
    >
      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className="mono text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

export default function AnalyticsTab({ tokenUsage, servers, messages }: AnalyticsTabProps) {
  const { inputTokens, outputTokens, totalTokens, cost } = tokenUsage;

  const inputPct  = totalTokens > 0 ? Math.round((inputTokens  / totalTokens) * 100) : 0;
  const outputPct = totalTokens > 0 ? Math.round((outputTokens / totalTokens) * 100) : 0;

  const assistantMsgs = messages.filter(m => m.role === 'assistant');
  const userMsgs      = messages.filter(m => m.role === 'user');
  const avgLen        = assistantMsgs.length > 0
    ? Math.round(assistantMsgs.reduce((a, m) => a + m.content.length, 0) / assistantMsgs.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity}  value={totalTokens.toLocaleString()}  label="Total Tokens"   sub="All conversations"  gradient="#1e3a5f 0%, #1e1b4b 100%" delay={0}    />
        <StatCard icon={Cpu}       value={inputTokens.toLocaleString()}   label="Input Tokens"  sub="Prompts sent"       gradient="#064e3b 0%, #1e3a5f 100%" delay={0.07} />
        <StatCard icon={Database}  value={outputTokens.toLocaleString()}  label="Output Tokens" sub="Responses received" gradient="#3b0764 0%, #1e1b4b 100%" delay={0.14} />
        <StatCard icon={BarChart3} value={`$${(cost || 0).toFixed(4)}`}   label="Est. Cost"     sub="Based on pricing"   gradient="#78350f 0%, #3b0764 100%" delay={0.21} />
      </div>

      {/* Lower grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Token Distribution */}
        <div className="surface-elevated rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Token Distribution</span>
          </div>
          <ProgressBar
            label="Input Tokens"
            value={inputTokens.toLocaleString()}
            pct={inputPct}
            color="linear-gradient(90deg, var(--success), var(--accent))"
          />
          <ProgressBar
            label="Output Tokens"
            value={outputTokens.toLocaleString()}
            pct={outputPct}
            color="linear-gradient(90deg, var(--primary), var(--accent))"
          />

          {totalTokens === 0 && (
            <p className="text-xs text-center pt-4" style={{ color: 'var(--text-muted)' }}>
              No token data yet — start chatting to see usage
            </p>
          )}
        </div>

        {/* Server Status */}
        <div className="surface-elevated rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Server Status</span>
          </div>
          {servers.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No servers configured</p>
          ) : (
            <div className="space-y-2">
              {servers.map(server => (
                <div
                  key={server.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}
                >
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {server.name}
                  </span>
                  <StatusBadge status={server.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="surface-elevated rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Activity</span>
          </div>
          <ActivityRow label="Total Exchanges"       value={Math.ceil(messages.length / 2)} />
          <ActivityRow label="Messages Sent"         value={userMsgs.length} />
          <ActivityRow label="Responses Received"    value={assistantMsgs.length} />
          <ActivityRow label="Avg Response Length"   value={avgLen > 0 ? `${avgLen} chars` : '—'} />
          <ActivityRow label="Connected Servers"     value={servers.filter(s => s.status === 'connected').length} />
        </div>
      </div>
    </div>
  );
}
