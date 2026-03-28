'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Server, RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import StatusBadge from '@/app/components/ui/StatusBadge';
import EmptyState from '@/app/components/ui/EmptyState';
import type { MCPServer, MCPTool, ServerType } from '@/app/types';

interface ServersTabProps {
  servers: MCPServer[];
  tools: MCPTool[];
  onAdd: (server: Partial<MCPServer>) => void;
  onDelete: (id: string) => void;
  onTest: (server: MCPServer) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
};

export default function ServersTab({ servers, tools, onAdd, onDelete, onTest }: ServersTabProps) {
  const [form, setForm] = useState<Partial<MCPServer>>({ type: 'url', status: 'disconnected' });
  const [formOpen, setFormOpen] = useState(servers.length === 0);
  const [testing, setTesting] = useState<string | null>(null);

  const handleAdd = () => {
    if (!form.name || !form.url) return;
    onAdd(form);
    setForm({ type: 'url', status: 'disconnected' });
    setFormOpen(false);
  };

  const handleTest = async (server: MCPServer) => {
    setTesting(server.id);
    await onTest(server);
    setTesting(null);
  };

  return (
    <div className="space-y-6">
      {/* Add Server Card */}
      <div
        className="surface rounded-xl overflow-hidden"
        style={{ border: formOpen ? '1px solid var(--border-accent)' : undefined }}
      >
        <button
          onClick={() => setFormOpen(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold transition-colors hover:bg-white/[0.02]"
          style={{ color: formOpen ? 'var(--primary-bright)' : 'var(--text-secondary)' }}
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add MCP Server
          </span>
          {formOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {formOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}
            >
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-sm block mb-1.5">Server Name</label>
                    <input
                      className="input-field"
                      value={form.name || ''}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g., Gmail MCP"
                    />
                  </div>
                  <div>
                    <label className="label-sm block mb-1.5">Type</label>
                    <select
                      className="input-field"
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value as ServerType }))}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="url"   style={{ background: 'var(--bg-surface)' }}>URL (SSE)</option>
                      <option value="stdio" style={{ background: 'var(--bg-surface)' }}>STDIO</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-sm block mb-1.5">
                      {form.type === 'url' ? 'Server URL' : 'Command'}
                    </label>
                    <input
                      className="input-field mono"
                      value={form.url || ''}
                      onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                      placeholder={form.type === 'url' ? 'https://mcp.example.com/sse' : 'npx'}
                    />
                  </div>
                  {form.type === 'stdio' && (
                    <div className="md:col-span-2">
                      <label className="label-sm block mb-1.5">Arguments (comma-separated)</label>
                      <input
                        className="input-field mono"
                        value={form.args?.join(', ') || ''}
                        onChange={e =>
                          setForm(f => ({ ...f, args: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))
                        }
                        placeholder="-y, @modelcontextprotocol/server-example"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAdd}
                  disabled={!form.name || !form.url}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Server
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Servers Grid */}
      {servers.length === 0 ? (
        <EmptyState
          icon={Server}
          title="No MCP Servers Yet"
          description="Add your first MCP server using the form above"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {servers.map((server, i) => {
            const serverTools = tools.filter(t => t.serverId === server.id);
            const isTestingThis = testing === server.id;
            return (
              <motion.div
                key={server.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="surface-elevated rounded-xl p-5 card-hover-glow"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: server.status === 'connected'
                          ? 'var(--success-bg)'
                          : server.status === 'error'
                          ? 'var(--error-bg)'
                          : 'var(--bg-overlay)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <Server
                        className="w-5 h-5"
                        style={{
                          color: server.status === 'connected'
                            ? 'var(--success)'
                            : server.status === 'error'
                            ? 'var(--error)'
                            : 'var(--text-muted)',
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {server.name}
                      </p>
                      <span className="code-badge mt-0.5 inline-block">{server.type.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      className="btn-icon"
                      title="Test Connection"
                      onClick={() => handleTest(server)}
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isTestingThis ? 'animate-spin' : ''}`}
                        style={{ color: isTestingThis ? 'var(--primary-bright)' : undefined }}
                      />
                    </button>
                    <button
                      className="btn-icon danger"
                      title="Delete Server"
                      onClick={() => onDelete(server.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* URL */}
                <div
                  className="mono text-xs px-3 py-2 rounded-md mb-3 truncate"
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border)',
                    color: 'var(--accent)',
                  }}
                  title={server.url}
                >
                  {server.url}
                </div>

                {/* Status + tools */}
                <div className="flex items-center justify-between">
                  <StatusBadge status={server.status} />
                  {server.status === 'connected' && (
                    <span className="label-xs" style={{ color: 'var(--primary-bright)' }}>
                      {serverTools.length} tool{serverTools.length !== 1 ? 's' : ''} discovered
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
