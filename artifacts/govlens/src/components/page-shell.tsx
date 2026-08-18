import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/navbar';
import { Breadcrumbs, type Crumb } from '@/components/breadcrumbs';
import { cn } from '@/lib/utils';

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <a href="#main-content" className="skip-link">
        {t('skipToContent')}
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className={cn('flex-1 outline-none', className)}>
        {children}
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  meta,
  actions,
  crumbs,
}: {
  title: string;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  crumbs?: Crumb[];
}) {
  return (
    <header className="mb-6">
      {crumbs && crumbs.length > 0 ? <Breadcrumbs items={crumbs} /> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-semibold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="measure mt-2 text-muted-foreground">
              {description}
            </p>
          )}
          {meta && (
            <p className="mt-2 text-xs text-muted-foreground font-mono leading-relaxed">
              {meta}
            </p>
          )}
        </div>
        {actions ? <div className="flex-shrink-0">{actions}</div> : null}
      </div>
    </header>
  );
}
