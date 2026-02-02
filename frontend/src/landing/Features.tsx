import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Search, 
  Sparkles, 
  FolderTree, 
  Share2, 
  Zap 
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Chat with Anything",
    description: "Ask questions about your saved content. Get instant, accurate answers from your PDFs, videos, and articles.",
  },
  {
    icon: Sparkles,
    title: "AI Auto-Organize",
    description: "Content is automatically tagged, categorized, and linked. No manual sorting required.",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find exactly what you need with AI-powered search that understands meaning, not just keywords.",
  },
  {
    icon: FolderTree,
    title: "Smart Collections",
    description: "Content automatically groups into smart collections based on topics and your usage patterns.",
  },
  {
    icon: Share2,
    title: "Share Your Brain",
    description: "Export and share curated knowledge with your team, students, or the public.",
  },
  {
    icon: Zap,
    title: "Instant Capture",
    description: "Browser extension and mobile app for saving content in one click from anywhere.",
  },
];

export const Features = () => {
  return (
    <section className="py-20 md:py-32 relative" id="feature">
      <div className="absolute inset-0 bg-surface/50" />
      
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Superpowers for Your <span className="text-primary">Knowledge</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            More than bookmarking. BrainBox transforms how you learn, research, and create.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
              <div className="h-full p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-card-hover">
                <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
