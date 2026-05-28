import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-neon-blue to-neon-green text-white hover:shadow-glow hover:scale-105 shadow-lg',
    secondary: 'glass-dark text-gray-300 hover:bg-slate-700/50 border border-slate-700',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-glow-purple hover:scale-105 shadow-lg',
    outline: 'bg-transparent text-gray-300 border-2 border-slate-700 hover:border-neon-blue hover:text-neon-blue hover:shadow-glow-blue',
    ghost: 'bg-transparent text-gray-300 hover:bg-slate-800/50',
  };
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
