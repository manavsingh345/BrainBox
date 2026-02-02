import { motion } from "framer-motion";
import { 
  Youtube, 
  Twitter, 
  FileText, 
  Link, 
  Film, 
  Newspaper,
  BookOpen,
  Podcast
} from "lucide-react";

const contentTypes = [
  { icon: Youtube, label: "YouTube", color: "bg-red-500" },
  { icon: Twitter, label: "Twitter", color: "bg-sky-500" },
  { icon: FileText, label: "PDFs", color: "bg-orange-500" },
  { icon: Link, label: "Links", color: "bg-primary" },
  { icon: Film, label: "Reels & TikToks", color: "bg-pink-500" },
  { icon: Newspaper, label: "Articles", color: "bg-green-500" },
  { icon: BookOpen, label: "Documents", color: "bg-blue-500" },
  { icon: Podcast, label: "Podcasts", color: "bg-violet-500" },
];

export const ContentTypes = () => {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Grid background continues */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      
      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Save <span className="text-primary">Anything</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Import content from any platform. BrainBox automatically organizes and makes it searchable.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {contentTypes.map((type, i) => (
            <motion.div
              key={type.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-card-hover">
                <div className="relative flex flex-col items-center gap-3">
                  <div className={`p-3 rounded-xl ${type.color} shadow-lg`}>
                    <type.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium text-foreground">{type.label}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
