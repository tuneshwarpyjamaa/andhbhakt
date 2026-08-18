import { Link } from 'wouter';
import { StatusBadge, type StatusKind } from './status-badge';
import { asSeverity } from '@/lib/scheme-ui';
import type { SchemeSummary } from '@workspace/api-client-react';
import { FileText, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useHiJson } from '@/lib/use-hi-json';

interface SchemeCardProps {
  scheme: SchemeSummary;
}

export function SchemeCard({ scheme }: SchemeCardProps) {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const schemeHiMap = useHiJson<Record<string, { nameHi?: string; descriptionHi?: string }>>('scheme-hi', () => import('@/data/scheme-translations-hi.json'), isHi) ?? {};
  const namesHi = useHiJson<Record<string, string>>('ministries-hi', () => import('@/data/ministries-hi.json'), isHi) ?? {};

  return (
    <Link
      href={`/schemes/${scheme.slug}`}
      className="group block bg-card border border-card-border rounded-lg hover:border-primary/40 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-ring"
      data-testid={`card-scheme-${scheme.slug}`}
    >
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[15px] leading-snug text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-2">
              {isHi ? (schemeHiMap[scheme.slug]?.nameHi ?? scheme.name) : scheme.name}
            </h3>
            {scheme.renamedFrom && (
              <p className="text-xs text-muted-foreground">
                {t('schemeCardPreviously')} {scheme.renamedFrom}
              </p>
            )}
          </div>
          <StatusBadge kind={asSeverity(scheme.worstSeverity) as StatusKind} />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span>{isHi ? (namesHi[scheme.ministry] ?? scheme.ministry) : scheme.ministry}</span>
          <span aria-hidden>•</span>
          <span className="font-mono tabular-nums">{scheme.launchedYear}</span>
        </div>

        {scheme.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {isHi ? (schemeHiMap[scheme.slug]?.descriptionHi ?? scheme.description) : scheme.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span className="text-xs tabular-nums">{scheme.pibCount} PIB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="text-xs tabular-nums">{scheme.cagCount} CAG</span>
        </div>
      </div>
    </Link>
  );
}
