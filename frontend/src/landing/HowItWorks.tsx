import { motion } from "framer-motion";
import { PlusCircle, Cpu, MessageCircle } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: PlusCircle,
    title: "Add Content",
    description: "Save links, upload PDFs, paste YouTube URLs, or use our browser extension. Everything goes into your brain.",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Processes",
    description: "Our AI analyzes, transcribes, summarizes, and connects your content. No effort required from you.",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Chat & Discover",
    description: "Ask questions, get summaries, find connections. Your BrainBox remembers everything.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden" id="howitworks">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Three simple steps to build your personal knowledge engine.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-primary/10 via-primary to-primary/10" />
            
            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="relative text-center"
                >
                  {/* Step number badge */}
                  <div className="relative inline-flex mb-6">
                    <motion.div
                      className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center shadow-card"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <step.icon className="w-8 h-8 text-primary" />
                    </motion.div>
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
