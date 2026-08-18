import { useQuery } from '@tanstack/react-query';

export function scoreColor(score: number) {
  if (score >= 75) return { ring: '#22c55e', text: 'text-green-500', bar: 'bg-green-500', bg: 'bg-green-500/10', label: 'Good', labelHi: 'अच्छा' };
  if (score >= 55) return { ring: '#f59e0b', text: 'text-amber-500', bar: 'bg-amber-500', bg: 'bg-amber-500/10', label: 'Moderate', labelHi: 'मध्यम' };
  if (score >= 35) return { ring: '#f97316', text: 'text-orange-500', bar: 'bg-orange-500', bg: 'bg-orange-500/10', label: 'Concerning', labelHi: 'चिंताजनक' };
  return { ring: '#ef4444', text: 'text-red-500', bar: 'bg-red-500', bg: 'bg-red-500/10', label: 'Critical', labelHi: 'गंभीर' };
}

export const ACCOUNTABILITY_LABEL_HI: Record<string, string> = {
  Transparency: 'पारदर्शिता',
  "Officials' Legal Integrity": 'अधिकारियों की कानूनी ईमानदारी',
  Governance: 'शासन',
  Implementation: 'क्रियान्वयन',
  Accountability: 'जवाबदेही',
  'Monetary Management': 'वित्तीय प्रबंधन',
};

export const SEVERITY_META = {
  critical: { label: 'Critical', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-200 dark:border-red-800' },
  major: { label: 'Major', dot: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-200 dark:border-orange-800' },
  minor: { label: 'Minor', dot: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/40', border: 'border-yellow-200 dark:border-yellow-800' },
};

const MONTHS_HI: Record<string, string> = {
  January: 'जनवरी', February: 'फरवरी', March: 'मार्च', April: 'अप्रैल',
  May: 'मई', June: 'जून', July: 'जुलाई', August: 'अगस्त',
  September: 'सितंबर', October: 'अक्टूबर', November: 'नवंबर', December: 'दिसंबर',
};

export function hiDate(date: string): string {
  return date.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g,
    (m) => MONTHS_HI[m] ?? m);
}

export function useWikiPhoto(wikiTitle?: string) {
  return useQuery<string | null>({
    queryKey: ['wiki-photo', wikiTitle],
    enabled: !!wikiTitle,
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=thumbnail&pithumbsize=200&titles=${encodeURIComponent(wikiTitle!)}&origin=*`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const pages = data?.query?.pages ?? {};
      const page = Object.values(pages)[0] as { thumbnail?: { source?: string } };
      return page?.thumbnail?.source ?? null;
    },
  });
}

export function MemberAvatar({ name, wikiTitle, size = 'md' }: { name: string; wikiTitle?: string; size?: 'sm' | 'md' | 'lg' }) {
  const { data: photoUrl } = useWikiPhoto(wikiTitle);
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const dim = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'md' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${dim} rounded-full flex-shrink-0 object-cover object-top border-2 border-border bg-muted`}
        loading={size === 'lg' ? 'eager' : 'lazy'}
        decoding="async"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full flex-shrink-0 bg-primary/10 text-primary font-bold flex items-center justify-center border-2 border-border`}>
      {initials}
    </div>
  );
}

export function ScoreBar({ label, score, caption, colorClass }: { label: string; score: number; caption: string; colorClass: string }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[10px] text-muted-foreground w-14 flex-shrink-0">{label}</span>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${score}%` }} />
        </div>
        <span className="text-[10px] font-mono font-semibold w-6 text-right flex-shrink-0">{score}</span>
        <span className="text-[10px] text-muted-foreground flex-shrink-0 hidden sm:inline">{caption}</span>
      </div>
      <span className="text-[10px] text-muted-foreground pl-16 sm:hidden leading-snug">{caption}</span>
    </div>
  );
}
