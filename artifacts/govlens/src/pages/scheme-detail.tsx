import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'wouter';
import { SEO, schemeJsonLd } from '@/components/seo';
import { useHiJson } from '@/lib/use-hi-json';
import { useGetScheme, useGetSchemeVerdict, useListPibEntries, useListCagAudits, getGetSchemeQueryKey, getGetSchemeVerdictQueryKey, getListPibEntriesQueryKey, getListCagAuditsQueryKey, type CAGAudit, type PIBEntry } from '@workspace/api-client-react';
import { PageShell } from '@/components/page-shell';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ScoreGauge } from '@/components/score-gauge';
import { SeverityCards, type SeverityFilter } from '@/components/severity-cards';
import { StatStrip } from '@/components/stat-strip';
import { ClaimsVsEvidence, type SchemeClaim, type SchemeFinding } from '@/components/claims-vs-evidence';
import { ClaimsTimeline } from '@/components/claims-timeline';
import { EmptyState, LoadingState } from '@/components/list-states';
import { asArray } from '@/lib/utils';
import { getStaticSchemeDetail } from '@/lib/static-scheme-details';
import { asClaimType, asSeverity } from '@/lib/scheme-ui';
import { Calendar, Flag, IndianRupee, Landmark, Target, Users } from 'lucide-react';
import { Link } from 'wouter';

type SchemeDetailHi = {
  cagMap?: Record<string, { parameterHi?: string; findingHi?: string; reportExcerptHi?: string; claimedHi?: string; actualHi?: string; unitHi?: string }>;
  verdictMap?: Record<string, string>;
  pibMap?: Record<string, { headlineHi?: string; summaryHi?: string }>;
};

/** Stable lookup key: first 120 chars lowercased — matches the key format in scheme-detail-hi.json */
function contentKey(text: string | null | undefined): string {
  if (!text) return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 120);
}

