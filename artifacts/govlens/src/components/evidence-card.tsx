import { StatusBadge, type StatusKind } from '@/components/status-badge';
import { SourceLink } from '@/components/source-link';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type CrossRefLink = {
  href: string;
  label: string;
};

export function EvidenceCard({
  id,
  kind,
  indexLabel,
  date,
  badge,
  title,
  body,
  excerpt,
  claimed,
  actual,
  gapPercent,
  sourceHref,
  sourceLabel,
  sourceTestId,
  crossRefs,
  highlighted,
}: {
  id: string;
  kind: 'claim' | 'finding';
  indexLabel: string;
  date: string;
  badge: StatusKind;
  title: string;
  body: string;
  excerpt?: string | null;
  claimed?: string | null;
  actual?: string | null;
  gapPercent?: number | null;
  sourceHref?: string | null;
  sourceLabel?: string;
  sourceTestId?: string;
  crossRefs?: CrossRefLink[];
  highlighted?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <article
      id={id}
      className={cn(
        'scroll-mt-20 rounded-lg border border-border bg-background p-4 flex flex-col gap-3',
        highlighted && 'is-target ring-2 ring-accent/40',
      )}
      data-testid={`${kind}-card-${id}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="type-meta font-mono">{indexLabel}</span>
        <span className="text-meta" aria-hidden>
          ·
        </span>
        <time className="type-meta font-mono">{date}</time>
        <StatusBadge kind={badge} />
      </div>

      <h3 className="type-subhead leading-snug">{title}</h3>
      <p className="text-sm text-foreground/85 leading-relaxed">{body}</p>

      {excerpt && (
        <blockquote className="border-l-2 border-border pl-3">
          <p className="text-sm text-meta italic leading-relaxed">“{excerpt}”</p>
        </blockquote>
      )}

      {(claimed || actual) && (
        <div className="rounded-md bg-muted/50 border border-border px-3 py-2 space-y-1">
          {claimed && (
            <p className="text-sm">
              <span className="type-meta">{t('claimed')}</span>{' '}
              <span className="font-mono font-semibold">{claimed}</span>
            </p>
          )}
          {actual && (
            <p className="text-sm">
              <span className="type-meta">{t('actual')}</span>{' '}
              <span className="font-mono font-semibold">{actual}</span>
            </p>
          )}
          {gapPercent != null && (
            <p className="text-sm font-semibold text-[hsl(var(--severity-critical))]">
              {t('gap')} {gapPercent.toFixed(1)}%
            </p>
          )}
        </div>
      )}

      {crossRefs && crossRefs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {crossRefs.map((ref) => (
            <a
              key={ref.href}
              href={ref.href}
              className="inline-flex items-center min-h-9 px-2 rounded-md border border-border bg-muted/40 text-xs font-semibold text-foreground hover:bg-muted"
            >
              {kind === 'claim' ? t('thisClaimConflicts', { label: ref.label }) : t('thisFindingConflicts', { label: ref.label })}
            </a>
          ))}
        </div>
      )}

      {sourceHref && (
        <div className="mt-auto flex justify-end">
          <SourceLink href={sourceHref} label={sourceLabel} testId={sourceTestId} />
        </div>
      )}
    </article>
  );
}
