import { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHiJson } from '@/lib/use-hi-json';
import { scoreColor } from './shared';
import { NATIONAL_INDICATORS } from './national-indicators-data';

const HistoricalChart = lazy(() => import('./historical-chart'));

interface NiHiStat { labelHi?: string; noteHi?: string }
interface NiHi { labels?: Record<string, string>; summaries?: Record<string, string>; stats?: Record<string, NiHiStat[]> }

export default function IndicatorsSection() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const niHi = useHiJson<NiHi>('national-indicators-hi', isHi) ?? {};
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const active = NATIONAL_INDICATORS.find(i => i.key === activeKey) ?? null;

  return (
    <div className="px-4 py-4 border-b border-border">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        {t('nationalIndicators')}
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 mb-1">
        {NATIONAL_INDICATORS.map(ind => {
          const { ring, text, bg, label, labelHi } = scoreColor(ind.score);
          const Icon = ind.icon;
          const R = 28; const C = 2 * Math.PI * R; const filled = (ind.score / 100) * C;
          const sel = activeKey === ind.key;
          return (
            <button
              key={ind.key}
              onClick={() => setActiveKey(prev => prev === ind.key ? null : ind.key)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 focus:outline-none ${
                sel ? `${bg} ring-2 ring-offset-2 ring-offset-background` : 'hover:bg-muted'
              }`}
              style={sel ? { '--tw-ring-color': ring } as React.CSSProperties : undefined}
            >
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="absolute inset-0 -rotate-90" width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r={R} fill="none" stroke="currentColor" strokeWidth="5" className="text-muted" />
                  <circle cx="32" cy="32" r={R} fill="none" stroke={ring} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${filled} ${C - filled}`} />
                </svg>
                <Icon className={`w-5 h-5 ${text} relative z-10`} />
              </div>
              <span className={`text-xl font-bold leading-none ${text}`}>{ind.score}</span>
              <span className="text-[11px] text-muted-foreground text-center leading-tight">{isHi ? (niHi.labels?.[ind.key] ?? ind.label) : ind.label}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>{isHi ? labelHi : label}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-sm font-semibold ${scoreColor(active.score).text}`}>{isHi ? (niHi.labels?.[active.key] ?? active.label) : active.label}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">{isHi ? (niHi.summaries?.[active.key] ?? active.summary) : active.summary}</p>

          <Suspense fallback={<div className="h-[170px] rounded-xl border border-border bg-muted/10 animate-pulse mt-3" />}>
            {active.charts?.map((chart, i) => (
              <HistoricalChart key={i} {...chart} />
            ))}
          </Suspense>

          <div className="flex flex-col gap-2 mt-3">
            {active.stats.map((stat, si) => {
              const hiStat = isHi ? (niHi.stats?.[active.key]?.[si] ?? {}) : {};
              return (
              <div key={stat.label} className="rounded-lg border border-border bg-muted/20 px-3.5 py-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{isHi ? (hiStat.labelHi ?? stat.label) : stat.label}</p>
                    {stat.note && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{isHi ? (hiStat.noteHi ?? stat.note) : stat.note}</p>}
                  </div>
                  {stat.trend && (
                    <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                      stat.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400' :
                      stat.trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {stat.trend === 'up' ? t('improving') : t('worsening')}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground/50 font-mono mt-1.5">{stat.source}</p>
              </div>
            ); })}
          </div>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground/50 text-center mt-3 font-mono">{t('tapRingForData')}</p>
    </div>
  );
}
