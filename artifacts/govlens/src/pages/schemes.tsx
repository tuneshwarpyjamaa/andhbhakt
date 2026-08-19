import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SEO } from '@/components/seo';
import { useListSchemes, useListCategories, useListMinistries, getListSchemesQueryKey } from '@workspace/api-client-react';
import { PageShell, PageHeader } from '@/components/page-shell';
import { SchemeCard } from '@/components/scheme-card';
import { PaginationBar, usePagination } from '@/components/pagination-bar';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/native-select';
import { Search, Filter } from 'lucide-react';
import { catalogOrLive, STATIC_SCHEMES, STATIC_CATEGORIES, STATIC_MINISTRIES } from '@/lib/static-catalog';
import { useHiJson } from '@/lib/use-hi-json';
const PAGE_SIZE = 12;

export default function Schemes() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const namesHi = useHiJson<Record<string, string>>('ministries-hi', isHi) ?? {};
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [ministry, setMinistry] = useState<string | undefined>();
  const [severity, setSeverity] = useState<string | undefined>();

  const { data: schemesData, isLoading } = useListSchemes(
    { search, categoryId, ministry, severity },
    { query: { queryKey: getListSchemesQueryKey({ search, categoryId, ministry, severity }) } }
  );
  const { data: categoriesData } = useListCategories();
  const { data: ministriesData } = useListMinistries();
  const schemes = catalogOrLive(schemesData, STATIC_SCHEMES);
  const categories = catalogOrLive(categoriesData, STATIC_CATEGORIES);
  const ministries = catalogOrLive(ministriesData, STATIC_MINISTRIES);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return schemes.filter((s) => {
      if (categoryId !== undefined && s.categoryId !== categoryId) return false;
      if (ministry && s.ministry !== ministry) return false;
      if (severity && s.worstSeverity !== severity) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.ministry.toLowerCase().includes(q) ||
        (s.description ?? '').toLowerCase().includes(q) ||
        (s.renamedFrom ?? '').toLowerCase().includes(q)
      );
    });
  }, [schemes, search, categoryId, ministry, severity]);

  const resetKey = `${search}|${categoryId ?? ''}|${ministry ?? ''}|${severity ?? ''}`;
  const pager = usePagination(filtered, PAGE_SIZE, resetKey);

  return (
    <PageShell>
      <SEO
        title="Government Scheme Reality Check — PIB Claims vs CAG Findings"
        description="Compare Indian government press releases against Comptroller and Auditor General audit findings for 55+ BJP-era Union schemes. Evidence-based accountability."
        path="/schemes"
        ogImage="/og/schemes.jpg"
        crumbs={[{ href: '/', label: t('crumbHome') }, { label: t('pageHeading') }]}
      />

      <div className="page-wrap">
        <PageHeader
          title={t('pageHeading')}
          description={t('pageDescription')}
          crumbs={[{ href: '/', label: t('crumbHome') }, { label: t('pageHeading') }]}
        />

        {/* Filters */}
        <div className="bg-card border border-card-border rounded-lg p-4 mb-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-schemes"
              />
            </div>

            <NativeSelect
              data-testid="select-category"
              value={categoryId?.toString() || 'all'}
              onValueChange={(val) => setCategoryId(val === 'all' ? undefined : Number(val))}
            >
              <option value="all">{t('allCategories')}</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {isHi ? (namesHi[cat.name] ?? cat.name) : cat.name}
                </option>
              ))}
            </NativeSelect>

            <NativeSelect
              data-testid="select-ministry"
              value={ministry || 'all'}
              onValueChange={(val) => setMinistry(val === 'all' ? undefined : val)}
            >
              <option value="all">{t('allMinistries')}</option>
              {ministries?.map((min) => (
                <option key={min} value={min}>
                  {isHi ? (namesHi[min] ?? min) : min}
                </option>
              ))}
            </NativeSelect>

            <NativeSelect
              data-testid="select-severity"
              value={severity || 'all'}
              onValueChange={(val) => setSeverity(val === 'all' ? undefined : val)}
            >
              <option value="all">{t('allSeverities')}</option>
              <option value="critical">{t('criticalSeverity')}</option>
              <option value="major">{t('majorSeverity')}</option>
              <option value="minor">{t('minorSeverity')}</option>
            </NativeSelect>
          </div>
        </div>

        {/* Results */}
        {isLoading && schemes.length === 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-card border border-card-border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {pager.slice.map((scheme) => (
                <SchemeCard key={scheme.id} scheme={scheme} />
              ))}
            </div>
            <PaginationBar
              page={pager.page}
              totalPages={pager.totalPages}
              total={pager.total}
              from={pager.from}
              to={pager.to}
              onPageChange={(p) => {
                pager.setPage(p);
                document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          </>
        ) : (
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">{t('noSchemesFound')}</h3>
            <p className="text-muted-foreground">
              {t('emptyStateHint')}
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
