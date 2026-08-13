import { Router } from "express";
import type { Request, Response } from "express";
import { db, issueReportsTable, ISSUE_TYPES } from "@workspace/db";
import { rateLimit } from "express-rate-limit";
import { logger } from "../lib/logger";

const router = Router();

// ── Helpers ─────────────────────────────────────────────────────────────────

function getClientIp(req: Request): string {
  const cfIp = req.headers["cf-connecting-ip"];
  if (cfIp && typeof cfIp === "string" && cfIp.trim()) return cfIp.trim();
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return (Array.isArray(fwd) ? fwd[0] : fwd).split(",")[0].trim();
  return req.socket?.remoteAddress ?? "unknown";
}

// ── Stricter rate limit: 5 submissions per 15 minutes per IP ────────────────
const submitLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 5,
  keyGenerator: getClientIp,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler(_req: Request, res: Response) {
    res.status(429).json({
      error: "Too many submissions. Please wait 15 minutes before trying again.",
    });
  },
});

// ── Security helpers ─────────────────────────────────────────────────────────

/** Strip HTML tags, script blocks, JS protocols, and event handler attributes */
function sanitizeText(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")   // strip <script> blocks
    .replace(/<style[\s\S]*?<\/style>/gi, "")      // strip <style> blocks
    .replace(/<[^>]*>/g, "")                        // strip all remaining HTML tags
    .replace(/&(lt|gt|amp|quot|apos|#\d+|#x[\da-f]+);/gi, "") // strip HTML entities
    .replace(/javascript\s*:/gi, "")               // strip JS protocol
    .replace(/vbscript\s*:/gi, "")                 // strip VBScript protocol
    .replace(/data\s*:/gi, "")                     // strip data URIs
    .replace(/on\w{1,20}\s*=/gi, "")               // strip event handlers (onclick=, onload=, …)
    .trim();
}

/** Detect common SQL injection patterns in user-supplied text */
function looksLikeSqlInjection(input: string): boolean {
  const patterns = [
    /\b(union\s+select|select\s+\*\s+from|drop\s+table|insert\s+into|delete\s+from|update\s+\w+\s+set|create\s+table|alter\s+table|exec\s*\(|execute\s*\()\b/i,
    /--\s*(;|$)/m,                          // SQL line-comment ending a statement
    /;\s*(drop|delete|insert|update|create|alter|exec)/i,
    /\/\*[\s\S]*?\*\//,                     // SQL block comments
    /\bxp_\w+/i,                            // SQL Server extended procs
    /\bsleep\s*\(\d+\)/i,                   // time-based blind injection
    /\bwaitfor\s+delay\b/i,
    /'\s*or\s+'1'\s*=\s*'1/i,              // classic OR 1=1
    /'\s*;\s*(drop|select|insert)/i,
  ];
  return patterns.some((p) => p.test(input));
}

/** Validate email: RFC 5321-lite plus injection-safety check */
function isSafeEmail(email: string): boolean {
  return (
    /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email) &&
    email.length <= 254 &&
    !/<|>|'|"/.test(email)
  );
}

// ── Manual input validation ──────────────────────────────────────────────────
interface ParsedBody {
  issueType: string;
  pageAffected?: string;
  description: string;
  email?: string;
  honeypot?: string;
}

interface ValidationError {
  field: string;
  message: string;
}

function validateBody(body: unknown): { data?: ParsedBody; errors?: ValidationError[] } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { errors: [{ field: "body", message: "Invalid request body" }] };
  }

  const b = body as Record<string, unknown>;
  const errors: ValidationError[] = [];

  // issueType: required enum
  const issueType = b["issueType"];
  if (typeof issueType !== "string" || !ISSUE_TYPES.includes(issueType as typeof ISSUE_TYPES[number])) {
    errors.push({ field: "issueType", message: "Invalid issue type" });
  }

  // pageAffected: optional string, max 500
  const pageAffected = b["pageAffected"];
  if (pageAffected !== undefined && pageAffected !== "" && pageAffected !== null) {
    if (typeof pageAffected !== "string") {
      errors.push({ field: "pageAffected", message: "Must be a string" });
    } else if (pageAffected.length > 500) {
      errors.push({ field: "pageAffected", message: "Must be under 500 characters" });
    }
  }

  // description: required, 10–2000 chars (pre-sanitisation)
  const description = b["description"];
  if (typeof description !== "string" || description.trim().length === 0) {
    errors.push({ field: "description", message: "Description is required" });
  } else if (description.length > 2000) {
    errors.push({ field: "description", message: "Must be under 2,000 characters" });
  }

  // email: optional string, max 254
  const email = b["email"];
  if (email !== undefined && email !== "" && email !== null) {
    if (typeof email !== "string" || email.length > 254) {
      errors.push({ field: "email", message: "Invalid email" });
    }
  }

  // honeypot: must be absent or empty string
  const honeypot = b["honeypot"];
  if (honeypot !== undefined && honeypot !== "" && honeypot !== null) {
    if (typeof honeypot !== "string" || honeypot.length > 0) {
      errors.push({ field: "honeypot", message: "Bot detected" });
    }
  }

  if (errors.length > 0) return { errors };

  return {
    data: {
      issueType: issueType as string,
      pageAffected: typeof pageAffected === "string" && pageAffected ? pageAffected : undefined,
      description: description as string,
      email: typeof email === "string" && email ? email : undefined,
      honeypot: typeof honeypot === "string" ? honeypot : undefined,
    },
  };
}

// ── POST /api/report-issue ───────────────────────────────────────────────────
router.post("/report-issue", submitLimiter, async (req: Request, res: Response): Promise<void> => {

  // 1. Structural validation
  const { data, errors } = validateBody(req.body);
  if (errors || !data) {
    res.status(400).json({ error: "Invalid submission", details: errors });
    return;
  }

  const { issueType, pageAffected, description, email, honeypot } = data;

  // 2. Honeypot — bots fill hidden fields; humans leave them empty
  if (honeypot) {
    res.status(201).json({ ok: true }); // silently accept so bots learn nothing
    return;
  }

  // 3. Sanitise all free-text fields
  const cleanDescription = sanitizeText(description);
  const cleanPage        = pageAffected ? sanitizeText(pageAffected) : undefined;
  const cleanEmail       = email?.trim() || undefined;

  // 4. Post-sanitisation length check
  if (cleanDescription.length < 10) {
    res.status(400).json({ error: "Description is too short. Please provide at least 10 characters." });
    return;
  }

  // 5. SQL injection guard on all free-text inputs
  const textsToCheck = [cleanDescription, cleanPage, cleanEmail].filter(Boolean) as string[];
  if (textsToCheck.some(looksLikeSqlInjection)) {
    logger.warn({ ip: getClientIp(req), issueType }, "Possible SQL injection attempt in issue report — rejected");
    res.status(400).json({ error: "Submission contains invalid characters." });
    return;
  }

  // 6. Email format check (post-sanitisation)
  if (cleanEmail && !isSafeEmail(cleanEmail)) {
    res.status(400).json({ error: "Invalid email address." });
    return;
  }

  // 7. Capture request metadata
  const ip        = getClientIp(req).substring(0, 45);
  const userAgent = String(req.headers["user-agent"] ?? "").substring(0, 500);

  // 8. Persist — Drizzle uses parameterised queries; no raw SQL, no injection risk
  await db.insert(issueReportsTable).values({
    issueType,
    pageAffected: cleanPage ?? null,
    description:  cleanDescription,
    email:        cleanEmail ?? null,
    ipAddress:    ip,
    userAgent,
  });

  logger.info({ issueType, ip }, "Issue report submitted");
  res.status(201).json({ ok: true });
});

export default router;
