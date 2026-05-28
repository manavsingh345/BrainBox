"use client";

import { ClerkLoaded, ClerkLoading, RedirectToSignIn, useAuth } from "@clerk/react";
import { Brain } from "lucide-react";
import { Dashboard } from "@mysecondbrain/ui/pages/Dashboard";

export default function DashboardPage() {
  const { isSignedIn } = useAuth();

  return (
    <>
      <ClerkLoading>
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_30%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--surface))_100%)] px-6">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.05)_100%)]" />

          <div className="relative w-full max-w-md rounded-[32px] border border-border/80 bg-[hsl(var(--surface-elevated)/0.9)] p-8 text-center shadow-[0_30px_90px_-50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary/12 text-primary shadow-[0_16px_40px_-22px_hsl(var(--primary)/0.7)]">
              <Brain className="h-8 w-8 animate-pulse" />
            </div>

            <div className="mt-5">
              <div className="text-lg font-semibold tracking-[-0.04em] text-brand-ink">BrainBox</div>
              <p className="mt-2 text-sm text-muted-foreground">Opening your workspace and syncing saved content.</p>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </ClerkLoading>
      <ClerkLoaded>
        {isSignedIn ? <Dashboard /> : <RedirectToSignIn />}
      </ClerkLoaded>
    </>
  );
}
