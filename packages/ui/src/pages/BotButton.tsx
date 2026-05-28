import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface Click {
  onClick: () => void;
}

export default function BotButton({ onClick }: Click) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-surface-elevated/90 text-primary shadow-[0_18px_40px_-24px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-shadow hover:shadow-[0_20px_44px_-22px_rgba(0,0,0,0.5)]"
      aria-label="Open SecondBrain Bot"
    >
      <Brain className="h-5 w-5" />
    </motion.button>
  );
}
