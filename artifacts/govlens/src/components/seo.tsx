import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import type { Crumb } from '@/components/breadcrumbs';

const SITE_URL = 'https://andhbhakt.org';
const SITE_NAME = 'AndhBhakt.org';
const DEFAULT_DESCRIPTION =
  "India's government accountability tracker — minister integrity scores, CAG audit findings vs government claims, state governance report cards, and global development rankings.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.jpg`;

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  crumbs?: Crumb[];
}

const organizationJsonLd = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#org`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: ['https://github.com/JCRYDER3/andhbhakt'],
};

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  ogImage = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
  crumbs,
}: SEOProps) {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const lang = isHi ? 'hi' : 'en';
  const ogLocale = isHi ? 'hi_IN' : 'en_IN';
  const altLocale = isHi ? 'en_IN' : 'hi_IN';

  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = `${SITE_URL}${path}`;
  const absImage = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  const graph: Record<string, unknown>[] = [
    { ...organizationJsonLd, inLanguage: lang },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      inLanguage: ['en', 'hi'],
      publisher: { '@id': `${SITE_URL}/#org` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/schemes?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  if (crumbs && crumbs.length > 0) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.label,
        item: c.href ? `${SITE_URL}${c.href}` : canonicalUrl,
      })),
    });
  }

  if (jsonLd) {
    const extra = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    graph.push(...extra.map((item) => ({ ...item, inLanguage: lang })));
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="hi" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={altLocale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@andhbhakt" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absImage} />

      <script type="application/ld+json">
        {JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}
      </script>
    </Helmet>
  );
}

export const websiteJsonLd = {
  '@type': 'WebPage',
  '@id': `${SITE_URL}/#home`,
  url: SITE_URL,
  name: `${SITE_NAME} — India's Government Accountability Tracker`,
  description: DEFAULT_DESCRIPTION,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#org` },
};

export function ministerJsonLd(name: string, title: string, slug: string) {
  return {
    '@type': 'Person',
    name,
    jobTitle: title,
    url: `${SITE_URL}/minister/${slug}`,
    memberOf: {
      '@type': 'GovernmentOrganization',
      name: 'Government of India',
    },
  };
}

export function schemeJsonLd(name: string, slug: string, description?: string) {
  return {
    '@type': 'Article',
    headline: `${name} — PIB vs CAG Reality Check`,
    url: `${SITE_URL}/schemes/${slug}`,
    description: description ?? `CAG audit findings vs government press releases for ${name}.`,
    image: `${SITE_URL}/og/schemes.jpg`,
    publisher: { '@id': `${SITE_URL}/#org` },
  };
}
