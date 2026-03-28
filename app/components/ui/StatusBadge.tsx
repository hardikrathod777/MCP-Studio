'use client';

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { ServerStatus } from '@/app/types';

interface StatusBadgeProps {
  status: ServerStatus;
  showLabel?: boolean;
}

const config: Record<ServerStatus, { icon: React.ElementType; label: string; color: string }> = {
  connected:    { icon: CheckCircle, label: 'Connected',    color: 'var(--success)' },
  error:        { icon: XCircle,     label: 'Error',        color: 'var(--error)'   },
  disconnected: { icon: AlertCircle, label: 'Disconnected', color: 'var(--text-muted)' },
};

export default function StatusBadge({ status, showLabel = true }: StatusBadgeProps) {
  const { icon: Icon, label, color } = config[status];
  return (
    <span className="flex items-center gap-1.5" style={{ color }}>
      <span className={`status-dot ${status}`} />
      {showLabel && (
        <span className="text-xs font-semibold" style={{ color }}>
          {label}
        </span>
      )}
    </span>
  );
}
