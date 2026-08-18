import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ExternalLink, TrendingUp, IndianRupee, FileSearch } from 'lucide-react';
import { ALL_MANIFESTOS } from './manifesto-data';
import { scoreColor } from './shared';
import type { PromiseStatus } from './types';

const PROMISE_STATUS_META: Record<PromiseStatus, { label: string; labelHi: string; dot: string; text: string; bg: string; border: string }> = {
  implemented:    { label: 'Implemented',   labelHi: 'लागू',         dot: 'bg-green-500',           text: 'text-green-600 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-950/40',   border: 'border-green-200 dark:border-green-800'   },
  partial:        { label: 'Partial / CAG Flagged', labelHi: 'आंशिक / CAG चिह्नित', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40',   border: 'border-amber-200 dark:border-amber-800'   },
  'in-progress':  { label: 'In Progress',  labelHi: 'प्रगति में',    dot: 'bg-blue-500',            text: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-950/40',     border: 'border-blue-200 dark:border-blue-800'     },
  'not-fulfilled':{ label: 'Not Fulfilled', labelHi: 'पूरा नहीं',   dot: 'bg-red-500',             text: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-950/40',       border: 'border-red-200 dark:border-red-800'       },
  pending:        { label: 'Pending',       labelHi: 'लंबित',        dot: 'bg-muted-foreground/40', text: 'text-muted-foreground',               bg: 'bg-muted/30',                         border: 'border-border'                            },
};



export default function ManifestoSection() {
  const { i18n } = useTranslation();
  const [activeYear, setActiveYear] = useState<number>(2024);
  const [open, setOpen] = useState(false);
  const [activeTermDim, setActiveTermDim] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PromiseStatus | null>(null);
  const [page, setPage] = useState(0);
  const isHi = i18n.language === 'hi';

  const manifesto = ALL_MANIFESTOS.find(m => m.year === activeYear)!;
  const allPromises = manifesto.categories.flatMap(c =>
    c.promises.map(p => ({ ...p, categoryName: c.name, categoryNameHi: c.nameHi }))
  );

  // Overall stats across ALL years for the header roll-up pills
  const allYearPromises = ALL_MANIFESTOS.flatMap(m => m.categories.flatMap(c => c.promises));
  const totalAll    = allYearPromises.length;
  const implAll     = allYearPromises.filter(p => p.status === 'implemented').length;
  const partialAll  = allYearPromises.filter(p => p.status === 'partial').length;
  const inProgAll   = allYearPromises.filter(p => p.status === 'in-progress').length;
  const failAll     = allYearPromises.filter(p => p.status === 'not-fulfilled').length;

  // Per-term scores (based on the active manifesto year)
  const termTotal     = allPromises.length;
  const termImpl      = allPromises.filter(p => p.status === 'implemented').length;
  const termPartial   = allPromises.filter(p => p.status === 'partial').length;
  const termInProg    = allPromises.filter(p => p.status === 'in-progress').length;
  const termFail      = allPromises.filter(p => p.status === 'not-fulfilled').length;
  const termPending   = allPromises.filter(p => p.status === 'pending').length;
  const implScore     = termTotal > 0 ? Math.round((termImpl + (termPartial + termInProg) * 0.5) / termTotal * 100) : 0;

  // Per-term monetary management (CAG-flagged ₹ amounts on this manifesto's promises)
  const termFlaggedCrore   = allPromises.reduce((s, p) => s + (p.cagAmountCrore ?? 0), 0);
  // National-scale formula: coefficient 15 (vs 30 for state-level) — proportionate to Union Budget scale
  const moneyScore         = termFlaggedCrore === 0
    ? 100
    : Math.max(0, Math.round(100 - 15 * Math.log10(termFlaggedCrore / 10 + 1)));
  const termFlaggedPromises = allPromises.filter(p => p.cagAmountCrore);

  // Term rating dimensions — computed per active year
  const termDims = [
    {
      key: 'implementation', icon: TrendingUp,
      label: 'Implementation', labelHi: 'क्रियान्वयन',
      score: implScore,
      rationale: `Weighted delivery rate across ${termTotal} tracked BJP ${activeYear} manifesto promises: implemented = 1.0 pt, partial / in-progress = 0.5 pt, not-fulfilled / pending = 0 pt. Breakdown: ${termImpl} implemented, ${termPartial} partial, ${termInProg} in-progress, ${termFail} not fulfilled${termPending > 0 ? `, ${termPending} pending` : ''}. Score = (${termImpl} + ${termPartial + termInProg}×0.5) ÷ ${termTotal} × 100 = ${implScore}. Cross-verified against CAG published reports and independent sources.`,
      rationaleHi: `${termTotal} BJP ${activeYear} संकल्प पत्र वादों की भारित डिलीवरी दर: लागू = 1.0, आंशिक/प्रगति में = 0.5, पूरा नहीं/लंबित = 0। विवरण: ${termImpl} लागू, ${termPartial} आंशिक, ${termInProg} प्रगति में, ${termFail} पूरा नहीं${termPending > 0 ? `, ${termPending} लंबित` : ''}। स्कोर = (${termImpl} + ${termPartial + termInProg}×0.5) ÷ ${termTotal} × 100 = ${implScore}। CAG रिपोर्टों और स्वतंत्र स्रोतों से सत्यापित।`,
      sources: `BJP Manifesto ${activeYear} · CAG of India · ADR / myneta.info`,
      sourcesHi: `BJP संकल्प पत्र ${activeYear} · CAG of India · ADR / myneta.info`,
    },
    {
      key: 'money', icon: IndianRupee,
      label: 'Monetary Management', labelHi: 'वित्तीय प्रबंधन',
      score: moneyScore,
      rationale: termFlaggedCrore === 0
        ? `No specific CAG-flagged monetary amounts found in tracked BJP ${activeYear} manifesto promises. Score defaults to 100 until CAG audit findings with rupee amounts are linked.`
        : `CAG-flagged rupee amounts across ${termFlaggedPromises.length} promise${termFlaggedPromises.length > 1 ? 's' : ''}: ₹${termFlaggedCrore.toLocaleString('en-IN')} crore total (${termFlaggedPromises.map(p => { const lbl = p.promise.length > 40 ? p.promise.slice(0, 40) + '…' : p.promise; return `₹${(p.cagAmountCrore!).toLocaleString('en-IN')} cr — ${lbl}`; }).join('; ')}). National-scale log penalty: 100 − 15×log₁₀(${termFlaggedCrore}/10 + 1) = ${moneyScore} (coefficient halved vs state formula to be proportionate to Union Budget scale). Includes funds disbursed without utilisation certificates, misclassified expenditure, and amounts paid without construction evidence.`,
      rationaleHi: termFlaggedCrore === 0
        ? `BJP ${activeYear} संकल्प पत्र वादों में CAG द्वारा चिह्नित कोई विशेष राशि नहीं मिली। स्कोर 100 डिफ़ॉल्ट है।`
        : `${termFlaggedPromises.length} वादों में CAG-चिह्नित राशि: ₹${termFlaggedCrore.toLocaleString('en-IN')} करोड़ कुल। राष्ट्रीय स्तर लॉग-स्केल दंड: 100 − 15×log₁₀(${termFlaggedCrore}/10 + 1) = ${moneyScore} (केंद्रीय बजट अनुपात में राज्य फॉर्मूले का आधा गुणांक)। उपयोगिता प्रमाण पत्र बिना, गलत वर्गीकृत व्यय और निर्माण बिना भुगतान शामिल।`,
      sources: `CAG of India published audit reports · BJP Manifesto ${activeYear}`,
      sourcesHi: `CAG of India प्रकाशित ऑडिट रिपोर्टें · BJP संकल्प पत्र ${activeYear}`,
    },
  ];

  // Per-year stats for tab badges
  const yearStats = ALL_MANIFESTOS.map(m => {
    const ps = m.categories.flatMap(c => c.promises);
    return {
      year: m.year,
      total: ps.length,
      impl: ps.filter(p => p.status === 'implemented').length,
      partial: ps.filter(p => p.status === 'partial').length,
      fail: ps.filter(p => p.status === 'not-fulfilled').length,
    };
  });

  // Per-manifesto breakdown chips
  const chips = ([
    { status: 'implemented'   as PromiseStatus, count: allPromises.filter(p => p.status === 'implemented').length },
    { status: 'partial'       as PromiseStatus, count: allPromises.filter(p => p.status === 'partial').length },
    { status: 'in-progress'   as PromiseStatus, count: allPromises.filter(p => p.status === 'in-progress').length },
    { status: 'not-fulfilled' as PromiseStatus, count: allPromises.filter(p => p.status === 'not-fulfilled').length },
    { status: 'pending'       as PromiseStatus, count: allPromises.filter(p => p.status === 'pending').length },
  ] as { status: PromiseStatus; count: number }[]).filter(c => c.count > 0);

  return (
    <div className="px-4 py-4 border-t-0">
      {/* Section header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {isHi ? 'भाजपा चुनावी वादे (2014–2024)' : 'BJP Election Promises · 2014–2024'}
        </p>
        <a
          href={manifesto.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors flex-shrink-0"
        >
          {isHi ? 'स्रोत' : 'Source'} <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Overall roll-up */}
      <p className="text-[11px] text-muted-foreground mb-3">
        {isHi
          ? `तीन घोषणापत्रों में ${totalAll} प्रमुख वादों का स्वतंत्र स्रोतों और CAG रिपोर्टों से मिलान।`
          : `${totalAll} key promises across three manifestos cross-verified with CAG reports and independent sources.`}
      </p>
      <div className="flex gap-2 flex-wrap mb-4 text-[11px] font-semibold">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />{implAll} {isHi ? 'लागू' : 'Implemented'}
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{partialAll} {isHi ? 'आंशिक' : 'Partial'}
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{failAll} {isHi ? 'पूरा नहीं' : 'Not Fulfilled'}
        </span>
      </div>

      {/* ── Term Rating ──────────────────────────────────────────────────── */}
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          {isHi ? `कार्यकाल रेटिंग · ${activeYear}` : `Term Rating · ${activeYear}`}
        </p>
        {(() => {
          const activeDim = termDims.find(d => d.key === activeTermDim) ?? null;
          return (
            <>
              <div className="grid grid-cols-2 gap-1 mb-1">
                {termDims.map(dim => {
                  const { score, icon: Icon, label, labelHi } = dim;
                  const R = 28; const C = 2 * Math.PI * R; const filled = (score / 100) * C;
                  const { ring, text, bg } = scoreColor(score);
                  const sc = scoreColor(score);
                  const selected = activeTermDim === dim.key;
                  return (
                    <button
                      key={dim.key}
                      onClick={() => setActiveTermDim(prev => prev === dim.key ? null : dim.key)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 focus:outline-none ${
                        selected ? `${bg} ring-2 ring-offset-2 ring-offset-background` : 'hover:bg-muted'
                      }`}
                      style={selected ? { '--tw-ring-color': ring } as React.CSSProperties : undefined}
                    >
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="absolute inset-0 -rotate-90" width="64" height="64" viewBox="0 0 64 64">
                          <circle cx="32" cy="32" r={R} fill="none" stroke="currentColor" strokeWidth="5" className="text-muted" />
                          <circle cx="32" cy="32" r={R} fill="none" stroke={ring} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${filled} ${C - filled}`} />
                        </svg>
                        <Icon className={`w-5 h-5 ${text} relative z-10`} />
                      </div>
                      <span className={`text-xl font-bold leading-none ${text}`}>{score}</span>
                      <span className="text-[11px] text-muted-foreground text-center leading-tight">
                        {isHi ? labelHi : label}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>
                        {isHi ? sc.labelHi : sc.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {activeDim && (
                <div className="mt-2 rounded-lg border border-border bg-muted/40 px-4 py-3">
                  <p className="text-xs font-semibold text-foreground mb-1">
                    {isHi ? activeDim.labelHi : activeDim.label} — {isHi ? 'कार्यप्रणाली' : 'Methodology'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isHi ? activeDim.rationaleHi : activeDim.rationale}
                  </p>
                  {activeDim.key === 'money' && termFlaggedPromises.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {isHi ? 'CAG ऑडिट स्रोत' : 'CAG Audit Sources'}
                      </p>
                      {termFlaggedPromises.map((p, i) => (
                        <div key={i} className="flex items-start justify-between gap-2 text-[11px]">
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-destructive tabular-nums">
                              ₹{(p.cagAmountCrore!).toLocaleString('en-IN')} cr
                            </span>
                            <span className="text-muted-foreground ml-1.5 truncate">
                              {p.promise.length > 45 ? p.promise.slice(0, 45) + '…' : p.promise}
                            </span>
                          </div>
                          {p.cagSource ? (
                            <a
                              href={p.cagSource}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 flex items-center gap-0.5 text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                              {isHi ? 'रिपोर्ट' : 'Report'} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="flex-shrink-0 text-muted-foreground/50 text-[10px]">—</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground/50 font-mono mt-2 leading-tight">
                    {isHi ? activeDim.sourcesHi : activeDim.sources}
                  </p>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground/50 text-center mt-2 font-mono">
                {isHi ? 'कार्यप्रणाली के लिए रिंग टैप करें' : 'Tap a ring for methodology'}
              </p>
            </>
          );
        })()}
      </div>

      {/* Year tabs */}
      <div className="flex gap-1 mb-4 border-b border-border pb-2">
        {yearStats.map(ys => (
          <button
            key={ys.year}
            onClick={() => { setActiveYear(ys.year); setOpen(true); setStatusFilter(null); setPage(0); }}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeYear === ys.year
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {ys.year}
          </button>
        ))}
      </div>

      {/* Active manifesto subtitle */}
      <p className="text-[11px] text-muted-foreground/70 italic mb-3">
        "{isHi ? manifesto.taglineHi : manifesto.tagline}"
      </p>

      {/* Status filter chips */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        <button
          onClick={() => { setStatusFilter(null); setPage(0); }}
          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
            statusFilter === null
              ? 'bg-foreground text-background border-foreground'
              : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
          }`}
        >
          {isHi ? `सभी (${allPromises.length})` : `All (${allPromises.length})`}
        </button>
        {chips.map(c => {
          const sm = PROMISE_STATUS_META[c.status];
          const active = statusFilter === c.status;
          return (
            <button
              key={c.status}
              onClick={() => { setStatusFilter(active ? null : c.status); setPage(0); }}
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
                active
                  ? `${sm.bg} ${sm.border} ${sm.text} ring-1 ring-offset-1 ring-offset-background`
                  : `bg-muted/40 border-border text-muted-foreground hover:text-foreground`
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
              {c.count} {isHi ? sm.labelHi : sm.label}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <FileSearch className="w-4 h-4" />
        {open
          ? <><ChevronUp className="w-4 h-4" />{isHi ? 'छुपाएं' : 'Hide promises'}</>
          : <><ChevronDown className="w-4 h-4" />{isHi ? `वादे देखें (${allPromises.length})` : `Browse ${activeYear} promises (${allPromises.length})`}</>
        }
      </button>

      {open && (() => {
        const PAGE_SIZE = 10;
        const filtered = statusFilter ? allPromises.filter(p => p.status === statusFilter) : allPromises;
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        const safePage = Math.min(page, totalPages - 1);
        const pageItems = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

        const getPaginationItems = (): (number | null)[] => {
          if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
          const set = new Set<number>();
          set.add(0);
          set.add(totalPages - 1);
          for (let i = Math.max(0, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) set.add(i);
          const sorted = Array.from(set).sort((a, b) => a - b);
          const result: (number | null)[] = [];
          sorted.forEach((pg, idx) => {
            if (idx > 0 && pg - sorted[idx - 1] > 1) result.push(null);
            result.push(pg);
          });
          return result;
        };

        return (
          <div className="mt-4 flex flex-col gap-3">
            {/* Count line */}
            <p className="text-[10px] text-muted-foreground/60 font-mono">
              {isHi
                ? `${filtered.length} वादे · पृष्ठ ${safePage + 1}/${totalPages}`
                : `${filtered.length} promise${filtered.length !== 1 ? 's' : ''} · page ${safePage + 1} of ${totalPages}`}
            </p>

            {/* Promise cards */}
            {pageItems.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-6 text-center">
                {isHi ? 'इस फ़िल्टर में कोई वादे नहीं' : 'No promises match this filter.'}
              </p>
            ) : pageItems.map((p, i) => {
              const sm = PROMISE_STATUS_META[p.status];
              return (
                <div key={safePage * PAGE_SIZE + i} className={`rounded-lg border px-4 py-3 flex flex-col gap-1.5 ${sm.bg} ${sm.border}`}>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${sm.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sm.dot} flex-shrink-0`} />
                      {isHi ? sm.labelHi : sm.label}
                    </span>
                    <span className="text-[9px] font-medium text-muted-foreground/70 bg-muted/60 px-2 py-0.5 rounded-full truncate max-w-[140px]">
                      {isHi ? p.categoryNameHi : p.categoryName}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {isHi ? p.promiseHi : p.promise}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                    {isHi ? p.noteHi : p.note}
                  </p>
                  {p.cagVerdict && (
                    <div className="mt-1 rounded-md bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 px-3 py-2">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-0.5">CAG Verdict</p>
                      <p className="text-[10px] text-orange-800 dark:text-orange-300 leading-relaxed">
                        {isHi ? (p.cagVerdictHi ?? p.cagVerdict) : p.cagVerdict}
                      </p>
                      {p.cagSource && (
                        <a href={p.cagSource} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors underline underline-offset-2">
                          {isHi ? 'CAG रिपोर्ट देखें →' : 'View CAG Report →'}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => setPage(pg => Math.max(0, pg - 1))}
                  disabled={safePage === 0}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  {isHi ? 'पिछला' : 'Prev'}
                </button>
                <div className="flex items-center gap-0.5">
                  {getPaginationItems().map((pg, idx) =>
                    pg === null ? (
                      <span key={`e${idx}`} className="w-5 text-center text-[10px] text-muted-foreground select-none">…</span>
                    ) : (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`w-6 h-6 text-[10px] font-semibold rounded transition-colors ${
                          pg === safePage
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {pg + 1}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => setPage(pg => Math.min(totalPages - 1, pg + 1))}
                  disabled={safePage === totalPages - 1}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {isHi ? 'अगला' : 'Next'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground/50 font-mono">
                {isHi
                  ? `स्रोत: BJP ${activeYear} संकल्प पत्र · Reuters · CAG of India`
                  : `Sources: BJP ${activeYear} Manifesto · Reuters · CAG of India`}
              </p>
              <a href={manifesto.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors">
                {isHi ? 'पूरा दस्तावेज़' : 'Full manifesto'} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