export default function SchemeDetail() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const slug = params.slug || '';
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>(null);

  const staticDetail = slug ? getStaticSchemeDetail(slug) : undefined;

  const { data: liveScheme, isLoading: schemeLoading } = useGetScheme(slug, {
    query: { enabled: !!slug, queryKey: getGetSchemeQueryKey(slug), retry: 1 }
  });
  const { data: liveVerdict } = useGetSchemeVerdict(slug, {
    query: { enabled: !!slug, queryKey: getGetSchemeVerdictQueryKey(slug), retry: 1 }
  });
  const { data: pibEntriesData } = useListPibEntries(slug, {
    query: { enabled: !!slug, queryKey: getListPibEntriesQueryKey(slug), retry: 1 }
  });
  const { data: cagAuditsData } = useListCagAudits(slug, {
    query: { enabled: !!slug, queryKey: getListCagAuditsQueryKey(slug), retry: 1 }
  });

  const scheme = liveScheme ?? staticDetail?.scheme;
  const verdict = liveVerdict ?? staticDetail?.verdict;
  const pibEntries = asArray<PIBEntry>(pibEntriesData).length > 0 ? asArray<PIBEntry>(pibEntriesData) : (staticDetail?.pib ?? []);
  const cagAudits = asArray<CAGAudit>(cagAuditsData).length > 0 ? asArray<CAGAudit>(cagAuditsData) : (staticDetail?.cag ?? []);

  const isHi = i18n.language === 'hi';
  const schemeHi = useHiJson<Record<string, { nameHi?: string; descriptionHi?: string; goalsHi?: string }>>('scheme-hi', isHi) ?? {};
  const sdHi = useHiJson<SchemeDetailHi>('scheme-detail-hi', isHi);
  const pibUnitsHi = useHiJson<Record<string, string>>('pib-units-hi', isHi) ?? {};
  const ministriesHi = useHiJson<Record<string, string>>('ministries-hi', isHi) ?? {};
  const cagHiMap = sdHi?.cagMap ?? {};
  const verdictHiMap = sdHi?.verdictMap ?? {};
  const pibHiMap = sdHi?.pibMap ?? {};
  const schemeName = scheme ? (isHi ? (schemeHi[slug]?.nameHi ?? scheme.name) : scheme.name) : '';

  const claims: SchemeClaim[] = useMemo(() => pibEntries.map((entry) => ({
    id: entry.id,
    date: entry.date,
    claimType: entry.claimType,
    title: isHi ? (pibHiMap[contentKey(entry.headline)]?.headlineHi ?? entry.headline) : entry.headline,
    body: isHi ? (pibHiMap[contentKey(entry.headline)]?.summaryHi ?? entry.summary) : entry.summary,
    figure: entry.figure,
    figureUnit: isHi ? (pibUnitsHi[entry.figureUnit ?? ''] ?? entry.figureUnit) : entry.figureUnit,
    sourceUrl: entry.sourceUrl,
  })), [pibEntries, isHi, pibHiMap, pibUnitsHi]);

  const findings: SchemeFinding[] = useMemo(() => cagAudits.map((audit) => {
    const hi = cagHiMap[contentKey(audit.parameter)] ?? {};
    return {
      id: audit.id,
      reportYear: audit.reportYear,
      reportNumber: audit.reportNumber,
      severity: audit.severity,
      title: isHi ? (hi.parameterHi ?? audit.parameter) : audit.parameter,
      body: isHi ? (hi.findingHi ?? audit.finding) : audit.finding,
      excerpt: isHi ? (hi.reportExcerptHi ?? audit.reportExcerpt) : audit.reportExcerpt,
      claimed: isHi ? (hi.claimedHi ?? audit.claimed) : audit.claimed,
      actual: isHi ? (hi.actualHi ?? audit.actual) : audit.actual,
      unit: audit.unit ? (isHi ? (hi.unitHi ?? audit.unit) : audit.unit) : audit.unit,
      gapPercent: audit.gapPercent,
      sourceUrl: audit.sourceUrl,
    };
  }), [cagAudits, isHi, cagHiMap]);

  const stats = useMemo(() => {
    if (!scheme) return [];
    const items = [
      {
        icon: Landmark,
        label: t('statMinistry'),
        value: isHi ? (ministriesHi[scheme.ministry] ?? scheme.ministry) : scheme.ministry,
      },
      { icon: Calendar, label: t('statLaunched'), value: String(scheme.launchedYear) },
    ];
    if (scheme.budgetCrore) {
      items.push({
        icon: IndianRupee,
        label: t('statBudget'),
        value: `${t('currencySymbol')}${scheme.budgetCrore.toLocaleString('en-IN')} ${t('croreSuffix')}`,
      });
    }
    if (scheme.targetYear) {
      items.push({ icon: Flag, label: t('statTargetYear'), value: String(scheme.targetYear) });
    }
    if (scheme.targetBeneficiaries) {
      items.push({ icon: Users, label: t('statBeneficiaries'), value: scheme.targetBeneficiaries });
    }
    if (scheme.categoryName) {
      items.push({ icon: Target, label: t('statCategory'), value: scheme.categoryName });
    }
    return items;
  }, [scheme, isHi, t]);

  if (schemeLoading && !scheme) {
    return (
      <PageShell>
        <div className="page-wrap">
          <LoadingState />
        </div>
      </PageShell>
    );
  }

  if (!scheme) {
    return (
      <PageShell>
        <div className="page-wrap">
          <EmptyState
            title={t('schemeNotFound')}
            hint={t('schemeNotFoundDescription')}
            action={
              <Link href="/schemes" className="text-primary font-semibold hover:underline">
                {t('backToAllSchemes')}
              </Link>
            }
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SEO
        title={isHi
          ? `${schemeName} — PIB दावे बनाम CAG लेखापरीक्षा निष्कर्ष`
          : `${scheme.name} — PIB Claims vs CAG Audit Findings`}
        description={isHi
          ? `${schemeName} पर सरकार के दावे बनाम CAG के निष्कर्ष। मंत्रालय: ${ministriesHi[scheme.ministry] ?? scheme.ministry}। शुरुआत ${scheme.launchedYear}।`
          : `What the government claims vs what CAG found for ${scheme.name}. Ministry: ${scheme.ministry}. Launched ${scheme.launchedYear}. Evidence-based accountability.`}
        path={`/schemes/${slug}`}
        ogImage="/og/schemes.jpg"
        type="article"
        jsonLd={schemeJsonLd(scheme.name, slug, scheme.description ?? undefined)}
        crumbs={[
          { href: '/', label: t('crumbHome') },
          { href: '/schemes', label: t('pageHeading') },
          { label: schemeName },
        ]}
      />

      <div className="page-wrap">
        <Breadcrumbs
          items={[
            { href: '/', label: t('crumbHome') },
            { href: '/schemes', label: t('pageHeading') },
            { label: schemeName },
          ]}
        />

        <header className="mb-5">
          <h1 className="type-title mb-2" data-testid="text-scheme-name">
            {schemeName}
          </h1>
          {scheme.renamedFrom && (
            <p className="type-meta mb-3">
              {t('previouslyKnownAs')} <span className="font-medium text-foreground">{scheme.renamedFrom}</span>
            </p>
          )}
          <p className="type-body text-foreground/85 max-w-3xl mb-4">
            {isHi ? (schemeHi[slug]?.descriptionHi ?? scheme.description) : scheme.description}
          </p>
          <StatStrip items={stats} />
          {scheme.goals && (
            <div className="mt-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <h2 className="type-subhead mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-brand" aria-hidden />
                {t('statedGoals')}
              </h2>
              <p className="text-sm text-foreground/85">
                {isHi ? (schemeHi[slug]?.goalsHi ?? scheme.goals) : scheme.goals}
              </p>
            </div>
          )}
        </header>

        {verdict && (
          <section className="bg-card border border-card-border rounded-lg p-4 sm:p-6 mb-5" data-testid="section-verdict">
            <h2 className="type-section mb-4">{t('accountabilityVerdict')}</h2>
            <ScoreGauge
              score={verdict.score}
              verdict={verdict.verdict}
              explainer={isHi ? (verdictHiMap[slug] ?? verdict.summary) : verdict.summary}
            />
            <div className="mt-5">
              <SeverityCards
                critical={verdict.criticalCount}
                major={verdict.majorCount}
                minor={verdict.minorCount}
                active={severityFilter}
                onChange={(next) => {
                  setSeverityFilter(next);
                  if (next) {
                    document.getElementById('scheme-findings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              />
            </div>
          </section>
        )}

        {(claims.length > 0 || findings.length > 0) && (
          <ClaimsTimeline
            className="mb-5"
            claims={claims.map((c) => ({
              id: c.id,
              date: c.date,
              title: c.title,
              badge: asClaimType(c.claimType),
            }))}
            findings={[...findings]
              .sort((a, b) => a.reportYear - b.reportYear || a.id - b.id)
              .map((f, i) => ({
                id: f.id,
                year: f.reportYear,
                title: f.title,
                badge: asSeverity(f.severity),
                index: i + 1,
              }))}
          />
        )}

        <ClaimsVsEvidence
          claims={claims}
          findings={findings}
          severityFilter={severityFilter}
          fallbackFindingUrl={() => `https://cag.gov.in/search/?searchword=${encodeURIComponent(scheme.name)}`}
        />
      </div>
    </PageShell>
  );
}
