import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function usePagination<T>(items: T[], pageSize: number, resetKey?: string) {
  const [page, setPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  useEffect(() => {
    setPage(1);
  }, [resetKey, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const slice = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return { page, setPage, totalPages, slice, total, from, to };
}

function pageWindow(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const set = new Set<number>();
  set.add(1);
  set.add(total);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) set.add(i);
  }
  const sorted = Array.from(set).sort((a, b) => a - b);
  const out: (number | 'ellipsis')[] = [];
  sorted.forEach((n, idx) => {
    if (idx > 0 && n - sorted[idx - 1] > 1) out.push('ellipsis');
    out.push(n);
  });
  return out;
}

export function PaginationBar({
  page,
  totalPages,
  total,
  from,
  to,
  onPageChange,
  className,
  compact,
}: {
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  className?: string;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  if (total === 0) return null;

  return (
    <nav
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 mt-4 border-t border-border',
        className,
      )}
      aria-label="Pagination"
    >
      <p className="text-sm text-muted-foreground">
        {t('showing')} <span className="font-medium text-foreground tabular-nums">{from}–{to}</span>{' '}
        {t('of')} <span className="font-medium text-foreground tabular-nums">{total}</span>
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 min-h-9 px-2.5 text-sm font-medium border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
            aria-label={t('paginationPrevious')}
          >
            <ChevronLeft className="w-4 h-4" />
            {!compact && t('paginationPrevious')}
          </button>

          {pageWindow(page, totalPages).map((item, i) =>
            item === 'ellipsis' ? (
              <span key={`e${i}`} className="w-8 text-center text-muted-foreground select-none" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
                className={cn(
                  'min-w-9 h-9 px-2 text-sm font-medium tabular-nums border',
                  item === page
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border bg-background text-foreground hover:bg-muted',
                )}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 min-h-9 px-2.5 text-sm font-medium border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
            aria-label={t('paginationNext')}
          >
            {!compact && t('paginationNext')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
