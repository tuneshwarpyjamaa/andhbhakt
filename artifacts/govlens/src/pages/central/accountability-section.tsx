import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, ShieldCheck, Scale } from 'lucide-react';
import { TRANSPARENCY_SCORE, CABINET_INTEGRITY_SCORE, GOVERNANCE_SCORE } from '@/lib/scoring';
import { ACCOUNTABILITY_LABEL_HI, scoreColor } from './shared';
import type { AccountabilityRating } from './types';

const ACCOUNTABILITY: AccountabilityRating[] = [
  {
    key: 'transparency',
    label: 'Transparency',
    score: TRANSPARENCY_SCORE,
    icon: Eye,
    methodology:
      `Formula-derived score (see src/lib/scoring.ts). Weighted composite: RSF Press Freedom Index 2024 (31.28/100, rank 159/180 — Reporters Without Borders) × 40% + RTI/CIC effectiveness proxy (30/100) × 35% + Freedom House Internet Freedom 2024 (50/100, "Not Free") × 25%. RTI proxy basis: CIC vacancy 55% (6 of 11 posts unfilled, PIB Nov 2023); 3.2+ lakh pending RTI appeals across 27 commissions (SNS Report Card 2023-24); PMO rejects >90% of RTI requests without citing a valid exemption clause (The Hindu, Feb 2024; CIC annual report analysis). Computed: 31.28×0.40 + 30×0.35 + 50×0.25 = 35.5 → ${TRANSPARENCY_SCORE}.`,
  },
  {
    key: 'officialsIntegrity',
    label: "Officials' Legal Integrity",
    score: CABINET_INTEGRITY_SCORE,
    icon: ShieldCheck,
    methodology:
      `Formula-derived score (see src/lib/scoring.ts). Source: ADR/National Election Watch — Analysis of 71 Union Ministers, 11 Jun 2024. Inputs: 19/71 (27%) declared serious criminal cases (IPC ≥5 yrs); 28/71 (39%) declared any criminal cases. Formula: 100 − (serious% × 1.5) − ((criminal% − serious%) × 0.7). Rationale: serious charges penalise at 2× the rate of minor ones. Computed: 100 − 27×1.5 − 12×0.7 = 51.1 → ${CABINET_INTEGRITY_SCORE}. Source: ADR/myneta.info affidavit database.`,
  },
  {
    key: 'governance',
    label: 'Governance',
    score: GOVERNANCE_SCORE,
    icon: Scale,
    methodology:
      `Formula-derived score (see src/lib/scoring.ts). Weighted composite of four external governance indices: Transparency International CPI 2024 (39/100, rank 93/180) × 30% + WJP Rule of Law Index 2024 (rank 79/142 → percentile 44.4) × 25% + V-Dem Liberal Democracy Index 2024 (0.299 → 29.9/100) × 25% + World Bank Government Effectiveness 2022 (57th percentile) × 20%. Computed: 11.7 + 11.1 + 7.5 + 11.4 = 41.7 → ${GOVERNANCE_SCORE}.`,
  },
];

function ScoreRing({ score, icon: Icon, label, selected, onClick }: {
  score: number; icon: React.ElementType; label: string; selected: boolean; onClick: () => void;
}) {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const R = 28; const C = 2 * Math.PI * R; const filled = (score / 100) * C;
  const sc = scoreColor(score);
  const { ring, text, bg } = sc;
  return (
    <button
      onClick={onClick}
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
        {isHi ? (ACCOUNTABILITY_LABEL_HI[label] ?? label) : label}
      </span>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>
        {isHi ? sc.labelHi : sc.label}
      </span>
    </button>
  );
}

export default function AccountabilitySection() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const active = ACCOUNTABILITY.find(r => r.key === activeKey) ?? null;
  return (
    <div className="px-4 py-4 border-b border-border">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        {t('accountabilityRatings')}
      </p>
      <div className="grid grid-cols-3 gap-1 mb-1">
        {ACCOUNTABILITY.map(r => (
          <ScoreRing
            key={r.key}
            score={r.score}
            icon={r.icon}
            label={r.label}
            selected={activeKey === r.key}
            onClick={() => setActiveKey(prev => prev === r.key ? null : r.key)}
          />
        ))}
      </div>
      {active && (
        <div className="mt-2 rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-xs font-semibold text-foreground mb-1">{isHi ? (ACCOUNTABILITY_LABEL_HI[active.label] ?? active.label) : active.label} — {t('ratingMethodology')}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{active.methodology}</p>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground/50 text-center mt-2 font-mono">{t('tapRingForMethodology')}</p>
    </div>
  );
}
