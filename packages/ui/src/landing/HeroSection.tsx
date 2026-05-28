import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { ArrowRight, Brain, FileText, Search, Sparkles, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button2 } from "../component/UI/Button2";

const heroCards = [
  {
    icon: FileText,
    title: "Capture once",
    description: "Save PDFs, reels, YouTube links, notes, and web pages into one living workspace.",
  },
  {
    icon: Workflow,
    title: "Organize automatically",
    description: "Let AI cluster context, summarize content, and surface the next thing worth revisiting.",
  },
  {
    icon: Search,
    title: "Recall instantly",
    description: "Ask across your saved knowledge and get answers with grounded context, not guesswork.",
  },
];

export const HeroSection = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    if (!showDemo) return;

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDemo(false);
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [showDemo]);

  const handleStartBuilding = () => {
    navigate(isSignedIn ? "/dashboard" : "/signup");
  };

  return (
    <section className="relative overflow-hidden px-4 pb-[4.5rem] pt-[8.5rem] md:pb-28 md:pt-40">
      <div className="absolute inset-0 bg-soft-radial" />
      <motion.div
        className="absolute left-[8%] top-32 h-64 w-64 rounded-full bg-primary/8 blur-3xl"
        animate={{ y: [0, -18, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-16 right-[12%] h-72 w-72 rounded-full bg-hero-mist/70 blur-3xl"
        animate={{ y: [0, 18, 0], scale: [1.06, 1, 1.06] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border landing-glass px-4 py-2 text-sm font-medium text-muted-foreground shadow-[0_10px_30px_-22px_rgba(0,0,0,0.45)] backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            AI-powered knowledge workspace
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[2.8rem] font-semibold leading-[0.94] tracking-[-0.07em] text-brand-ink md:text-[4.4rem] lg:text-[5.6rem]"
          >
            Capture,
            <br />
            Connect,
            <br />
            Recall.
            <span className="ml-2 inline-block text-primary">All at once.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mx-auto mt-7 max-w-3xl text-base leading-7 text-muted-foreground md:text-xl"
          >
            BrainBox brings your PDFs, videos, links, notes, and research into one calm workspace.
            Save anything, let AI structure it, then chat with your knowledge like it has always been there.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button2 variant="hero" size="xl" className="group cursor-pointer" onClick={handleStartBuilding}>
              <Brain className="w-5 h-5" />
              Start building your brain
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button2>
            <Button2 variant="heroOutline" size="xl" onClick={() => setShowDemo(true)} className="cursor-pointer">
              Watch product demo
            </Button2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground"
          >
            <span>Local knowledge, cloud flexibility</span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span>Grounded AI answers</span>
            <span className="hidden h-1 w-1 rounded-full bg-border sm:block" />
            <span>One workspace for scattered content</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.8 }}
          className="mx-auto mt-[4.5rem] max-w-6xl"
        >
          <div className="rounded-[36px] border landing-glass p-4 shadow-[0_40px_100px_-52px_rgba(0,0,0,0.58)] backdrop-blur-xl md:p-6">
            <div className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
              <div className="rounded-[30px] border landing-gradient-panel p-5 md:p-7">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <div className="text-sm font-semibold text-brand-ink">BrainBox Workspace</div>
                    <div className="mt-1 text-sm text-muted-foreground">One stream for saved knowledge, AI summaries, and searchable context</div>
                  </div>
                  <div className="hidden rounded-full bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground md:block">
                    Live memory canvas
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                  <div className="rounded-[24px] border border-border bg-surface p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-sm font-semibold text-brand-ink">Today</div>
                      <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">AI sorted</div>
                    </div>
                    <div className="space-y-3">
                      {["Founder interview clips", "Research PDFs for memory systems", "10 article highlights linked to notes"].map((item) => (
                        <div key={item} className="rounded-2xl border landing-panel px-4 py-3 text-left shadow-[0_10px_25px_-22px_rgba(0,0,0,0.32)]">
                          <div className="text-sm font-medium text-brand-ink">{item}</div>
                          <div className="mt-1 text-xs text-muted-foreground">Connected to themes, summaries, and future prompts</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-primary/25 bg-[hsl(var(--brand-ink))] p-5 text-background dark:bg-[hsl(var(--surface-strong))] dark:text-foreground">
                    <div className="text-sm font-semibold text-background/90 dark:text-foreground/90">Ask BrainBox</div>
                    <div className="mt-4 rounded-[22px] bg-white/8 p-4 text-left">
                      <div className="text-xs uppercase tracking-[0.16em] text-background/55 dark:text-foreground/55">Prompt</div>
                      <div className="mt-2 text-sm text-background/90 dark:text-foreground/90">What were the strongest patterns across all saved founder interviews this week?</div>
                    </div>
                    <div className="mt-4 rounded-[22px] bg-primary/14 p-4 text-left">
                      <div className="text-xs uppercase tracking-[0.16em] text-background/65 dark:text-foreground/65">Response</div>
                      <div className="mt-2 text-sm leading-6 text-background/90 dark:text-foreground/90">
                        Three recurring ideas surfaced: team speed, repeatable writing systems, and tighter feedback loops from saved research.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {heroCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.95 + index * 0.1 }}
                    className="rounded-[28px] border landing-glass p-5 text-left shadow-[0_14px_34px_-26px_rgba(0,0,0,0.42)] backdrop-blur-sm"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 text-lg font-semibold tracking-[-0.03em] text-brand-ink">{card.title}</div>
                    <div className="mt-2 text-sm leading-6 text-muted-foreground">{card.description}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-8 flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-muted-foreground/30 p-2">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>

      {showDemo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setShowDemo(false)}
        >
          <div
            className="w-full max-w-4xl rounded-[28px] border border-white/15 bg-card/95 p-3 text-foreground shadow-2xl backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">BrainBox Demo</p>
              <button
                type="button"
                className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:bg-secondary"
                onClick={() => setShowDemo(false)}
              >
                Close
              </button>
            </div>
            <div className="overflow-hidden rounded-[22px] bg-surface">
              <video
                controls
                autoPlay
                className="h-auto max-h-[70vh] w-full"
                src="https://res.cloudinary.com/dmtktd1wr/video/upload/v1771043917/Untitled_video_-_Made_with_Clipchamp_1_zjhbim.mp4"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
