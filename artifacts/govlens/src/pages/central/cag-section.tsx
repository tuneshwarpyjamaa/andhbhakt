import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { FileSearch, ExternalLink, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { catalogOrLive, STATIC_CAG_2025 } from '@/lib/static-catalog';
import { PaginationBar, usePagination } from '@/components/pagination-bar';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/native-select';
import { useHiJson } from '@/lib/use-hi-json';
import { SEVERITY_META } from './shared';
import type { LiveCagAudit } from './types';

export default function CagSection() {
  const { t, i18n } = useTranslation();
  const isHiLang = i18n.language === 'hi';
  const schemeDetailHi = useHiJson<{ cagMap?: Record<string, { findingHi?: string; claimedHi?: string; actualHi?: string }> }>('scheme-detail-hi', () => import('@/data/scheme-detail-hi.json'), isHiLang);
  const cagAuditHi = schemeDetailHi?.cagMap ?? {};
  const schemeHi = useHiJson<Record<string, { nameHi?: string }>>('scheme-hi', () => import('@/data/scheme-translations-hi.json'), isHiLang) ?? {};
  const ministriesHi = useHiJson<Record<string, string>>('ministries-hi', () => import('@/data/ministries-hi.json'), isHiLang) ?? {};
  const [open, setOpen]                       = useState(false);
  const [severityFilter, setSeverityFilter]   = useState<string>('all');
  const [schemeFilter, setSchemeFilter]       = useState('');

  const { data: rawAuditsData, isLoading: loading } = useQuery<LiveCagAudit[]>({
    queryKey: ['cag-audits-recent'],
    queryFn: () => fetch('/api/cag-audits?yearFrom=2025').then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const rawAudits = catalogOrLive<LiveCagAudit>(rawAuditsData, STATIC_CAG_2025 as LiveCagAudit[]);

  const audits = useMemo(() => {
    const sevOrder: Record<string, number> = { critical: 0, major: 1, minor: 2 };
    return [...rawAudits].sort((a, b) => {
      return b.reportYear - a.reportYear ||
        (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3);
    });
  }, [rawAudits]);

  const filtered = useMemo(() => audits.filter(a => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (schemeFilter.trim()) {
      const q = schemeFilter.toLowerCase();
      return a.schemeName.toLowerCase().includes(q) || a.ministry.toLowerCase().includes(q);
    }
    return true;
  }), [audits, severityFilter, schemeFilter]);
  const cagPager = usePagination(filtered, 8, `${severityFilter}|${schemeFilter}`);

  const years   = [...new Set(audits.map(a => a.reportYear))].sort((a, b) => b - a);
  const critCount = audits.filter(a => a.severity === 'critical').length;
  const majCount  = audits.filter(a => a.severity === 'major').length;
  const minCount  = audits.filter(a => a.severity === 'minor').length;

  return (
    <div className="px-4 py-4">
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {t('cagAuditFindings')}
        </p>
        <Link
          href="/reports"
          className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors flex-shrink-0"
        >
          {t('viewAllReports')} <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap mb-4">
        {loading && audits.length === 0 ? (
          <span className="text-xs text-muted-foreground">{t('loading')}</span>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              {audits.length} {t('findings')} · {years.map(y => `'${String(y).slice(2)}`).join(' & ')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              <span className="w-2 h-2 rounded-full bg-red-500" />{critCount} {t('critical')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
              <span className="w-2 h-2 rounded-full bg-orange-500" />{majCount} {t('major')}
            </span>
            {minCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />{minCount} {t('minor')}
              </span>
            )}
          </>
        )}
      </div>

      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <FileSearch className="w-4 h-4" />
        {open
          ? <><ChevronUp className="w-4 h-4" /> {t('hideFindings')}</>
          : <><ChevronDown className="w-4 h-4" /> {t('browseFindings')} ({audits.length})</>
        }
      </button>

      {open && (
        <div className="mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder={t('filterSchemeMinistry')}
                value={schemeFilter}
                onChange={e => setSchemeFilter(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
            <NativeSelect value={severityFilter} onValueChange={setSeverityFilter} className="h-8 text-xs w-full sm:w-36">
              <option value="all">{t('allSeverities')}</option>
              <option value="critical">{t('critical')}</option>
              <option value="major">{t('major')}</option>
              <option value="minor">{t('minor')}</option>
            </NativeSelect>
          </div>

          {loading && audits.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">{t('loading')}</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">{t('noReportsMatch')}</p>
          ) : (
            <>
            <div className="flex flex-col gap-2">
                      {cagPager.slice.map(a => {
                        const sev = SEVERITY_META[a.severity];
                        return (
                          <div key={a.id} className={`rounded-lg border px-4 py-3 flex flex-col gap-1.5 ${sev.bg} ${sev.border}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${sev.text}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} flex-shrink-0`} />
                                  {sev.label}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono tabular-nums">{a.reportYear}</span>
                                {a.reportNumber && (
                                  <span className="text-[10px] text-muted-foreground font-mono">{t('reportNo')} {a.reportNumber}</span>
                                )}
                              </div>
                              {a.sourceUrl ? (
                                <a href={a.sourceUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex-shrink-0 text-muted-foreground/50 hover:text-primary transition-colors">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <a href="https://cag.gov.in" target="_blank" rel="noopener noreferrer"
                                  className="flex-shrink-0 text-muted-foreground/50 hover:text-primary transition-colors">
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            {(() => {
                              const isHi = i18n.language === 'hi';
                              const ah = isHi ? (cagAuditHi[String(a.id)] ?? {}) : {};
                              return <>
                                <p className="text-xs font-semibold text-foreground">
                                  {isHi ? (schemeHi[a.schemeSlug]?.nameHi ?? a.schemeName) : a.schemeName}
                                </p>
                                <p className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wide truncate">
                                  {isHi ? (ministriesHi[a.ministry] ?? a.ministry) : a.ministry}
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {isHi ? (ah.findingHi ?? a.finding) : a.finding}
                                </p>
                                {(a.claimed || a.actual) && (
                                  <div className="mt-0.5 grid grid-cols-2 gap-2">
                                    {a.claimed && (
                                      <div className="rounded bg-background/60 px-2 py-1">
                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-0.5">{t('claimed')}</p>
                                        <p className="text-[11px] text-foreground">{isHi ? (ah.claimedHi ?? a.claimed) : a.claimed}</p>
                                      </div>
                                    )}
                                    {a.actual && (
                                      <div className="rounded bg-background/60 px-2 py-1">
                                        <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-0.5">{t('actual')}</p>
                                        <p className="text-[11px] text-foreground">{isHi ? (ah.actualHi ?? a.actual) : a.actual}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>;
                            })()}
                          </div>
                        );
                      })}
            </div>
            <PaginationBar
              compact
              page={cagPager.page}
              totalPages={cagPager.totalPages}
              total={cagPager.total}
              from={cagPager.from}
              to={cagPager.to}
              onPageChange={cagPager.setPage}
            />
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground/50 font-mono">
              {t('cagSource')} CAG of India official reports · cag.gov.in
            </p>
            <a
              href="/reports"
              className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {t('viewOlderAuditReports')} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
