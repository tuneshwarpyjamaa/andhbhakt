import { StatusBadge, type StatusKind } from '@/components/status-badge';
import { eventYear } from '@/lib/scheme-ui';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export type TimelineClaim = {
  id: number;
  date: string;
  title: string;
  badge: StatusKind;
};

export type TimelineFinding = {
  id: number;
  year: number;
  title: string;
  badge: StatusKind;
  index: number;
};

export function ClaimsTimeline({
  claims,
  findings,
  className,
}: {
  claims: TimelineClaim[];
  findings: TimelineFinding[];
  className?: string;
}) {
  const { t } = useTranslation();

  const years = Array.from(
    new Set([
      ...claims.map((c) => eventYear(c.date)),
      ...findings.map((f) => f.year),
    ].filter((y) => y > 0)),
  ).sort((a, b) => a - b);

  if (years.length === 0) {
    return (
      <p className="type-meta py-6 text-center">{t('timelineEmpty')}</p>
    );
  }

  return (
    <section className={cn('bg-card border border-card-border rounded-lg p-4 sm:p-5', className)}>
      <h2 className="type-section mb-1">{t('timelineTitle')}</h2>
      <p className="type-meta mb-4">{t('timelineHint')}</p>

      <div className="overflow-x-auto -mx-1 px-1">
        <div
          className="min-w-max"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${years.length}, minmax(12rem, 1fr))`,
            gridTemplateRows: 'auto 2.5rem auto',
          }}
        >
          {years.map((year, i) => {
            const yearClaims = claims.filter((c) => eventYear(c.date) === year);
            const extra = Math.max(0, yearClaims.length - 2);
            return (
              <div
                key={`c-${year}`}
                className="px-1.5 pb-2 min-h-[4.5rem] flex flex-col gap-1.5 justify-end"
                style={{ gridColumn: i + 1, gridRow: 1 }}
              >
                {yearClaims.slice(0, 2).map((claim) => (
                  <a
                    key={claim.id}
                    href={`#claim-${claim.id}`}
                    className="block rounded-md border border-border bg-background px-2 py-1 hover:bg-muted/60"
                  >
                    <StatusBadge kind={claim.badge} />
                    <p className="text-xs font-medium leading-snug line-clamp-1 text-foreground mt-1">{claim.title}</p>
                  </a>
                ))}
                {extra > 0 && (
                  <p className="type-meta px-1">+{extra} {t('timelineMore')}</p>
                )}
              </div>
            );
          })}

          {years.map((year, i) => (
            <div key={`axis-${year}`} className="relative px-1.5" style={{ gridColumn: i + 1, gridRow: 2 }}>
              <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-card px-1">
                <span className="w-2 h-2 rounded-full bg-brand shrink-0" aria-hidden />
                <span className="type-meta font-mono">{year}</span>
              </div>
            </div>
          ))}

          {years.map((year, i) => {
            const yearFindings = findings.filter((f) => f.year === year);
            const extra = Math.max(0, yearFindings.length - 2);
            return (
              <div
                key={`f-${year}`}
                className="px-1.5 pt-2 min-h-[4.5rem] flex flex-col gap-1.5"
                style={{ gridColumn: i + 1, gridRow: 3 }}
              >
                {yearFindings.slice(0, 2).map((finding) => (
                  <a
                    key={finding.id}
                    href={`#finding-${finding.id}`}
                    className="block rounded-md border border-border bg-background px-2 py-1 hover:bg-muted/60"
                  >
                    <StatusBadge kind={finding.badge} />
                    <p className="text-xs font-medium leading-snug line-clamp-1 text-foreground mt-1">
                      {t('findingNumber', { n: finding.index })} · {finding.title}
                    </p>
                  </a>
                ))}
                {extra > 0 && (
                  <p className="type-meta px-1">+{extra} {t('timelineMore')}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
