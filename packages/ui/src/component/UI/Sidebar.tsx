import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/react";
import { Brain, ChevronLeft, ChevronRight, LayoutGrid, MessageSquareMore } from "lucide-react";
import { motion } from "framer-motion";

import { TwitterIcon } from "../../icons/TwitterIcon";
import { YoutubeIcon } from "../../icons/YoutubeIcon";
import { Document } from "../../icons/Document";
import { LinkIcon } from "../../icons/LinkIcon";
import { SidebarItem } from "./SidebarItem";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  selectedType: "twitter" | "youtube" | "document" | "links" | "chat";
  onSelectType: (type: "twitter" | "youtube" | "document" | "links" | "chat") => void;
  user?: {
    username: string;
    email: string;
  };
  sidebaropen: boolean;
  setSidebaropen: (open: boolean) => void;
}

export function Sidebar({
  selectedType,
  onSelectType,
  user,
  sidebaropen,
  setSidebaropen,
}: SidebarProps) {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  return (
    <>
      <button
        onClick={() => setSidebaropen(!sidebaropen)}
        className={`fixed top-5 z-50 hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-[hsl(var(--background)/0.9)] text-muted-foreground shadow-[0_12px_28px_-18px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-all hover:text-foreground lg:inline-flex ${
          sidebaropen ? "left-[16.5rem]" : "left-5"
        }`}
        aria-label={sidebaropen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {sidebaropen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <motion.aside
        initial={false}
        animate={{ x: sidebaropen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="fixed left-0 top-0 z-40 hidden h-screen w-[17rem] flex-col border-r border-border/80 bg-[hsl(var(--surface)/0.92)] px-4 py-5 backdrop-blur-xl lg:flex"
      >
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3 rounded-2xl px-2 py-1 text-left transition-opacity hover:opacity-85"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_10px_26px_-18px_hsl(var(--primary)/0.7)]">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-[-0.03em] text-brand-ink">BrainBox</div>
            <div className="text-xs text-muted-foreground">Workspace</div>
          </div>
        </button>

        <div className="mt-6 rounded-[24px] border border-border/80 bg-surface-elevated/70 p-3 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.36)]">
          <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Library
          </div>
          <div className="space-y-1">
            <SidebarItem
              text="YouTube"
              icon={<YoutubeIcon />}
              selected={selectedType === "youtube"}
              onClick={() => onSelectType("youtube")}
            />
            <SidebarItem
              text="Twitter"
              icon={<TwitterIcon />}
              selected={selectedType === "twitter"}
              onClick={() => onSelectType("twitter")}
            />
            <SidebarItem
              text="Links"
              icon={<LinkIcon />}
              selected={selectedType === "links"}
              onClick={() => onSelectType("links")}
            />
            <SidebarItem
              text="Documents"
              icon={<Document />}
              selected={selectedType === "document"}
              onClick={() => onSelectType("document")}
            />
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-border/80 bg-surface-elevated/70 p-3 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.32)]">
          <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Workspace
          </div>
          <div className="space-y-1">
            <SidebarItem
              text="All Content"
              icon={<LayoutGrid className="h-4 w-4" />}
              selected={selectedType !== "chat"}
              onClick={() => onSelectType("youtube")}
            />
            <SidebarItem
              text="Chat With Anything"
              icon={<MessageSquareMore className="h-4 w-4" />}
              selected={selectedType === "chat"}
              onClick={() => onSelectType("chat")}
            />
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <div className="rounded-[24px] border border-border/80 bg-surface-elevated/70 p-3 shadow-[0_18px_50px_-34px_rgba(0,0,0,0.32)]">
            <ThemeToggle />
          </div>

          {user && (
            <div className="rounded-[24px] border border-border/80 bg-surface-elevated/78 p-4 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.38)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-brand-ink">{user.username}</div>
                  <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                </div>
              </div>

              <button
                onClick={async () => {
                  await signOut(() => navigate("/signin"));
                }}
                className="mt-4 w-full rounded-full border border-border bg-surface/80 px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-strong hover:text-red-500"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
