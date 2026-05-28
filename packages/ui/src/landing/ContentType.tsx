import { motion } from "framer-motion";
import {
  BookOpen,
  FileText,
  Film,
  Link,
  Newspaper,
  Podcast,
  Tags,
  Youtube,
} from "lucide-react";

const contentTypes = [
  { icon: Youtube, label: "YouTube", tone: "bg-[#ffebe7] text-[#f54e42]" },
  { icon: FileText, label: "PDFs", tone: "bg-[#fff2de] text-[#d87a00]" },
  { icon: Link, label: "Links", tone: "bg-primary/10 text-primary" },
  { icon: Film, label: "Reels", tone: "bg-[#ffe7f1] text-[#d53f7b]" },
  { icon: Newspaper, label: "Articles", tone: "bg-[#eaf7ea] text-[#3f8d4a]" },
  { icon: BookOpen, label: "Documents", tone: "bg-[#ebf3ff] text-[#416df0]" },
  { icon: Podcast, label: "Podcasts", tone: "bg-[#efe9ff] text-[#6943d8]" },
  { icon: Tags, label: "Highlights", tone: "bg-[#ececec] text-[#55515d]" },
];

export const ContentTypes = () => {
  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-28" id="capture">
      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="mb-4 text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Consolidate your inputs
          </div>
          <h2 className="text-3xl font-semibold tracking-[-0.06em] text-brand-ink md:text-6xl">
            Bring every scattered source
            <span className="text-primary"> into one quiet system.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Import from the places you already learn. BrainBox normalizes the mess, links related ideas, and makes the whole archive searchable.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-[34px] border landing-glass p-6 shadow-[0_28px_90px_-52px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-8"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Supported content
            </div>
            <div className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-brand-ink">
              Save from anywhere without changing your workflow.
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {contentTypes.map((type, i) => (
                <motion.div
                  key={type.label}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="rounded-[24px] border landing-panel p-4 text-center shadow-[0_10px_30px_-26px_rgba(0,0,0,0.36)]"
                >
                  <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${type.tone}`}>
                    <type.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 text-sm font-medium text-brand-ink">{type.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-[34px] border landing-gradient-panel p-6 shadow-[0_28px_90px_-52px_rgba(0,0,0,0.45)] md:p-8"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Incoming stream</span>
              Sources merge into one queue
            </div>
            <div className="mt-6 space-y-4">
              {[
                ["Design systems interview", "Video", "Summarized and tagged under product thinking"],
                ["Atomic habits notes.pdf", "PDF", "Linked with behavior change and writing prompts"],
                ["Thread on retention loops", "Article", "Connected to startup research and saved snippets"],
              ].map(([title, type, desc]) => (
                <div key={title} className="rounded-[24px] border landing-panel px-4 py-4 shadow-[0_12px_24px_-22px_rgba(0,0,0,0.32)]">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold text-brand-ink">{title}</div>
                    <div className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">{type}</div>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
