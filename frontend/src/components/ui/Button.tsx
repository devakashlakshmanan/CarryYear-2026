import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'header-outline' | 'header-solid';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/20 focus:ring-violet-500',
    secondary: 'bg-violet-100 hover:bg-violet-200 text-violet-800 focus:ring-violet-400',
    accent: 'bg-pink-600 hover:bg-pink-700 text-white shadow-sm shadow-pink-500/20 focus:ring-pink-500',
    outline: 'border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 shadow-sm focus:ring-violet-500',
    ghost: 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 focus:ring-zinc-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/20 focus:ring-red-500',
    'header-outline': 'border border-white/30 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white shadow-xs focus:ring-white/50 focus:ring-offset-violet-900',
    'header-solid': 'bg-white hover:bg-violet-50 active:bg-violet-100 text-violet-950 font-semibold shadow-sm focus:ring-white focus:ring-offset-violet-900',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
