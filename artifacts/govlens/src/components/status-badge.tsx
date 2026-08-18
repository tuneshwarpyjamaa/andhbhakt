import type { LucideIcon } from 'lucide-react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Flag,
  Megaphone,
  RefreshCw,
  Rocket,
  ShieldAlert,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type StatusKind =
  | 'critical'
  | 'major'
  | 'minor'
  | 'unaudited'
  | 'on_track'
  | 'off_track'
  | 'at_risk'
  | 'achievement'
  | 'update'
  | 'launch'
  | 'target';

const TONE: Record<StatusKind, { className: string; Icon: LucideIcon; labelKey: string }> = {
  critical: {
    className:
      'bg-[hsl(var(--severity-critical)/0.12)] text-[hsl(var(--severity-critical))] border-[hsl(var(--severity-critical)/0.35)]',
    Icon: AlertOctagon,
    labelKey: 'severityCritical',
  },
  major: {
    className:
      'bg-[hsl(var(--severity-major)/0.12)] text-[hsl(var(--severity-major))] border-[hsl(var(--severity-major)/0.35)]',
    Icon: AlertTriangle,
    labelKey: 'severityMajor',
  },
  minor: {
    className:
      'bg-[hsl(var(--severity-minor)/0.12)] text-[hsl(var(--severity-minor))] border-[hsl(var(--severity-minor)/0.35)]',
    Icon: ShieldAlert,
    labelKey: 'severityMinor',
  },
  unaudited: {
    className: 'bg-muted text-meta border-border',
    Icon: CircleDashed,
    labelKey: 'severityUnaudited',
  },
  on_track: {
    className:
      'bg-[hsl(var(--status-ok)/0.12)] text-[hsl(var(--status-ok))] border-[hsl(var(--status-ok)/0.35)]',
    Icon: CheckCircle2,
    labelKey: 'verdictOnTrack',
  },
  off_track: {
    className:
      'bg-[hsl(var(--severity-major)/0.12)] text-[hsl(var(--severity-major))] border-[hsl(var(--severity-major)/0.35)]',
    Icon: AlertTriangle,
    labelKey: 'verdictOffTrack',
  },
  at_risk: {
    className:
      'bg-[hsl(var(--severity-critical)/0.12)] text-[hsl(var(--severity-critical))] border-[hsl(var(--severity-critical)/0.35)]',
    Icon: AlertOctagon,
    labelKey: 'verdictAtRisk',
  },
  achievement: {
    className: 'bg-secondary text-secondary-foreground border-border',
    Icon: Megaphone,
    labelKey: 'claimTypeAchievement',
  },
  update: {
    className: 'bg-muted text-meta border-border',
    Icon: RefreshCw,
    labelKey: 'claimTypeUpdate',
  },
  launch: {
    className: 'bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.3)]',
    Icon: Rocket,
    labelKey: 'claimTypeLaunch',
  },
  target: {
    className: 'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.28)]',
    Icon: Flag,
    labelKey: 'claimTypeTarget',
  },
};

export function StatusBadge({
  kind,
  className,
  label,
}: {
  kind: StatusKind;
  className?: string;
  label?: string;
}) {
  const { t } = useTranslation();
  const tone = TONE[kind] ?? TONE.update;
  const Icon = tone.Icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 h-6 px-2 rounded-md border text-[11px] font-semibold uppercase tracking-wide leading-none whitespace-nowrap',
        tone.className,
        className,
      )}
      data-testid={`badge-status-${kind}`}
    >
      <Icon className="w-3 h-3 shrink-0" aria-hidden />
      {label ?? t(tone.labelKey)}
    </span>
  );
}

export function verdictToStatus(verdict: string): StatusKind {
  if (verdict === 'on_track') return 'on_track';
  if (verdict === 'off_track') return 'off_track';
  if (verdict === 'critical') return 'at_risk';
  return 'unaudited';
}
