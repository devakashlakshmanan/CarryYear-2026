import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  type?: 'spinner' | 'skeleton-card' | 'skeleton-table';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading decision data...',
  type = 'spinner',
  count = 3,
}) => {
  if (type === 'spinner') {
    return (
      <div className="py-16 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
        <span className="text-xs font-semibold text-zinc-500">{message}</span>
      </div>
    );
  }

  if (type === 'skeleton-card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white border border-zinc-200/80 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-200" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-zinc-200 rounded w-2/3" />
                <div className="h-3 bg-zinc-100 rounded w-1/3" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-3 bg-zinc-100 rounded w-full" />
              <div className="h-3 bg-zinc-100 rounded w-4/5" />
            </div>
            <div className="pt-4 border-t border-zinc-100 flex justify-between">
              <div className="h-8 bg-zinc-200 rounded-xl w-24" />
              <div className="h-8 bg-zinc-100 rounded-xl w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-zinc-200/80 p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-zinc-200 rounded w-1/4" />
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-10 bg-zinc-100 rounded-xl w-full" />
        ))}
      </div>
    </div>
  );
};
