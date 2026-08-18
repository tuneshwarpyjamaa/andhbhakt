import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type FeedSort = 'newest' | 'oldest' | 'severity';

export function FeedToolbar({
  id,
  typeValue,
  typeOptions,
  onTypeChange,
  sortValue,
  onSortChange,
  showSeveritySort,
  className,
}: {
  id: string;
  typeValue: string;
  typeOptions: { value: string; label: string }[];
  onTypeChange: (value: string) => void;
  sortValue: FeedSort;
  onSortChange: (value: FeedSort) => void;
  showSeveritySort?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <label className="sr-only" htmlFor={`${id}-type`}>
        {t('filterByType')}
      </label>
      <select
        id={`${id}-type`}
        value={typeValue}
        onChange={(e) => onTypeChange(e.target.value)}
        className="h-9 min-w-[8rem] rounded-md border border-input bg-background px-2 text-sm text-foreground"
      >
        {typeOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor={`${id}-sort`}>
        {t('sortBy')}
      </label>
      <select
        id={`${id}-sort`}
        value={sortValue}
        onChange={(e) => onSortChange(e.target.value as FeedSort)}
        className="h-9 min-w-[8rem] rounded-md border border-input bg-background px-2 text-sm text-foreground"
      >
        <option value="newest">{t('sortNewest')}</option>
        <option value="oldest">{t('sortOldest')}</option>
        {showSeveritySort && <option value="severity">{t('sortSeverity')}</option>}
      </select>
    </div>
  );
}
