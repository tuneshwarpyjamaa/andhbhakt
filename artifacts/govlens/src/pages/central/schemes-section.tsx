import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ListFilter, ChevronDown, ChevronUp } from 'lucide-react';
import { useListSchemes, useListCategories } from '@workspace/api-client-react';
import { catalogOrLive, STATIC_SCHEMES, STATIC_CATEGORIES } from '@/lib/static-catalog';
import { SchemeCard } from '@/components/scheme-card';
import { PaginationBar, usePagination } from '@/components/pagination-bar';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/native-select';

export default function SchemesSection() {
  const { t } = useTranslation();
  const [open, setOpen]           = useState(false);
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [sevFilter, setSevFilter] = useState<string>('all');

  const { data: schemesData, isLoading } = useListSchemes({});
  const { data: categoriesData }         = useListCategories();
  const schemes = catalogOrLive(schemesData, STATIC_SCHEMES);
  const categories = catalogOrLive(categoriesData, STATIC_CATEGORIES);

  const filtered = useMemo(() => {
    return schemes.filter(s => {
      if (catFilter !== 'all' && String(s.categoryId) !== catFilter) return false;
      if (sevFilter !== 'all' && s.worstSeverity !== sevFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.ministry.toLowerCase().includes(q) ||
          (s.description ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [schemes, search, catFilter, sevFilter]);
  const schemePager = usePagination(filtered, 6, `${search}|${catFilter}|${sevFilter}`);

  const critCount = schemes.filter(s => s.worstSeverity === 'critical').length;
  const majCount  = schemes.filter(s => s.worstSeverity === 'major').length;
  const unaudited = schemes.filter(s => !s.worstSeverity).length;

  return (
    <div className="px-4 py-4 border-b border-border">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        {t('centralSchemes')}
      </p>

      {/* Summary chips */}
      <div className="flex gap-2 flex-wrap mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
          {schemes.length} {t('schemesTracked')}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
          <span className="w-2 h-2 rounded-full bg-red-500" />{critCount} {t('critical')}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
          <span className="w-2 h-2 rounded-full bg-orange-500" />{majCount} {t('major')}
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
          {unaudited} {t('unaudited')}
        </span>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <ListFilter className="w-4 h-4" />
        {open
          ? <><ChevronUp className="w-4 h-4" /> {t('hideSchemes')}</>
          : <><ChevronDown className="w-4 h-4" /> {t('browseAllSchemes')} ({schemes.length})</>}
      </button>

      {open && (
        <div className="mt-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder={t('searchSchemes')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
            <NativeSelect value={catFilter} onValueChange={setCatFilter} className="h-8 text-xs w-full sm:w-44">
              <option value="all">{t('allCategories')}</option>
              {categories.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </NativeSelect>
            <NativeSelect value={sevFilter} onValueChange={setSevFilter} className="h-8 text-xs w-full sm:w-36">
              <option value="all">{t('allSeverities')}</option>
              <option value="critical">{t('critical')}</option>
              <option value="major">{t('major')}</option>
              <option value="minor">{t('minor')}</option>
              <option value="null">{t('unaudited')}</option>
            </NativeSelect>
          </div>

          {isLoading && filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">{t('loading')}</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">{t('noSchemesMatch')}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {schemePager.slice.map(s => <SchemeCard key={s.slug} scheme={s} />)}
              </div>
              <PaginationBar
                compact
                page={schemePager.page}
                totalPages={schemePager.totalPages}
                total={schemePager.total}
                from={schemePager.from}
                to={schemePager.to}
                onPageChange={schemePager.setPage}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
