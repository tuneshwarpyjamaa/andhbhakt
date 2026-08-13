import { Link } from 'wouter';
import { Scale } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/30 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Scale className="w-4 h-4 flex-shrink-0" />
            <span>
              © {year} Andhbhakt.org — {t('footerTagline')}
            </span>
          </div>

          {/* Legal links */}
          <nav className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              {t('footerTerms')}
            </Link>
            <span className="opacity-30">·</span>
            <Link
              href="/disclaimer"
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              {t('footerDisclaimer')}
            </Link>
            <span className="opacity-30">·</span>
            <Link
              href="/about"
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              {t('footerAbout')}
            </Link>
            <span className="opacity-30">·</span>
            <Link
              href="/report-issue"
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              {t('footerReportIssue', 'Report an Issue')}
            </Link>
          </nav>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground/50 text-center sm:text-left leading-relaxed max-w-2xl">
          {t('footerAttribution')}
        </p>
      </div>
    </footer>
  );
}
