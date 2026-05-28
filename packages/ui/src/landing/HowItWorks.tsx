import { motion } from "framer-motion";
import { Cpu, MessageCircle, PlusCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: PlusCircle,
    title: "Add content",
    description: "Save links, upload PDFs, paste YouTube URLs, or drop in quick notes. Everything enters the same workspace.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI processes",
    description: "BrainBox analyzes, summarizes, tags, and connects your material so the archive becomes usable memory.",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Chat and discover",
    description: "Ask questions, find patterns, retrieve evidence, and turn saved research into action when you need it.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-28" id="howitworks">
      <div className="absolute inset-0 bg-soft-radial opacity-70" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="mb-4 text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Operating model
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.06em] text-brand-ink md:text-6xl">
            Three moves from save to
            <span className="text-primary"> searchable memory.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            The flow stays simple on purpose. Capture what matters, let the system shape it, then use it whenever you need to think faster.
          </p>
        </motion.div>

        <div className="mx-auto max-w-6xl">
          <div className="relative">
            <div className="absolute left-[16%] right-[16%] top-24 hidden h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent md:block" />

            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="relative"
                >
                  <div className="rounded-[30px] border landing-glass p-8 text-center shadow-[0_18px_52px_-34px_rgba(0,0,0,0.42)] backdrop-blur-sm">
                    <motion.div
                      className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[26px] border border-border bg-surface shadow-[0_16px_34px_-24px_rgba(0,0,0,0.25)]"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <step.icon className="w-8 h-8 text-primary" />
                      <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-[0_10px_20px_-12px_hsl(var(--primary)/0.8)]">
                        {step.number}
                      </span>
                    </motion.div>
                    <h3 className="mb-3 text-xl font-semibold tracking-[-0.03em] text-brand-ink">{step.title}</h3>
                    <p className="leading-7 text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
