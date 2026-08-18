import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function LoadingState({
  className,
  label,
}: {
  className?: string;
  label?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className={cn('animate-pulse space-y-4', className)} role="status" aria-live="polite">
      <span className="sr-only">{label ?? t('loading')}</span>
      <div className="h-8 bg-muted rounded w-1/3" />
      <div className="h-4 bg-muted rounded w-2/3" />
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="h-16 bg-muted rounded" />
        <div className="h-16 bg-muted rounded" />
        <div className="h-16 bg-muted rounded" />
      </div>
      <div className="h-48 bg-muted rounded" />
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  icon: Icon = Inbox,
  className,
  action,
}: {
  title: string;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn('text-center py-10 px-4', className)}>
      <Icon className="w-8 h-8 mx-auto mb-3 text-meta" aria-hidden />
      <p className="type-subhead">{title}</p>
      {hint && <p className="type-meta mt-1 max-w-sm mx-auto">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
