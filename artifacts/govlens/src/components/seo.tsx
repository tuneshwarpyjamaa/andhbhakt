import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SITE_URL = 'https://andhbhakt.org';
const SITE_NAME = 'AndhBhakt.org';
const DEFAULT_DESCRIPTION =
  "India's government accountability tracker — minister integrity scores, CAG audit findings vs government claims, state governance report cards, and global development rankings.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.jpg`;

interface SEOProps {
  title?: string;
  description?: string;
  /** Path after the domain, e.g. "/schemes/pm-kisan" */
  path?: string;
  ogImage?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  /** JSON-LD structured data object */
  jsonLd?: Record<string, unknown>;
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  ogImage = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
}: SEOProps) {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const ogLocale = isHi ? 'hi_IN' : 'en_IN';
  const altLocale = isHi ? 'en_IN' : 'hi_IN';

  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = `${SITE_URL}${path}`;
  const absImage = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  // Annotate JSON-LD with active content language
  const enrichedJsonLd = jsonLd
    ? { ...jsonLd, inLanguage: isHi ? 'hi' : 'en' }
    : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />
      {/* hreflang alternate links — both language variants share the same URL */}
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="hi" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absImage} />
      <meta property="og:image:width" content="1024" />
      <meta property="og:image:height" content="1024" />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={altLocale} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@andhbhakt" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absImage} />

      {/* JSON-LD */}
      {enrichedJsonLd && (
        <script type="application/ld+json">{JSON.stringify(enrichedJsonLd)}</script>
      )}
    </Helmet>
  );
}

/** Pre-built JSON-LD for the home page */
export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/schemes?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

/** JSON-LD for a minister profile */
export function ministerJsonLd(name: string, title: string, slug: string) {
  return {
    '@context': 'https://schema.org',
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

/** JSON-LD for a scheme article */
export function schemeJsonLd(name: string, slug: string, description?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${name} — PIB vs CAG Reality Check`,
    url: `${SITE_URL}/schemes/${slug}`,
    description: description ?? `CAG audit findings vs government press releases for ${name}.`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
