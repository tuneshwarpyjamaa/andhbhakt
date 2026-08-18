import { Link } from 'wouter';

export type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-3">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && (
              <span aria-hidden="true" className="text-foreground/45">
                /
              </span>
            )}
            {item.href ? (
              <Link href={item.href} className="text-meta font-medium hover:text-foreground hover:underline underline-offset-2 truncate">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground font-semibold truncate">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
