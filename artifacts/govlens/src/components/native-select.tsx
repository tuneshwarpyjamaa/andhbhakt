import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type NativeSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  onValueChange: (value: string) => void;
};

export function NativeSelect({
  className,
  onValueChange,
  children,
  ...props
}: NativeSelectProps) {
  return (
    <select
      {...props}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        'h-8 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary/30',
        className,
      )}
    >
      {children}
    </select>
  );
}
