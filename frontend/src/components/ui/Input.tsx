import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  as?: 'input' | 'textarea';
  rows?: number;
}

export default function Input({
  label,
  error,
  icon,
  as = 'input',
  rows = 3,
  className = '',
  ...props
}: InputProps) {
  const baseInputClass = `w-full px-4 py-3 bg-slate-900 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${icon ? 'pl-10' : ''} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        {as === 'textarea' ? (
          <textarea
            rows={rows}
            className={baseInputClass}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            className={baseInputClass}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
