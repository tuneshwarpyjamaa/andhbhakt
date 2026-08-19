import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { BookOpen, FileText, Flag, Search, UserRound, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  loadSearchIndex,
  searchSite,
  type PageSearchItem,
  type SearchHit,
  type SearchKind,
  type SearchRecord,
} from '@/lib/site-search';

const KIND_ORDER: SearchKind[] = ['scheme', 'state', 'minister', 'page', 'reports'];

const GROUP_KEYS: Record<SearchKind, string> = {
  scheme: 'searchGroupSchemes',
  state: 'searchGroupStates',
  minister: 'searchGroupMinisters',
  page: 'searchGroupPages',
  reports: 'searchGroupReports',
};

function KindIcon({ kind }: { kind: SearchKind }) {
  const cls = 'w-3.5 h-3.5 shrink-0 text-muted-foreground';
  if (kind === 'scheme') return <Flag className={cls} aria-hidden />;
  if (kind === 'state') return <BookOpen className={cls} aria-hidden />;
  if (kind === 'minister') return <UserRound className={cls} aria-hidden />;
  if (kind === 'reports') return <FileText className={cls} aria-hidden />;
  return <Search className={cls} aria-hidden />;
}

export function HeaderSearch() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language.startsWith('hi');
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [records, setRecords] = useState<SearchRecord[] | null>(null);

  const pages = useMemo<PageSearchItem[]>(() => [
    { id: 'page:central', href: '/', title: t('navCentralData'), subtitle: t('navSubtitle'), aliases: 'cabinet ministers manifesto pmo national indicators केंद्रीय' },
    { id: 'page:states', href: '/state-facts', title: t('navStateData'), subtitle: t('stateData'), aliases: 'states ut rankings governance राज्य' },
    { id: 'page:rankings', href: '/rankings', title: t('searchPageRankings'), subtitle: t('navStateData'), aliases: 'rankings leaderboard तुलना' },
    { id: 'page:schemes', href: '/schemes', title: t('navCentralSchemes'), subtitle: t('pageHeading'), aliases: 'yojana schemes pib cag योजना' },
    { id: 'page:reports', href: '/reports', title: t('navCagReports'), subtitle: t('cagPageTitle'), aliases: 'cag audit reports लेखापरीक्षा' },
    { id: 'page:funding', href: '/funding', title: t('navPartyFunding'), subtitle: t('navPartyFunding'), aliases: 'electoral bonds party funding adr' },
    { id: 'page:dev', href: '/development-index', title: t('navDevelopmentIndex'), subtitle: t('navDevelopmentIndex'), aliases: 'hdi development indicators विकास' },
    { id: 'page:about', href: '/about', title: t('footerAbout'), subtitle: t('footerAbout'), aliases: 'about methodology sources के बारे में' },
  ], [t, i18n.language]);

  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
      setOpen(true);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, []);

  function ensureIndex() {
    if (records) return;
    loadSearchIndex().then(setRecords).catch(() => setRecords([]));
  }

  const hits = useMemo(
    () => searchSite(records ?? [], query, pages, isHi, t('searchReportsFor', { query: query.trim() })),
    [records, query, pages, isHi, t],
  );

  useEffect(() => {
    setActive(0);
  }, [query]);

  function go(hit: SearchHit) {
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
    navigate(hit.href);
  }

  function onKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      if (query) {
        setQuery('');
      } else {
        setOpen(false);
        inputRef.current?.blur();
      }
      return;
    }
    if (e.key === 'ArrowDown' && hits.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % hits.length);
      return;
    }
    if (e.key === 'ArrowUp' && hits.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i - 1 + hits.length) % hits.length);
      return;
    }
    if (e.key === 'Enter') {
      const hit = hits[active] ?? hits[0];
      if (hit) {
        e.preventDefault();
        go(hit);
      }
    }
  }

  const showList = open && query.trim().length > 0;
  const grouped = KIND_ORDER
    .map((kind) => ({ kind, items: hits.filter((hit) => hit.kind === kind) }))
    .filter((group) => group.items.length > 0);

  return (
    <div ref={rootRef} className="relative flex-1 min-w-0 max-w-[16rem] sm:max-w-[18rem] lg:flex-none lg:w-36 xl:w-56 ml-auto">
      <label htmlFor="site-search" className="sr-only">{t('searchLabel')}</label>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
      <input
        ref={inputRef}
        id="site-search"
        type="text"
        inputMode="search"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && hits[active] ? `${listId}-${hits[active].id}` : undefined}
        value={query}
        placeholder={t('searchAllPlaceholder')}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          ensureIndex();
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-8 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-testid="input-site-search"
      />
      {query ? (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            inputRef.current?.focus();
          }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground"
          aria-label={t('searchClear')}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden xl:inline-flex h-5 min-w-5 items-center justify-center rounded border border-border px-1 text-[10px] font-medium text-muted-foreground">
          /
        </kbd>
      )}

      {showList && (
        <div
          id={listId}
          role="listbox"
          aria-label={t('searchLabel')}
          className="absolute right-0 top-[calc(100%+6px)] z-[60] w-[min(22rem,calc(100vw-1.25rem))] rounded-lg border border-border bg-card shadow-lg overflow-hidden"
        >
          {hits.length > 0 ? (
            <div className="max-h-80 overflow-y-auto py-1">
              {grouped.map((group) => (
                <div key={group.kind} role="group" aria-label={t(GROUP_KEYS[group.kind])}>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {t(GROUP_KEYS[group.kind])}
                  </div>
                  {group.items.map((hit) => {
                    const index = hits.indexOf(hit);
                    const selected = index === active;
                    return (
                      <button
                        key={hit.id}
                        id={`${listId}-${hit.id}`}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(hit)}
                        className={cn(
                          'flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors',
                          selected ? 'bg-muted text-foreground' : 'hover:bg-muted/70',
                        )}
                      >
                        <KindIcon kind={hit.kind} />
                        <span className="min-w-0">
                          <span className="block text-[13px] font-medium leading-snug truncate">{hit.title}</span>
                          {hit.subtitle ? (
                            <span className="block text-[11px] text-muted-foreground truncate">{hit.subtitle}</span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : records === null ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">{t('searchLoading')}</div>
          ) : (
            <div className="px-3 py-3 text-sm text-muted-foreground">{t('searchNoResults')}</div>
          )}
        </div>
      )}
    </div>
  );
}
