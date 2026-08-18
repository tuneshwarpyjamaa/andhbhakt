import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EvidenceCard } from '@/components/evidence-card';
import { EmptyState } from '@/components/list-states';
import { FeedToolbar, type FeedSort } from '@/components/feed-toolbar';
import type { StatusKind } from '@/components/status-badge';
import { linkClaimsToFindings } from '@/lib/cross-ref';
import { asClaimType, asSeverity, formatDisplayDate, withUnit } from '@/lib/scheme-ui';
import type { SeverityFilter } from '@/components/severity-cards';

export type SchemeClaim = {
  id: number;
  date: string;
  claimType: string;
  title: string;
  body: string;
  figure?: string | null;
  figureUnit?: string | null;
  sourceUrl?: string | null;
};

export type SchemeFinding = {
  id: number;
  reportYear: number;
  reportNumber: string;
  severity: string;
  title: string;
  body: string;
  excerpt?: string | null;
  claimed?: string | null;
  actual?: string | null;
  unit?: string | null;
  gapPercent?: number | null;
  sourceUrl?: string | null;
};

const SEV_RANK: Record<string, number> = { critical: 0, major: 1, minor: 2, unaudited: 3 };

export function ClaimsVsEvidence({
  claims,
  findings,
  severityFilter,
  highlightedId,
  fallbackFindingUrl,
}: {
  claims: SchemeClaim[];
  findings: SchemeFinding[];
  severityFilter: SeverityFilter;
  highlightedId?: string | null;
  fallbackFindingUrl?: (finding: SchemeFinding) => string;
}) {
  const { t, i18n } = useTranslation();
  const [claimType, setClaimType] = useState('all');
  const [claimSort, setClaimSort] = useState<FeedSort>('newest');
  const [findingType, setFindingType] = useState('all');
  const [findingSort, setFindingSort] = useState<FeedSort>('newest');

  useEffect(() => {
    setFindingType(severityFilter ?? 'all');
  }, [severityFilter]);

  const findingIndex = useMemo(() => {
    const sorted = [...findings].sort((a, b) => a.reportYear - b.reportYear || a.id - b.id);
    return new Map(sorted.map((f, i) => [f.id, i + 1]));
  }, [findings]);

  const claimIndex = useMemo(() => {
    const sorted = [...claims].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id - b.id);
    return new Map(sorted.map((c, i) => [c.id, i + 1]));
  }, [claims]);

  const links = useMemo(() => linkClaimsToFindings(claims, findings), [claims, findings]);

  const visibleClaims = useMemo(() => {
    let list = claims;
    if (claimType !== 'all') list = list.filter((c) => c.claimType === claimType);
    const copy = [...list];
    copy.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return claimSort === 'oldest' ? da - db : db - da;
    });
    return copy;
  }, [claims, claimType, claimSort]);

  const visibleFindings = useMemo(() => {
    let list = findings;
    const sev = findingType !== 'all' ? findingType : severityFilter;
    if (sev) list = list.filter((f) => f.severity === sev);
    const copy = [...list];
    copy.sort((a, b) => {
      if (findingSort === 'severity') {
        return (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9);
      }
      return findingSort === 'oldest' ? a.reportYear - b.reportYear : b.reportYear - a.reportYear;
    });
    return copy;
  }, [findings, findingType, findingSort, severityFilter]);

  const claimTypes = useMemo(() => {
    const set = new Set(claims.map((c) => c.claimType));
    return [
      { value: 'all', label: t('allTypes') },
      ...Array.from(set).map((value) => ({
        value,
        label: t(`claimType${value.charAt(0).toUpperCase()}${value.slice(1)}`),
      })),
    ];
  }, [claims, t]);

  const findingTypes = useMemo(
    () => [
      { value: 'all', label: t('allSeverities') },
      { value: 'critical', label: t('severityCritical') },
      { value: 'major', label: t('severityMajor') },
      { value: 'minor', label: t('severityMinor') },
    ],
    [t],
  );

  return (
    <div className="grid lg:grid-cols-2 gap-4 lg:h-[min(42rem,72dvh)]">
      <section className="bg-card border border-card-border rounded-lg p-4 sm:p-5 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand" aria-hidden />
              <h2 className="type-section">{t('governmentSaid')}</h2>
            </div>
            <p className="type-meta mt-1">
              {claims.length} {t('pibPressRelease')}
              {claims.length !== 1 ? t('pluralSuffix') : ''}
            </p>
          </div>
          {claims.length > 5 && (
            <FeedToolbar
              id="claims"
              typeValue={claimType}
              typeOptions={claimTypes}
              onTypeChange={setClaimType}
              sortValue={claimSort}
              onSortChange={setClaimSort}
            />
          )}
        </div>
        <div className="space-y-3 lg:overflow-y-auto lg:flex-1 lg:pr-1">
          {visibleClaims.length > 0 ? (
            visibleClaims.map((entry, i) => {
              const refs = (links.claimToFindings.get(entry.id) ?? []).map((fid) => ({
                href: `#finding-${fid}`,
                label: t('findingNumber', { n: findingIndex.get(fid) ?? '?' }),
              }));
              return (
                <EvidenceCard
                  key={entry.id}
                  id={`claim-${entry.id}`}
                  kind="claim"
                  indexLabel={t('claimNumber', { n: claimIndex.get(entry.id) ?? i + 1 })}
                  date={formatDisplayDate(entry.date, i18n.language)}
                  badge={asClaimType(entry.claimType) as StatusKind}
                  title={entry.title}
                  body={entry.body}
                  claimed={withUnit(entry.figure, entry.figureUnit)}
                  sourceHref={entry.sourceUrl}
                  sourceTestId={`link-pib-source-${entry.id}`}
                  crossRefs={refs}
                  highlighted={highlightedId === `claim-${entry.id}`}
                />
              );
            })
          ) : (
            <EmptyState title={claims.length === 0 ? t('noPibEntries') : t('noMatchingClaims')} />
          )}
        </div>
      </section>

      <section
        id="scheme-findings"
        className="bg-card border border-card-border rounded-lg p-4 sm:p-5 flex flex-col min-h-0 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--severity-critical))]" aria-hidden />
              <h2 className="type-section">{t('auditorsFound')}</h2>
            </div>
            <p className="type-meta mt-1">
              {findings.length} {t('cagAuditFinding')}
              {findings.length !== 1 ? t('pluralSuffix') : ''}
              {severityFilter ? ` · ${t('showingSeverity', { severity: t(`severity${severityFilter.charAt(0).toUpperCase()}${severityFilter.slice(1)}`) })}` : ''}
            </p>
          </div>
          {findings.length > 5 && (
            <FeedToolbar
              id="findings"
              typeValue={findingType}
              typeOptions={findingTypes}
              onTypeChange={setFindingType}
              sortValue={findingSort}
              onSortChange={setFindingSort}
              showSeveritySort
            />
          )}
        </div>
        <div className="space-y-3 lg:overflow-y-auto lg:flex-1 lg:pr-1">
          {visibleFindings.length > 0 ? (
            visibleFindings.map((audit) => {
              const n = findingIndex.get(audit.id) ?? 0;
              const refs = (links.findingToClaims.get(audit.id) ?? []).map((cid) => ({
                href: `#claim-${cid}`,
                label: t('claimNumber', { n: claimIndex.get(cid) ?? '?' }),
              }));
              return (
                <EvidenceCard
                  key={audit.id}
                  id={`finding-${audit.id}`}
                  kind="finding"
                  indexLabel={t('findingNumber', { n })}
                  date={formatDisplayDate(audit.reportYear, i18n.language)}
                  badge={asSeverity(audit.severity) as StatusKind}
                  title={audit.title}
                  body={audit.body}
                  excerpt={audit.excerpt}
                  claimed={withUnit(audit.claimed, audit.unit)}
                  actual={withUnit(audit.actual, audit.unit)}
                  gapPercent={audit.gapPercent}
                  sourceHref={audit.sourceUrl ?? fallbackFindingUrl?.(audit)}
                  sourceLabel={`${t('cagPrefix')} ${audit.reportNumber}, ${audit.reportYear}`}
                  sourceTestId={`audit-source-${audit.id}`}
                  crossRefs={refs}
                  highlighted={highlightedId === `finding-${audit.id}`}
                />
              );
            })
          ) : (
            <EmptyState title={findings.length === 0 ? t('noCagAudits') : t('noMatchingFindings')} />
          )}
        </div>
      </section>
    </div>
  );
}
