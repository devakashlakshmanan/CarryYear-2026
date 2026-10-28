import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
}) => {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1.5 text-xs text-zinc-400 mb-2">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5" />}
              {crumb.path ? (
                <Link to={crumb.path} className="hover:text-violet-600 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-zinc-600 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-zinc-500 mt-1 max-w-2xl leading-relaxed">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center space-x-3 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
