import { PageShell } from '@/components/page-shell';
import { CtaLink } from '@/components/cta-link';
import { SEO } from '@/components/seo';
import { Link } from 'wouter';
import { FileSearch, BookOpen, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <PageShell>
      <SEO
        title={t('notFoundTitle')}
        description={t('notFoundDesc')}
        path="/404"
        noindex
      />
      <div className="page-wrap-prose py-16 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-3">
          404
        </p>
        <h1 className="font-semibold tracking-tight text-foreground">{t('notFoundTitle')}</h1>
        <p className="measure mt-3 text-muted-foreground">
          {t('notFoundDesc')}
        </p>
        <p className="measure mt-2 text-muted-foreground">
          {t('notFoundHelp')}
        </p>
        <div className="mt-6">
          <CtaLink href="/">{t('notFoundBack')}</CtaLink>
        </div>
        <ul className="mt-10 grid gap-3 sm:grid-cols-3">
          <li>
            <Link href="/schemes" className="flex flex-col gap-1 panel p-4 h-full hover:bg-muted/40 transition-colors">
              <FileSearch className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-foreground">{t('navCentralSchemes')}</span>
              <span className="text-xs text-muted-foreground">{t('notFoundSchemes')}</span>
            </Link>
          </li>
          <li>
            <Link href="/reports" className="flex flex-col gap-1 panel p-4 h-full hover:bg-muted/40 transition-colors">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-foreground">{t('navCagReports')}</span>
              <span className="text-xs text-muted-foreground">{t('notFoundReports')}</span>
            </Link>
          </li>
          <li>
            <Link href="/state-facts" className="flex flex-col gap-1 panel p-4 h-full hover:bg-muted/40 transition-colors">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-foreground">{t('navStateData')}</span>
              <span className="text-xs text-muted-foreground">{t('notFoundStates')}</span>
            </Link>
          </li>
        </ul>
      </div>
    </PageShell>
  );
}
