'use client';

import { motion } from 'framer-motion';
import { Zap, Code2 } from 'lucide-react';
import EmptyState from '@/app/components/ui/EmptyState';
import type { MCPTool, MCPServer } from '@/app/types';

interface ToolsTabProps {
  tools: MCPTool[];
  servers: MCPServer[];
  selectedTools: string[];
  onToggle: (name: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.3, ease: 'easeOut' },
  }),
};

export default function ToolsTab({ tools, servers, selectedTools, onToggle }: ToolsTabProps) {
  if (tools.length === 0) {
    return (
      <div className="surface rounded-xl py-4">
        <div className="flex items-center gap-2 px-6 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <Zap className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Available Tools
          </span>
        </div>
        <EmptyState
          icon={Zap}
          title="No Tools Available"
          description="Connect to MCP servers to discover available tools"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: 'var(--primary)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Available Tools
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'var(--primary-glow)', color: 'var(--primary-bright)' }}
          >
            {tools.length}
          </span>
        </div>
        {selectedTools.length > 0 && (
          <span className="label-xs" style={{ color: 'var(--accent)' }}>
            {selectedTools.length} selected
          </span>
        )}
      </div>

      {/* Tools bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, i) => {
          const server = servers.find(s => s.id === tool.serverId);
          const isSelected = selectedTools.includes(tool.name);
          return (
            <motion.div
              key={`${tool.serverId}-${tool.name}`}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              onClick={() => onToggle(tool.name)}
              className="surface-elevated rounded-xl p-4 cursor-pointer card-hover-glow select-none"
              style={{
                border: isSelected ? '1px solid var(--primary-border)' : undefined,
                boxShadow: isSelected ? '0 0 16px var(--primary-glow)' : undefined,
              }}
            >
              {/* Tool header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: isSelected ? 'var(--primary)' : 'var(--bg-overlay)' }}
                  >
                    <Code2 className="w-4 h-4" style={{ color: isSelected ? '#fff' : 'var(--text-muted)' }} />
                  </div>
                  <p
                    className="mono text-xs font-semibold leading-tight"
                    style={{ color: isSelected ? 'var(--primary-bright)' : 'var(--text-primary)' }}
                  >
                    {tool.name}
                  </p>
                </div>
                {/* Custom toggle */}
                <div
                  className="w-9 h-5 rounded-full flex-shrink-0 transition-colors"
                  style={{
                    background: isSelected ? 'var(--primary)' : 'var(--bg-overlay)',
                    border: '1px solid var(--border-strong)',
                    position: 'relative',
                  }}
                >
                  <motion.div
                    animate={{ x: isSelected ? 17 : 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{
                      position: 'absolute',
                      top: 2,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                  />
                </div>
              </div>

              <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {tool.description}
              </p>

              {server && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span className="status-dot connected" style={{ width: 5, height: 5 }} />
                  {server.name}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
