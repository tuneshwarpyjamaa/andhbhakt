import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function SourceLink({
  href,
  label,
  className,
  testId,
}: {
  href: string;
  label?: string;
  className?: string;
  testId?: string;
}) {
  const { t } = useTranslation();
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('source-link', className)}
      data-testid={testId}
    >
      {label ?? t('source')}
      <ExternalLink className="w-3.5 h-3.5" aria-hidden />
    </a>
  );
}
