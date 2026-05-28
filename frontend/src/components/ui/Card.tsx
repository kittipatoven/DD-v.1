import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function Card({ children, className = '', hover = false, glow = false }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      className={`glass-dark rounded-2xl border border-slate-700/50 p-6 ${glow ? 'shadow-glow-blue' : 'shadow-xl'} ${className}`}
    >
      {children}
    </motion.div>
  );
}
