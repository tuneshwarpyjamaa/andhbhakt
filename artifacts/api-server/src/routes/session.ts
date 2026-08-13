/**
 * POST /api/session/verify
 *
 * Verifies a Cloudflare Turnstile token from the browser, then issues a
 * signed session cookie that unlocks all other API routes.
 *
 * Environment variables:
 *   TURNSTILE_SECRET_KEY — from Cloudflare Turnstile dashboard (free).
 *                          Defaults to Cloudflare's always-pass test secret
 *                          so the gate works out of the box; swap for a real
 *                          key once you add the site in Cloudflare Turnstile.
 */

import { Router } from "express";
import { issueSessionCookie } from "../middlewares/verify-session";

const router = Router();

// Cloudflare always-pass test secret — safe default, real key overrides it
const TURNSTILE_SECRET =
  process.env.TURNSTILE_SECRET_KEY ??
  "1x0000000000000000000000000000000AA";

router.post("/session/verify", async (req, res): Promise<void> => {
  const { token } = (req.body ?? {}) as { token?: string };

  if (!token || typeof token !== "string" || token.length > 2048) {
    res.status(400).json({ error: "Missing or invalid captcha token." });
    return;
  }

  try {
    const form = new URLSearchParams();
    form.append("secret",   TURNSTILE_SECRET);
    form.append("response", token);
    if (req.ip) form.append("remoteip", req.ip);

    const cfRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: form, signal: AbortSignal.timeout(8_000) },
    );

    if (!cfRes.ok) {
      res.status(502).json({ error: "Could not reach verification service." });
      return;
    }

    const data = (await cfRes.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      res.status(403).json({
        error: "Bot check failed.",
        codes: data["error-codes"],
      });
      return;
    }

    issueSessionCookie(res);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Verification error." });
  }
});

export default router;
