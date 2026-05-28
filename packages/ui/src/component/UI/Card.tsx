import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { ShareIcon } from "../../icons/ShareIcon";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { TwitterIcon } from "../../icons/TwitterIcon";
import { YoutubeIcon } from "../../icons/YoutubeIcon";
import { Document } from "../../icons/Document";
import { LinkIcon } from "../../icons/LinkIcon";
import { WebsitePreview } from "./WebsitePreview";

interface CardProps {
  title: string;
  link: string;
  type: "twitter" | "youtube" | "document" | "links";
  contentId: string;
  onDelete?: () => void;
  date?: string;
  onClick?: () => void;
}

export function Card({ title, link, type, onDelete, date, onClick }: CardProps) {
  const [displayDate] = useState(
    () =>
      date ??
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
  );

  useEffect(() => {
    if (type === "twitter" && (window as any).twttr) {
      (window as any).twttr.widgets.load();
    }
  }, [link, type]);

  const iconWrapperColors = {
    twitter: "bg-sky-500/12 text-sky-500 dark:text-sky-300",
    youtube: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
    document: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
    links: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
      onClick={onClick}
      className="group relative w-full cursor-pointer"
    >
      <div className="relative flex h-[320px] w-full flex-col overflow-hidden rounded-[28px] border border-border/90 bg-surface-elevated shadow-[0_24px_70px_-50px_rgba(0,0,0,0.48)] transition-all duration-200 hover:border-primary/25 hover:shadow-[0_26px_70px_-44px_rgba(0,0,0,0.55)]">
        <div className="relative flex-1 overflow-hidden bg-surface">
          {type === "youtube" && (
            <iframe
              className="absolute inset-0 h-full w-full scale-[1.03] object-cover pointer-events-none"
              src={link.replace("watch", "embed").replace("?v=", "/") + "?controls=0&mute=1&showinfo=0&rel=0"}
              title="YouTube preview"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              tabIndex={-1}
            ></iframe>
          )}

          {type === "twitter" && (
            <div className="h-full w-full overflow-y-auto overflow-x-hidden p-3">
              <blockquote className="twitter-tweet m-0 w-full" data-theme="dark">
                <a href={link.replace("x.com", "twitter.com")}></a>
              </blockquote>
            </div>
          )}

          {type === "document" && (
            <div className="relative h-full w-full overflow-hidden p-6">
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-surface-elevated"></div>
              <p className="line-clamp-[9] whitespace-pre-line text-sm leading-7 text-muted-foreground">{link}</p>
            </div>
          )}

          {type === "links" && (
            <div className="h-full w-full overflow-hidden p-3">
              <WebsitePreview url={link} title={title} compact />
            </div>
          )}
        </div>

        <div className="z-20 flex shrink-0 flex-col gap-3 border-t border-border bg-surface-elevated/96 px-5 py-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconWrapperColors[type]}`}
            >
              {type === "twitter" && (
                <div onClick={(e) => { e.stopPropagation(); window.open(link, "_blank"); }}>
                  <TwitterIcon />
                </div>
              )}
              {type === "youtube" && (
                <div onClick={(e) => { e.stopPropagation(); window.open(link, "_blank"); }}>
                  <YoutubeIcon />
                </div>
              )}
              {type === "document" && <Document />}
              {type === "links" && (
                <div onClick={(e) => { e.stopPropagation(); window.open(link, "_blank"); }}>
                  <LinkIcon />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-brand-ink">
                {title}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">Added {displayDate}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {type}
            </div>

            <div className="flex items-center gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {type !== "document" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(link, "_blank");
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-surface-strong hover:text-foreground"
                >
                  <ShareIcon size="sm" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete) onDelete();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500 transition-colors hover:bg-red-500/15 dark:text-red-300"
              >
                <DeleteIcon size="sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
