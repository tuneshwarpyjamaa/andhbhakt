import { Link } from 'wouter';
import { Github, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const CLONE_CMD = 'git clone https://github.com/JCRYDER3/andhbhakt.git';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(CLONE_CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <footer className="border-t border-border bg-card/40 mt-8">
      <div className="page-wrap !pt-6 !pb-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="font-semibold text-foreground">Andhbhakt.org</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t('footerTagline')}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">© {year}</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t('footerExplore')}
            </p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">{t('navCentralData')}</Link></li>
              <li><Link href="/state-facts" className="text-muted-foreground hover:text-foreground transition-colors">{t('navStateData')}</Link></li>
              <li><Link href="/schemes" className="text-muted-foreground hover:text-foreground transition-colors">{t('navCentralSchemes')}</Link></li>
              <li><Link href="/reports" className="text-muted-foreground hover:text-foreground transition-colors">{t('navCagReports')}</Link></li>
              <li><Link href="/funding" className="text-muted-foreground hover:text-foreground transition-colors">{t('navPartyFunding')}</Link></li>
              <li><Link href="/development-index" className="text-muted-foreground hover:text-foreground transition-colors">{t('navDevelopmentIndex')}</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t('footerLegal')}
            </p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">{t('footerAbout')}</Link></li>
              <li><Link href="/disclaimer" className="text-muted-foreground hover:text-foreground transition-colors">{t('footerDisclaimer')}</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">{t('footerTerms')}</Link></li>
              <li><Link href="/report-issue" className="text-muted-foreground hover:text-foreground transition-colors">{t('footerReportIssue')}</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t('footerSource')}
            </p>
            <a
              href="https://github.com/JCRYDER3/andhbhakt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted px-2.5 py-1.5 rounded-md transition-colors w-full"
              title="Copy clone command"
            >
              <span className="truncate">{CLONE_CMD}</span>
              {copied
                ? <Check className="w-3 h-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                : <Copy className="w-3 h-3 flex-shrink-0" />
              }
            </button>
          </div>
        </div>

        <p className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground leading-relaxed measure">
          {t('footerAttribution')}
        </p>
      </div>
    </footer>
  );
}
