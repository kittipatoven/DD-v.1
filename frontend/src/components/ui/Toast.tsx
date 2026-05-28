'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type?: ToastType;
  message: string;
  duration?: number;
  onClose: () => void;
}

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-400" />,
  error: <AlertCircle className="w-5 h-5 text-red-400" />,
  info: <Info className="w-5 h-5 text-blue-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
};

const colors = {
  success: 'border-green-500/30 bg-green-500/10 shadow-green-500/20',
  error: 'border-red-500/30 bg-red-500/10 shadow-red-500/20',
  info: 'border-blue-500/30 bg-blue-500/10 shadow-blue-500/20',
  warning: 'border-yellow-500/30 bg-yellow-500/10 shadow-yellow-500/20',
};

const iconColors = {
  success: 'shadow-green-500/50',
  error: 'shadow-red-500/50',
  info: 'shadow-blue-500/50',
  warning: 'shadow-yellow-500/50',
};

export default function Toast({ type = 'info', message, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg shadow-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'info' ? 'blue' : 'yellow'}-500/20 ${colors[type]}`}
        >
          <div className={`p-1.5 rounded-lg bg-slate-800/50 ${iconColors[type]} shadow-sm`}>
            {icons[type]}
          </div>
          <span className="text-white text-sm font-medium">{message}</span>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-gray-400 hover:text-white transition-colors hover:scale-110 active:scale-95 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
