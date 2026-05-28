import { Brain, Github, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="border-t border-border/80 bg-surface/60 px-4">
      <div className="mx-auto max-w-7xl py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <a href="/" className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_12px_30px_-16px_hsl(var(--primary)/0.75)]">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold tracking-[-0.03em] text-brand-ink">BrainBox</div>
                <div className="text-xs text-muted-foreground">Capture, connect, recall</div>
              </div>
            </a>
            <p className="mb-5 max-w-md text-sm leading-6 text-muted-foreground">
              BrainBox is an AI-powered second brain for the things you save, read, watch, and want to reuse later.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/ManavSingh321"
                className="rounded-full border border-border bg-surface-elevated/70 p-2.5 text-muted-foreground transition-colors hover:bg-surface-strong hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/manavsingh345"
                className="rounded-full border border-border bg-surface-elevated/70 p-2.5 text-muted-foreground transition-colors hover:bg-surface-strong hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-ink">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#feature" className="transition-colors hover:text-foreground">
                  Workflow
                </a>
              </li>
              <li>
                <a href="/pricing" className="transition-colors hover:text-foreground">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/signin" className="transition-colors hover:text-foreground">
                  Sign In
                </a>
              </li>
              <li>
                <a href="/signup" className="transition-colors hover:text-foreground">
                  Get Started
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-brand-ink">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://github.com/manavsingh345" className="transition-colors hover:text-foreground">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://x.com/ManavSingh321" className="transition-colors hover:text-foreground">
                  X
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          Copyright {new Date().getFullYear()} BrainBox. To shape, not to scatter.
        </div>
      </div>
    </footer>
  );
};
