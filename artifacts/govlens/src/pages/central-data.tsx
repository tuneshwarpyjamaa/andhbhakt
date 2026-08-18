import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { SEO, websiteJsonLd } from '@/components/seo';
import { PageShell } from '@/components/page-shell';
import { CtaLink } from '@/components/cta-link';

const PMCabinetSection = lazy(() => import('./central/cabinet-section'));
const AccountabilitySection = lazy(() => import('./central/accountability-section'));
const IndicatorsSection = lazy(() => import('./central/indicators-section'));
const SchemesSection = lazy(() => import('./central/schemes-section'));
const CagSection = lazy(() => import('./central/cag-section'));
const ManifestoSection = lazy(() => import('./central/manifesto-section'));

function SectionFallback() {
  return (
    <div className="px-4 py-8 flex items-center justify-center" role="status" aria-live="polite">
      <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default function CentralData() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <SEO
        title="India's Cabinet Accountability Scorecard"
        description="Track India's 72 Union Cabinet ministers — integrity scores, criminal records, asset growth, and CAG audit findings. PIB vs CAG for every major BJP-era scheme."
        path="/"
        ogImage="/og/default.jpg"
        jsonLd={websiteJsonLd}
      />
      <div className="page-wrap">

        <header className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
            {t('navSubtitle')}
          </p>
          <h1 className="font-semibold tracking-tight text-foreground">
            {t('heroTitle')}
          </h1>
          <p className="measure mt-3 text-muted-foreground">
            {t('heroLede')}
          </p>
          <div className="mt-5">
            <CtaLink href="/schemes">{t('heroCta')}</CtaLink>
          </div>
          <p className="mt-4 text-xs text-muted-foreground font-mono">
            {t('dataSources')}: ECI affidavits · ADR/myneta.info · NFHS-5 · NCRB · MOSPI · CAG published reports · ASER 2023
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="panel xl:col-span-7">
            <div className="px-4 pt-4 pb-3 border-b border-border flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t('governmentOfIndia')}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{t('alliance')}</p>
              </div>
              <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-1 rounded flex-shrink-0">{t('indiaCode')}</span>
            </div>
            <Suspense fallback={<SectionFallback />}>
              <PMCabinetSection />
              <AccountabilitySection />
            </Suspense>
          </div>

          <div className="panel xl:col-span-5">
            <Suspense fallback={<SectionFallback />}>
              <IndicatorsSection />
            </Suspense>
          </div>

          <div className="panel xl:col-span-7">
            <Suspense fallback={<SectionFallback />}>
              <SchemesSection />
            </Suspense>
          </div>

          <div className="panel xl:col-span-5">
            <Suspense fallback={<SectionFallback />}>
              <CagSection />
            </Suspense>
          </div>

          <div className="panel xl:col-span-12">
            <Suspense fallback={<SectionFallback />}>
              <ManifestoSection />
            </Suspense>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-mono mt-6">
          {t('lastUpdated')}
        </p>
      </div>
    </PageShell>
  );
}
