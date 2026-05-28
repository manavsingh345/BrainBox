"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[42px] w-full" />; // placeholder to prevent layout shift
  }

  return (
    <div className="flex items-center gap-1 rounded-xl border border-neutral-200/50 bg-neutral-100/50 p-1 dark:border-white/10 dark:bg-white/5">
      <button
        onClick={() => setTheme("light")}
        className={`flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all ${
          theme === "light"
            ? "bg-white text-neutral-900 shadow-sm"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        }`}
        title="Light Mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all ${
          theme === "system"
            ? "bg-white text-neutral-900 shadow-sm dark:bg-white/10 dark:text-white"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        }`}
        title="System Preference"
      >
        <Laptop className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex flex-1 items-center justify-center rounded-lg py-1.5 transition-all ${
          theme === "dark"
            ? "bg-[#222] text-white shadow-sm dark:bg-white/10 dark:text-white"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        }`}
        title="Dark Mode"
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
