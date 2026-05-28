import { motion } from "framer-motion";
import { useAuth } from "@clerk/react";
import { ArrowRight, Brain, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button2 } from "../component/UI/Button2";

export const CTASection = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  const handleGetStarted = () => {
    navigate(isSignedIn ? "/dashboard" : "/signup");
  };

  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-28">
      <div className="absolute inset-0 bg-soft-radial opacity-80" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-5xl"
        >
          <div className="relative overflow-hidden rounded-[38px] border landing-gradient-panel p-8 shadow-[0_30px_90px_-52px_rgba(0,0,0,0.48)] md:p-16">
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-56 w-56 -translate-x-1/3 translate-y-1/3 rounded-full bg-hero-mist blur-3xl" />

            <div className="relative text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary/10"
              >
                <Brain className="w-8 h-8 text-primary" />
              </motion.div>

              <h2 className="text-3xl font-semibold tracking-[-0.06em] text-brand-ink md:text-6xl">
                Shape your research into a workspace
                <span className="text-primary"> that remembers with you.</span>
              </h2>
              <p className="mx-auto mb-8 mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                Move from scattered saves to one deliberate system for reading, connecting ideas, and retrieving what matters in seconds.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button2 variant="hero" size="xl" className="group cursor-pointer" onClick={handleGetStarted}>
                  <Sparkles className="w-5 h-5" />
                  Get Started Free
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button2>
                <p className="text-sm text-muted-foreground">No credit card required</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
