import { Router } from "express";
import type { Request, Response } from "express";
import { getCachedNews } from "../jobs/news-fetcher";

const router = Router();

/**
 * GET /api/news/ticker
 * Returns cached headlines for the news ticker.
 * No auth required — public read-only endpoint.
 * Cache-Control set to 5 minutes so the CDN / browser refreshes periodically.
 */
router.get("/news/ticker", (req: Request, res: Response): void => {
  const { items, fetchedAt } = getCachedNews();
  res.setHeader("Cache-Control", "public, max-age=300"); // 5 min browser cache
  res.json({
    items,
    fetchedAt: fetchedAt?.toISOString() ?? null,
    total: items.length,
  });
});

export default router;
