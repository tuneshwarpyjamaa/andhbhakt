import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface SeverityBadgeProps {
  severity: 'critical' | 'major' | 'minor' | 'unaudited' | null;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const { t } = useTranslation();
  if (!severity) {
    severity = 'unaudited';
  }

  const styles = {
    critical: 'bg-red-100 text-red-900 border-red-200',
    major: 'bg-amber-100 text-amber-900 border-amber-200',
    minor: 'bg-yellow-100 text-yellow-900 border-yellow-200',
    unaudited: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const labelKeys = {
    critical: 'severityCritical',
    major: 'severityMajor',
    minor: 'severityMinor',
    unaudited: 'severityUnaudited',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border',
        styles[severity],
        className
      )}
      data-testid={`badge-severity-${severity}`}
    >
      {t(labelKeys[severity])}
    </span>
  );
}
