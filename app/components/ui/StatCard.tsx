'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  sub: string;
  gradient: string;
  delay?: number;
}

export default function StatCard({ icon: Icon, value, label, sub, gradient, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-xl p-5 surface-elevated card-hover-glow"
      style={{ background: `linear-gradient(135deg, ${gradient})` }}
    >
      {/* Subtle inner glow */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 10% 10%, white 0%, transparent 60%)' }}
      />
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 backdrop-blur-sm">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-3xl font-bold text-white tabular-nums">{value}</span>
      </div>
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="text-xs text-white/60 mt-0.5">{sub}</p>
    </motion.div>
  );
}
