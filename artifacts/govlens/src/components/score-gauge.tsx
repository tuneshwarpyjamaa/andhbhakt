import { StatusBadge, verdictToStatus } from '@/components/status-badge';
import { bandFromVerdict, type VerdictKey } from '@/lib/scheme-ui';
import { useTranslation } from 'react-i18next';

const START = 135;
const SWEEP = 270;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, sweep: number) {
  const end = start + sweep;
  const s = polar(cx, cy, r, start);
  const e = polar(cx, cy, r, end);
  const large = sweep > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

const BAND_COLOR: Record<'good' | 'off' | 'risk', string> = {
  good: 'hsl(var(--status-ok))',
  off: 'hsl(var(--severity-major))',
  risk: 'hsl(var(--severity-critical))',
};

const EXPLAINER: Record<VerdictKey, string> = {
  on_track: 'scoreExplainerOnTrack',
  off_track: 'scoreExplainerOffTrack',
  critical: 'scoreExplainerAtRisk',
  unaudited: 'scoreExplainerUnaudited',
};

export function ScoreGauge({
  score,
  verdict,
  label,
  explainer,
}: {
  score: number;
  verdict: string;
  label?: string;
  explainer?: string;
}) {
  const { t } = useTranslation();
  const v = (['on_track', 'off_track', 'critical', 'unaudited'].includes(verdict)
    ? verdict
    : 'unaudited') as VerdictKey;
  const band = bandFromVerdict(v, score);
  const color = BAND_COLOR[band];
  const clamped = Math.max(0, Math.min(100, score));
  const fillSweep = (clamped / 100) * SWEEP;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative w-[148px] h-[148px] shrink-0 mx-auto sm:mx-0" aria-hidden>
        <svg viewBox="0 0 148 148" className="w-full h-full">
          <path
            d={arcPath(74, 74, 56, START, SWEEP)}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {clamped > 0 && (
            <path
              d={arcPath(74, 74, 56, START, Math.max(fillSweep, 2))}
              fill="none"
              stroke={color}
              strokeWidth="14"
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span
            className="font-mono font-bold tabular-nums leading-none"
            style={{ color, fontSize: '2.75rem' }}
          >
            {Math.round(score)}
          </span>
          <span className="type-meta mt-1">{t('scoreDenominator')}</span>
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
          <p className="type-subhead">{label ?? t('accountabilityScore')}</p>
          <StatusBadge kind={verdictToStatus(v)} className="h-7 px-2.5 text-xs" />
        </div>
        <p className="sr-only">
          {t('accountabilityScore')} {Math.round(score)} {t('scoreDenominator')}
        </p>
        <p className="type-body text-meta max-w-xl">
          {t(EXPLAINER[v])}
        </p>
        {explainer && explainer !== t(EXPLAINER[v]) && (
          <p className="text-sm text-foreground/85 mt-2 max-w-xl">{explainer}</p>
        )}
      </div>
    </div>
  );
}
