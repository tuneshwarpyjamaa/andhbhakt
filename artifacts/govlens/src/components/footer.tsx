import { Link } from 'wouter';
import { Scale, Github, Copy, Check } from 'lucide-react';
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

        {/* Open source strip */}
        <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
          <a
            href="https://github.com/JCRYDER3/andhbhakt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>Open source on GitHub</span>
          </a>
          <span className="hidden sm:block opacity-30 text-xs">·</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground/70 hover:text-foreground bg-muted/50 hover:bg-muted px-2.5 py-1 rounded transition-colors"
            title="Copy clone command"
          >
            <span>{CLONE_CMD}</span>
            {copied
              ? <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
              : <Copy className="w-3 h-3 flex-shrink-0" />
            }
          </button>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground/50 text-center sm:text-left leading-relaxed max-w-2xl">
          {t('footerAttribution')}
        </p>
      </div>
    </footer>
  );
}
