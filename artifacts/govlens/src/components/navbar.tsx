import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { Search, BarChart3, Menu, X, FileText, BookOpen, Flag, IndianRupee, Globe, Github } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setAppLanguage } from '@/i18n';

function isNavActive(href: string, location: string) {
  if (href === '/') {
    return location === '/' || location === '/central-data' || location.startsWith('/minister/');
  }
  if (href === '/state-facts') {
    return location === '/state-facts' || location === '/rankings';
  }
  if (href === '/schemes') {
    return location === '/schemes' || location.startsWith('/schemes/');
  }
  return location === href;
}

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const links = [
    { href: '/', label: t('navCentralData'), icon: Flag },
    { href: '/state-facts', label: t('navStateData'), icon: BookOpen },
    { href: '/schemes', label: t('navCentralSchemes'), icon: Search },
    { href: '/reports', label: t('navCagReports'), icon: FileText },
    { href: '/funding', label: t('navPartyFunding'), icon: IndianRupee, badge: t('navBeta') },
    { href: '/development-index', label: t('navDevelopmentIndex'), icon: BarChart3 },
  ];

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50 shadow-[inset_0_2px_0_0_hsl(var(--primary))]">
      <div className="page-wrap !py-0">
        <div className="flex items-center h-12 gap-2">
          <Link href="/" className="flex items-center gap-2.5 group min-w-0 shrink-0">
            <img
              src="/logo.png"
              alt={t('logoAlt')}
              width={32}
              height={32}
              decoding="async"
              fetchPriority="high"
              className="w-8 h-8 rounded object-cover"
            />
            <div className="min-w-0">
              <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-none">
                Andhbhakt.org
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {t('navSubtitle')}
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5 flex-1 min-w-0 ml-4">
            {links.map((link) => {
              const active = isNavActive(link.href, location);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center h-12 px-2.5 text-[13px] whitespace-nowrap transition-colors',
                    active
                      ? 'text-foreground font-semibold after:absolute after:left-2 after:right-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary'
                      : 'text-meta font-medium hover:text-foreground hover:bg-muted/60'
                  )}
                  data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                  {'badge' in link && link.badge && (
                    <span className="ml-1.5 text-[9px] font-semibold px-1.5 py-px rounded-full bg-secondary text-secondary-foreground uppercase tracking-wide">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex-1 lg:hidden" />

          <a
            href="https://github.com/JCRYDER3/andhbhakt"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Globe className="w-3.5 h-3.5 shrink-0" aria-hidden />
            <label htmlFor="lang-select" className="sr-only">{t('langSelectLabel')}</label>
            <select
              id="lang-select"
              value={i18n.language.startsWith('hi') ? 'hi' : 'en'}
              onChange={(e) => { void setAppLanguage(e.target.value); }}
              className="bg-transparent border-none outline-none text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground appearance-none pr-0.5 focus-visible:ring-2 focus-visible:ring-ring rounded"
              aria-label={t('langSelectLabel')}
            >
              <option value="en">{t('langEnglish')}</option>
              <option value="hi">{t('langHindi')}</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={open ? t('navCloseMenu') : t('navOpenMenu')}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px]"
            aria-label={t('navCloseMenu')}
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label={t('navOpenMenu')}
            className="fixed inset-y-0 right-0 z-50 w-[min(20rem,88vw)] bg-card border-l border-border shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <span className="text-sm font-semibold">{t('navOpenMenu')}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                aria-label={t('navCloseMenu')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-2 overflow-y-auto">
              {links.map((link) => {
                const Icon = link.icon;
                const active = isNavActive(link.href, location);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-[3px]',
                      active
                        ? 'text-foreground bg-muted/80 border-l-primary font-semibold'
                        : 'text-meta border-l-transparent hover:text-foreground hover:bg-muted/60'
                    )}
                    data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {link.label}
                    {'badge' in link && link.badge && (
                      <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border leading-none">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="mt-auto border-t border-border p-4">
              <a
                href="https://github.com/JCRYDER3/andhbhakt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
