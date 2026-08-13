/**
 * News fetcher — polls RSS feeds from major Indian sources every 15 minutes.
 * Results are kept in an in-memory cache; the GET /api/news/ticker endpoint
 * reads from this cache so individual page requests are instant.
 */

import { logger } from "../lib/logger";

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO string
}

// ── In-memory cache ──────────────────────────────────────────────────────────
let cache: NewsItem[] = [];
let lastFetchedAt: Date | null = null;

export function getCachedNews(): { items: NewsItem[]; fetchedAt: Date | null } {
  return { items: cache, fetchedAt: lastFetchedAt };
}

// ── RSS sources ──────────────────────────────────────────────────────────────
const FEEDS: { name: string; url: string }[] = [
  { name: "The Hindu",       url: "https://www.thehindu.com/news/national/feeder/default.rss" },
  { name: "NDTV",            url: "https://feeds.feedburner.com/ndtvnews-india-news" },
  { name: "Indian Express",  url: "https://indianexpress.com/section/india/feed/" },
  { name: "Times of India",  url: "https://timesofindia.indiatimes.com/rss.cms" },
  { name: "Hindustan Times", url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml" },
  { name: "PIB",             url: "https://pib.gov.in/RssMain.aspx" },
  { name: "The Wire",        url: "https://thewire.in/feed" },
];

const ITEMS_PER_FEED = 6;
const FETCH_TIMEOUT_MS = 8_000;

// ── XML helpers ──────────────────────────────────────────────────────────────

/** Extract text content from a named XML tag, handling CDATA sections */
function extractTag(xml: string, tag: string): string {
  // CDATA variant
  const cdata = xml.match(
    new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i")
  );
  if (cdata) return cdata[1].trim();

  // Plain text variant
  const plain = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, "i"));
  if (plain) return plain[1].trim();

  // Self-closing or href attribute (for atom:link)
  const attr = xml.match(new RegExp(`<${tag}[^>]+href="([^"]+)"`, "i"));
  if (attr) return attr[1].trim();

  return "";
}

/** Decode common HTML entities */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

/** Parse <item> blocks from an RSS/Atom feed XML string */
function parseRss(xml: string, sourceName: string): NewsItem[] {
  const items: NewsItem[] = [];

  // Match both RSS <item> and Atom <entry> blocks
  const blockRe = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRe.exec(xml)) !== null && items.length < ITEMS_PER_FEED) {
    const block = match[1];

    const rawTitle = extractTag(block, "title");
    const title = decodeEntities(rawTitle).replace(/\s+/g, " ").trim();

    // Link: try <link>, then <guid isPermaLink="true">, then <id>
    let url = extractTag(block, "link") || extractTag(block, "guid") || extractTag(block, "id");
    // Some feeds put the link as text between <link></link>; some as href attribute already handled above
    if (!url.startsWith("http")) continue;

    const pubDate = extractTag(block, "pubDate") || extractTag(block, "published") || extractTag(block, "updated");
    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();

    if (title && url) {
      items.push({ title, url, source: sourceName, publishedAt });
    }
  }

  return items;
}

// ── Fetch a single feed ───────────────────────────────────────────────────────

async function fetchFeed(feed: { name: string; url: string }): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": `GovLens-NewsBot/1.0 (+${process.env.SITE_URL ?? "https://govlens.in"})`,
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      logger.warn({ source: feed.name, status: res.status }, "RSS feed returned non-200");
      return [];
    }

    const xml = await res.text();
    const items = parseRss(xml, feed.name);
    logger.debug({ source: feed.name, count: items.length }, "RSS feed fetched");
    return items;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn({ source: feed.name, err: msg }, "RSS feed fetch failed");
    return [];
  }
}

// ── Main refresh ─────────────────────────────────────────────────────────────

export async function refreshNews(): Promise<void> {
  logger.info("News refresh started");

  const results = await Promise.allSettled(FEEDS.map(fetchFeed));

  const allItems: NewsItem[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // Sort by most recent first, deduplicate by URL
  const seen = new Set<string>();
  const deduped = allItems
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .filter(item => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });

  cache = deduped;
  lastFetchedAt = new Date();
  logger.info({ total: deduped.length }, "News refresh complete");
}

// ── Cron: refresh every 15 minutes ───────────────────────────────────────────

const INTERVAL_MS = 15 * 60_000;

export function startNewsCron(): void {
  // Fetch immediately on startup
  refreshNews().catch(err =>
    logger.error({ err }, "Initial news fetch failed")
  );

  // Then every 15 minutes
  setInterval(() => {
    refreshNews().catch(err =>
      logger.error({ err }, "Scheduled news fetch failed")
    );
  }, INTERVAL_MS);

  logger.info({ intervalMs: INTERVAL_MS }, "News cron started");
}
