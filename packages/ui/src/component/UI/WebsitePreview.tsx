import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Globe } from "lucide-react";

type WebsitePreviewProps = {
  url: string;
  title?: string;
  compact?: boolean;
};

const buildFaviconCandidates = (hostname: string) => [
  `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
  `https://${hostname}/favicon.ico`,
];

export function WebsitePreview({ url, title, compact = false }: WebsitePreviewProps) {
  const parsedUrl = useMemo(() => {
    try {
      return new URL(url);
    } catch {
      return null;
    }
  }, [url]);

  const hostname = parsedUrl?.hostname?.replace(/^www\./, "") || "website";
  const origin = parsedUrl?.origin || url;
  const pathname = parsedUrl?.pathname && parsedUrl.pathname !== "/" ? parsedUrl.pathname : "";
  const displayPath = `${pathname}${parsedUrl?.search || ""}` || "Open saved website";

  const faviconCandidates = useMemo(() => buildFaviconCandidates(hostname), [hostname]);
  const [faviconIndex, setFaviconIndex] = useState(0);

  useEffect(() => {
    setFaviconIndex(0);
  }, [url]);

  const faviconSrc = faviconCandidates[faviconIndex];
  const initials = hostname.slice(0, 2).toUpperCase();

  return (
    <div
      className={`relative overflow-hidden rounded-[24px] border border-border bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_42%),linear-gradient(180deg,hsl(var(--surface))_0%,hsl(var(--surface-elevated))_100%)] ${
        compact ? "h-full w-full p-5" : "h-full min-h-[280px] w-full p-6 sm:min-h-[500px] sm:p-8"
      }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.04)_100%)]" />

      <div className="relative flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-border/80 bg-surface shadow-[0_14px_30px_-20px_rgba(0,0,0,0.45)]">
              {faviconSrc ? (
                <img
                  src={faviconSrc}
                  alt={`${hostname} logo`}
                  className="h-8 w-8 rounded-md object-contain"
                  onError={() => {
                    setFaviconIndex((current) =>
                      current < faviconCandidates.length - 1 ? current + 1 : current
                    );
                  }}
                />
              ) : (
                <span className="text-sm font-semibold text-foreground">{initials}</span>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                {hostname}
              </p>
              <p className="truncate text-xs text-muted-foreground/80">{origin}</p>
            </div>
          </div>

          <div className="rounded-full border border-border/80 bg-surface/90 p-2 text-muted-foreground shadow-[0_10px_25px_-18px_rgba(0,0,0,0.45)]">
            <Globe className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className={`${compact ? "text-xl" : "text-2xl sm:text-3xl"} font-semibold tracking-[-0.04em] text-brand-ink`}>
            {title || hostname}
          </h3>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{displayPath}</p>
        </div>

        <div className="flex items-center justify-between rounded-[20px] border border-border/80 bg-surface/85 px-4 py-3 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.42)]">
          <span className="truncate pr-4 text-sm text-foreground">{hostname}</span>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            Visit site
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
