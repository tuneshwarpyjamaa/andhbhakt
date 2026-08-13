import { Link } from 'wouter';
import { SeverityBadge } from './severity-badge';
import type { SchemeSummary } from '@workspace/api-client-react';
import { FileText, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import schemeHiRaw from '@/data/scheme-translations-hi.json';
import namesHiRaw from '@/data/ministries-hi.json';

const schemeHiMap = schemeHiRaw as Record<string, { nameHi?: string; descriptionHi?: string }>;
const namesHi = namesHiRaw as Record<string, string>;

interface SchemeCardProps {
  scheme: SchemeSummary;
}

export function SchemeCard({ scheme }: SchemeCardProps) {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  return (
    <Link
      href={`/schemes/${scheme.slug}`}
      className="group block bg-card border border-card-border rounded-lg hover:shadow-md transition-all hover:border-primary/30"
      data-testid={`card-scheme-${scheme.slug}`}
    >
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors mb-1 line-clamp-2">
              {isHi ? (schemeHiMap[scheme.slug]?.nameHi ?? scheme.name) : scheme.name}
            </h3>
            {scheme.renamedFrom && (
              <p className="text-xs text-muted-foreground">
                {t('schemeCardPreviously')} {scheme.renamedFrom}
              </p>
            )}
          </div>
          <SeverityBadge severity={scheme.worstSeverity as any} />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="font-mono">{isHi ? (namesHi[scheme.ministry] ?? scheme.ministry) : scheme.ministry}</span>
          <span>•</span>
          <span className="font-mono">{scheme.launchedYear}</span>
        </div>

        {scheme.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {isHi ? (schemeHiMap[scheme.slug]?.descriptionHi ?? scheme.description) : scheme.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-foreground">{scheme.pibCount} PIB</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-foreground">{scheme.cagCount} CAG</span>
        </div>
      </div>
    </Link>
  );
}
