import { motion } from "framer-motion";
import {
  FolderTree,
  MessageSquare,
  Search,
  Share2,
  Sparkles,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Chat with anything",
    description: "Ask questions about your saved content and get grounded answers across PDFs, videos, and articles.",
  },
  {
    icon: Sparkles,
    title: "AI auto-organize",
    description: "Content is tagged, clustered, and linked automatically so your library stays usable as it grows.",
  },
  {
    icon: Search,
    title: "Semantic search",
    description: "Find exactly what you mean with retrieval that understands ideas, not just keywords.",
  },
  {
    icon: FolderTree,
    title: "Smart collections",
    description: "Related sources, notes, and prompts group into meaningful clusters instead of static folders.",
  },
  {
    icon: Share2,
    title: "Share your brain",
    description: "Turn personal research into curated collections for a team, audience, or future self.",
  },
  {
    icon: Zap,
    title: "Instant capture",
    description: "Use links, uploads, and quick-save flows to add knowledge the moment you find it.",
  },
];

export const Features = () => {
  return (
    <section className="relative px-4 py-20 md:py-28" id="feature">
      <div className="absolute inset-0 bg-surface/65" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="mb-4 text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Product workflow
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.06em] text-brand-ink md:text-6xl">
            Designed to feel like one
            <span className="text-primary"> continuous workspace.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Not a pile of saved links. BrainBox turns capture, retrieval, synthesis, and sharing into one product rhythm.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="h-full rounded-[30px] border landing-glass p-8 shadow-[0_18px_52px_-34px_rgba(0,0,0,0.42)] backdrop-blur-sm transition-all duration-300 hover:border-primary/25 hover:shadow-[0_22px_56px_-32px_rgba(0,0,0,0.5)]">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-[18px] bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold tracking-[-0.03em] text-brand-ink">{feature.title}</h3>
                <p className="leading-7 text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
