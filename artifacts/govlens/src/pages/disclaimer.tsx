import { PageShell } from '@/components/page-shell';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SEO } from '@/components/seo';
import { Link } from 'wouter';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Disclaimer() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <SEO
        title={t('disclaimerSeoTitle')}
        description={t('disclaimerSeoDesc')}
        path="/disclaimer"
        crumbs={[{ href: '/', label: t('crumbHome') }, { label: t('disclaimerTitle') }]}
      />

      <div className="page-wrap-prose">
        <Breadcrumbs items={[{ href: '/', label: t('crumbHome') }, { label: t('disclaimerTitle') }]} />

        <div className="flex items-center gap-3 mb-8">
          <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('disclaimerTitle')}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t('disclaimerLastUpdated')}</p>
          </div>
        </div>

        {/* Alert banner */}
        <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 mb-8">
          <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
            <strong>{t('disclaimerBannerImportant')}</strong> {t('disclaimerBanner')}
          </p>
        </div>

        <div className="space-y-8 text-muted-foreground">

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('disclaimerGeneralTitle')}</h2>
            <p className="leading-relaxed text-sm">{t('disclaimerGeneralP1')}</p>
            <p className="leading-relaxed text-sm mt-3">{t('disclaimerGeneralP2')}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('disclaimerCriminalTitle')}</h2>
            <p className="leading-relaxed text-sm">{t('disclaimerCriminalP1')}</p>
            <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed mt-3">
              <li>{t('disclaimerCriminalItem1')}</li>
              <li>{t('disclaimerCriminalItem2')}</li>
              <li>{t('disclaimerCriminalItem3')}</li>
              <li>{t('disclaimerCriminalItem4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('disclaimerAssetsTitle')}</h2>
            <p className="leading-relaxed text-sm">{t('disclaimerAssetsP1')}</p>
            <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed mt-3">
              <li>{t('disclaimerAssetsItem1')}</li>
              <li>{t('disclaimerAssetsItem2')}</li>
              <li>{t('disclaimerAssetsItem3')}</li>
              <li>{t('disclaimerAssetsItem4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('disclaimerCagTitle')}</h2>
            <p className="leading-relaxed text-sm">{t('disclaimerCagP1')}</p>
            <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed mt-3">
              <li>{t('disclaimerCagItem1')}</li>
              <li>{t('disclaimerCagItem2')}</li>
              <li>{t('disclaimerCagItem3')}</li>
              <li>{t('disclaimerCagItem4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('disclaimerScoringTitle')}</h2>
            <p className="leading-relaxed text-sm">{t('disclaimerScoringP1')}</p>
            <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed mt-3">
              <li>{t('disclaimerScoringItem1')}</li>
              <li>{t('disclaimerScoringItem2')}</li>
              <li>{t('disclaimerScoringItem3')}</li>
              <li>{t('disclaimerScoringItem4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('disclaimerPoliticalTitle')}</h2>
            <p className="leading-relaxed text-sm">{t('disclaimerPoliticalP1')}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('disclaimerAdviceTitle')}</h2>
            <p className="leading-relaxed text-sm">{t('disclaimerAdviceP1')}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('disclaimerLinksTitle')}</h2>
            <p className="leading-relaxed text-sm">{t('disclaimerLinksP1')}</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">{t('disclaimerCorrectionsTitle')}</h2>
            <p className="leading-relaxed text-sm">{t('disclaimerCorrectionsP1')}</p>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-border">
          <Link href="/terms" className="text-sm text-primary hover:underline">
            {t('disclaimerReadTerms')}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
