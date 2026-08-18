import { AlertOctagon, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { SeverityKey } from '@/lib/scheme-ui';

export type SeverityFilter = Exclude<SeverityKey, 'unaudited'> | null;

const CARDS = [
  {
    key: 'critical' as const,
    Icon: AlertOctagon,
    labelKey: 'criticalSeverity',
    tone: 'text-[hsl(var(--severity-critical))] bg-[hsl(var(--severity-critical)/0.08)] border-[hsl(var(--severity-critical)/0.35)]',
    active: 'ring-2 ring-[hsl(var(--severity-critical))] bg-[hsl(var(--severity-critical)/0.14)]',
    weight: 'lg:min-h-[6.5rem] lg:flex-[1.4]',
    count: 'text-3xl lg:text-4xl',
  },
  {
    key: 'major' as const,
    Icon: AlertTriangle,
    labelKey: 'majorSeverity',
    tone: 'text-[hsl(var(--severity-major))] bg-[hsl(var(--severity-major)/0.08)] border-[hsl(var(--severity-major)/0.32)]',
    active: 'ring-2 ring-[hsl(var(--severity-major))] bg-[hsl(var(--severity-major)/0.14)]',
    weight: 'lg:min-h-[5.75rem] lg:flex-[1.1]',
    count: 'text-2xl lg:text-3xl',
  },
  {
    key: 'minor' as const,
    Icon: ShieldAlert,
    labelKey: 'minorSeverity',
    tone: 'text-[hsl(var(--severity-minor))] bg-[hsl(var(--severity-minor)/0.08)] border-[hsl(var(--severity-minor)/0.3)]',
    active: 'ring-2 ring-[hsl(var(--severity-minor))] bg-[hsl(var(--severity-minor)/0.14)]',
    weight: 'lg:min-h-[5rem] lg:flex-1',
    count: 'text-xl lg:text-2xl',
  },
] as const;

export function SeverityCards({
  critical,
  major,
  minor,
  active,
  onChange,
}: {
  critical: number;
  major: number;
  minor: number;
  active: SeverityFilter;
  onChange: (next: SeverityFilter) => void;
}) {
  const { t } = useTranslation();
  const counts = { critical, major, minor };

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-stretch" role="group" aria-label={t('filterSeverity')}>
      {CARDS.map((card) => {
        const count = counts[card.key];
        const isActive = active === card.key;
        const Icon = card.Icon;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onChange(isActive ? null : card.key)}
            aria-pressed={isActive}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-shadow flex-1',
              card.tone,
              count > 0 && card.weight,
              isActive && card.active,
              count === 0 && 'opacity-50',
            )}
            data-testid={`severity-card-${card.key}`}
          >
            <Icon className={cn('shrink-0', card.key === 'critical' ? 'w-7 h-7' : 'w-5 h-5')} aria-hidden />
            <div className="min-w-0">
              <div className={cn('font-mono font-bold tabular-nums leading-none', card.count)}>{count}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide">{t(card.labelKey)}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
