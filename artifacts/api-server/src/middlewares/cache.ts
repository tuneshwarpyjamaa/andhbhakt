/**
 * HTTP cache headers for read-only GET routes.
 *
 * Strategy:
 *  - Static lists (categories, ministries): 24 h browser + CDN cache
 *  - Scheme/PIB/CAG data:                   1 h  browser + CDN cache, 24 h stale-while-revalidate
 *  - Stats:                                  15 min
 *  - Write endpoints / non-GET:             no-store (never cache mutations)
 *  - Health:                                no-store
 *
 * With Cloudflare or any CDN in front this cuts origin requests by ~95 %.
 * Even without a CDN, browser caching alone stops re-requests on navigation.
 */

import type { Request, Response, NextFunction } from "express";

const STATIC_LISTS = new Set(["/api/categories", "/api/ministries"]);
const NO_CACHE    = new Set(["/api/healthz", "/api/health"]);

export function cacheHeaders(req: Request, res: Response, next: NextFunction): void {
  // Never cache mutations or health checks
  if (req.method !== "GET" || NO_CACHE.has(req.path)) {
    res.setHeader("Cache-Control", "no-store");
    next();
    return;
  }

  if (STATIC_LISTS.has(req.path)) {
    // Very stable data — 24 h
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
  } else if (req.path.startsWith("/api/stats")) {
    // Stats update infrequently — 15 min
    res.setHeader("Cache-Control", "public, max-age=900, stale-while-revalidate=3600");
  } else {
    // All other GET (schemes, PIB, CAG, verdicts) — 1 h fresh, 24 h stale
    res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  }

  next();
}
