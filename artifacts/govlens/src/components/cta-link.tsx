import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function CtaLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn('cta', className)}>
      {children}
    </Link>
  );
}
