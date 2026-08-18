import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import type { ChartConfig } from './types';

export default function HistoricalChart({ data, series, label, unit, source, remarks, yearLabel = 'FY', invertAxis = false, yDomain }: ChartConfig) {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const isMulti = !!series && series.length > 1;

  const allVals = isMulti
    ? data.flatMap(d => series!.map(s => d[s.key] ?? 0))
    : data.map(d => d.value ?? 0);
  const hasNeg = allVals.some(v => v < 0);
  const rawMin = Math.min(...allVals);
  const rawMax = Math.max(...allVals);
  const min = yDomain ? yDomain[0] : hasNeg ? Math.floor(rawMin) - 1 : 0;
  const max = yDomain ? yDomain[1] : Math.ceil(rawMax) + 2;
  const singleFill = (val: number) => (val < 0 ? '#ef4444' : '#f59e0b');

  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/10 overflow-hidden">
      <div className="px-3 pt-3 pb-1 flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold text-foreground">{label}</p>
        {isMulti ? (
          <div className="flex gap-3 shrink-0">
            {series!.map(s => (
              <span key={s.key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ background: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">{unit}</span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 0 }} barCategoryGap="20%" barGap={2}>
          <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.06} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 9, fill: 'currentColor', opacity: 0.5 }}
            axisLine={false}
            tickLine={false}
            interval={data.length <= 15 ? 0 : 4}
          />
          <YAxis
            domain={[min, max]}
            reversed={invertAxis}
            tick={{ fontSize: 9, fill: 'currentColor', opacity: 0.5 }}
            axisLine={false}
            tickLine={false}
            width={32}
            tickFormatter={v => `${v}${isMulti ? '' : unit === '%' ? '%' : ''}`}
          />
          <Tooltip
            cursor={{ fill: 'currentColor', opacity: 0.04 }}
            contentStyle={{
              fontSize: 11,
              borderRadius: 8,
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
            }}
            formatter={(val: number, name: string) => {
              const seriesLabel = series?.find(s => s.key === name)?.label ?? name;
              return [`${val}${unit}`, seriesLabel];
            }}
            labelFormatter={(yr: number) => `${yearLabel}${yr}`}
          />
          {hasNeg && (
            <ReferenceLine y={0} stroke="currentColor" strokeOpacity={0.3} strokeDasharray="3 3" />
          )}
          {isMulti
            ? series!.map(s => (
                <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[2, 2, 0, 0]} />
              ))
            : (
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={singleFill(entry.value)} />
                ))}
              </Bar>
            )
          }
        </BarChart>
      </ResponsiveContainer>

      {remarks && remarks.length > 0 && (
        <div className="px-3 pb-3 flex flex-col gap-1.5 mt-1">
          {remarks.map(r => (
            <div key={r.years} className="flex gap-2">
              <span className="text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400 shrink-0 w-14">{r.years}</span>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{isHi && r.noteHi ? r.noteHi : r.note}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/40 font-mono px-3 pb-2">
        Source: {source}
      </p>
    </div>
  );
}
