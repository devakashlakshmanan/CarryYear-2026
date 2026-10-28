import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-zinc-700">
            {label}
          </label>
        )}
        <div className="relative rounded-xl">
          <select
            ref={ref}
            id={selectId}
            className={`appearance-none block w-full py-2.5 px-3.5 pr-10 bg-zinc-50/60 border ${
              error ? 'border-red-400 focus:ring-red-400' : 'border-zinc-200 focus:ring-violet-600'
            } rounded-xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-zinc-400">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
