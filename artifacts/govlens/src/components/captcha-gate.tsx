/**
 * CaptchaGate — Cloudflare Turnstile bot challenge.
 *
 * Shows once per browser session before the app loads.
 * On success, calls /api/session/verify → server sets a signed session cookie
 * that unlocks all API routes. Subsequent page navigations skip the gate.
 *
 * Keys: set VITE_TURNSTILE_SITE_KEY in environment (Secrets).
 * Get keys free at: https://dash.cloudflare.com → Turnstile → Add site
 * Test site key (always passes): 1x00000000000000000000AA
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

// Falls back to Cloudflare's always-pass test key so the gate works out of the box
const SITE_KEY     = (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined)
                     ?? "1x00000000000000000000AA";
const SESSION_FLAG = "govlens_captcha_ok";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback: (token: string) => void;
          "error-callback": () => void;
          "expired-callback": () => void;
        },
      ) => string;
      reset: (id: string) => void;
    };
  }
}

function loadScript(): Promise<void> {
  if (document.getElementById("cf-ts")) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s    = document.createElement("script");
    s.id       = "cf-ts";
    s.src      = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async    = true;
    s.defer    = true;
    s.onload   = () => resolve();
    s.onerror  = () => reject();
    document.head.appendChild(s);
  });
}

export function CaptchaGate({ children }: { children: ReactNode }) {
  const [passed, setPassed] = useState(
    () => sessionStorage.getItem(SESSION_FLAG) === "1",
  );
  if (passed) return <>{children}</>;
  return <Challenge onPassed={() => setPassed(true)} />;
}

function Challenge({ onPassed }: { onPassed: () => void }) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId     = useRef<string | null>(null);
  const [status,  setStatus]  = useState<"loading" | "ready" | "verifying" | "error">("loading");
  const [errMsg,  setErrMsg]  = useState("");

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await loadScript();
        if (cancelled) return;

        // Wait up to 3 s for window.turnstile to appear
        for (let i = 0; i < 30 && !window.turnstile; i++) {
          await new Promise(r => setTimeout(r, 100));
        }
        if (!window.turnstile || !containerRef.current || cancelled) {
          setStatus("error");
          setErrMsg(t('captchaLoadError'));
          return;
        }

        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme:   "light",

          callback: async (token) => {
            setStatus("verifying");
            try {
              const res = await fetch("/api/session/verify", {
                method:      "POST",
                headers:     { "Content-Type": "application/json" },
                credentials: "include",
                body:        JSON.stringify({ token }),
              });
              if (res.ok) {
                sessionStorage.setItem(SESSION_FLAG, "1");
                onPassed();
              } else {
                const d = await res.json().catch(() => ({})) as { error?: string };
                setStatus("error");
                setErrMsg(d.error ?? t('captchaVerifyError'));
              }
            } catch {
              setStatus("error");
              setErrMsg(t('captchaNetworkError'));
            }
          },

          "error-callback": () => {
            setStatus("error");
            setErrMsg(t('captchaBotError'));
          },

          "expired-callback": () => {
            if (widgetId.current) window.turnstile?.reset(widgetId.current);
            setStatus("ready");
          },
        });

        setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setErrMsg(t('captchaLoadError'));
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, [onPassed]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-4">
      <div className="text-center space-y-1 select-none">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.png" alt="" className="h-8 w-8"
            onError={e => (e.currentTarget.style.display = "none")} />
          <span className="text-xl font-bold tracking-tight">Andhbhakt.org</span>
        </div>
        <p className="text-muted-foreground text-sm">
          {t('captchaVerifyingHuman')}
        </p>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm p-6 flex flex-col items-center gap-4 min-w-[300px]">
        {status === "loading" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            {t('loading')}
          </div>
        )}

        {/* Turnstile mounts here */}
        <div ref={containerRef} />

        {status === "verifying" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            {t('captchaVerifying')}
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive">{errMsg}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-primary underline underline-offset-2 hover:opacity-70"
            >
              {t('captchaReload')}
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center max-w-xs">
        {t('captchaProtection')}
        <br />{t('captchaPoweredBy')}
      </p>
    </div>
  );
}
