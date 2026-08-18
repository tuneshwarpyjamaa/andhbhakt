import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatItem = {
  icon: LucideIcon;
  label: string;
  value: string;
};

export function StatStrip({ items, className }: { items: StatItem[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <ul
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2',
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={`${item.label}-${item.value}`}
            className="flex items-start gap-2.5 min-h-12 rounded-md border border-border bg-muted/40 px-3 py-2 lg:min-w-[10.5rem]"
          >
            <Icon className="w-4 h-4 mt-0.5 text-brand shrink-0" aria-hidden />
            <div className="min-w-0">
              <div className="type-meta uppercase tracking-wide">{item.label}</div>
              <div className="text-sm font-semibold text-foreground leading-snug truncate">{item.value}</div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
