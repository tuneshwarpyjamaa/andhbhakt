import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface VerdictBadgeProps {
  verdict: 'on_track' | 'off_track' | 'critical' | 'unaudited';
  className?: string;
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const { t } = useTranslation();

  const styles = {
    on_track: 'bg-green-100 text-green-900 border-green-200',
    off_track: 'bg-amber-100 text-amber-900 border-amber-200',
    critical: 'bg-red-100 text-red-900 border-red-200',
    unaudited: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const labelKeys = {
    on_track: 'verdictOnTrack',
    off_track: 'verdictOffTrack',
    critical: 'verdictCritical',
    unaudited: 'verdictUnaudited',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold border',
        styles[verdict],
        className
      )}
      data-testid={`badge-verdict-${verdict}`}
    >
      {t(labelKeys[verdict])}
    </span>
  );
}
