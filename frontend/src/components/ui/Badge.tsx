import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'pending' | 'paid' | 'shipped';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-700/50 text-gray-300 border border-slate-600',
    success: 'bg-neon-green/20 text-neon-green border border-neon-green/30 shadow-glow',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    warning: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    info: 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30 shadow-glow-blue',
    pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    paid: 'bg-neon-green/20 text-neon-green border border-neon-green/30 shadow-glow',
    shipped: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
