import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'violet' | 'pink' | 'emerald' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'violet',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const gradientColors = {
    violet: 'from-violet-600 to-purple-500',
    pink: 'from-pink-600 to-rose-400',
    emerald: 'from-emerald-500 to-teal-400',
    amber: 'from-amber-500 to-yellow-400',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-semibold text-zinc-700">{label}</span>}
          {showPercentage && <span className="font-bold text-zinc-800">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-zinc-100 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full bg-gradient-to-r ${gradientColors[color]} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
