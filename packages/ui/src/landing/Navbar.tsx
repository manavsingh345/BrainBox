import { useState } from "react";
import { useAuth, useClerk } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ChevronRight, Menu, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button2 } from "../component/UI/Button2";

const navLinks = [
  { label: "Capture", href: "#capture" },
  { label: "Workflow", href: "#feature" },
  { label: "Explore", href: "#howitworks" },
  { label: "Pricing", href: "/pricing" },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();

  const handleLogin = () => {
    navigate("/signin");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await signOut(() => navigate("/"));
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-7xl rounded-[28px] border border-border/70 bg-[hsl(var(--background)/0.78)] shadow-[0_18px_50px_-28px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,hsl(var(--primary)),hsl(205_76%_47%))] text-primary-foreground shadow-[0_12px_30px_-16px_hsl(var(--primary)/0.85)]">
              <Brain className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold tracking-[-0.03em] text-brand-ink">BrainBox</div>
              <div className="text-xs text-muted-foreground">Knowledge OS for your saved ideas</div>
            </div>
            <div className="text-base font-semibold tracking-[-0.03em] text-brand-ink sm:hidden">BrainBox</div>
          </a>

          <div className="hidden items-center gap-1 rounded-full border border-border/70 bg-surface-elevated/60 p-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-strong hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="hidden items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground xl:flex">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Affine-inspired refresh
            </div>
            {isSignedIn ? (
              <>
                <Button2 variant="ghost" size="sm" onClick={handleDashboard} className="cursor-pointer">
                  Dashboard
                </Button2>
                <Button2 variant="hero" size="sm" onClick={() => void handleLogout()} className="cursor-pointer">
                  Logout
                </Button2>
              </>
            ) : (
              <>
                <Button2 variant="ghost" size="sm" onClick={handleLogin} className="cursor-pointer">
                  Log in
                </Button2>
                <Button2 variant="hero" size="sm" onClick={handleSignup} className="cursor-pointer">
                  Get Started
                  <ChevronRight className="h-4 w-4" />
                </Button2>
              </>
            )}
          </div>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-elevated/70 transition-colors hover:bg-surface-strong md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-auto mt-3 max-w-7xl rounded-[28px] border border-border/70 bg-[hsl(var(--background)/0.92)] px-4 py-4 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-strong hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              {isSignedIn ? (
                <>
                  <Button2 variant="ghost" className="justify-start" onClick={handleDashboard}>
                    Dashboard
                  </Button2>
                  <Button2 variant="hero" onClick={() => void handleLogout()}>
                    Logout
                  </Button2>
                </>
              ) : (
                <>
                  <Button2 variant="ghost" className="justify-start" onClick={handleLogin}>
                    Log in
                  </Button2>
                  <Button2 variant="hero" onClick={handleSignup}>
                    Get Started
                    <ChevronRight className="h-4 w-4" />
                  </Button2>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
