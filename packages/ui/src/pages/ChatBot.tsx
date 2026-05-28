import { useState, useRef, useEffect } from "react";
import { Brain, X, Send } from "lucide-react";
import { BACKEND_URL } from "../config";
import { motion } from "framer-motion";
import ResponseRenderer from "./ResponseRender";

type ChatMessage = {
  sender?: "user" | "bot";
  text?: string;
};

interface ChatBotProps {
  onClose?: () => void;
}

export default function ChatBot({ onClose }: ChatBotProps) {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chats]);

  const getReply = async () => {
    if (!message.trim() || isLoading) return;
    
    setChats((prev) => [...prev, { sender: "user", text: message }]);
    setMessage("");
    setIsLoading(true);

    const payload = { message };
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chat`, options);
      const data = await response.json();
      if (!response.ok) {
        setChats((prev) => [...prev, { sender: "bot", text: "Unable to fetch reply right now." }]);
        return;
      }
      setChats((prev) => [...prev, { sender: "bot", text: data.reply || "No response generated." }]);
    } catch (e) {
      setChats((prev) => [...prev, { sender: "bot", text: "Network error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, type: "spring", bounce: 0.25 }}
      style={{ transformOrigin: "bottom right" }}
      className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-[24px] border border-neutral-200/60 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#111111]/80"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/60 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-black/20">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-sm text-primary-foreground">
            <Brain className="h-4 w-4 text-white" />
          </span>
          <p className="font-semibold text-neutral-800 dark:text-neutral-200">SecondBrain Bot</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-200/50 hover:text-neutral-800 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {chats.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
            <Brain className="mb-2 h-8 w-8 text-neutral-400 dark:text-neutral-500" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Ask me anything!</p>
          </div>
        )}
        {chats.map((chat, idx) => (
          <div key={idx} className={`flex w-full ${chat.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`rounded-2xl px-4 py-2.5 text-sm ${
                chat.sender === "user"
                  ? "max-w-[85%] bg-primary text-primary-foreground shadow-sm"
                  : "w-full max-w-[95%] bg-white dark:bg-white/10 border border-neutral-100 dark:border-white/5 text-neutral-800 dark:text-neutral-200 shadow-sm prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800"
              }`}
            >
              {chat.sender === "user" ? (
                chat.text
              ) : (
                <ResponseRenderer content={chat.text || ""} />
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="max-w-[85%] rounded-2xl bg-white dark:bg-white/10 px-4 py-2.5 border border-neutral-100 dark:border-white/5 shadow-sm">
              <div className="flex space-x-1.5 items-center h-4">
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 dark:bg-neutral-500 [animation-delay:-0.3s]"></div>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 dark:bg-neutral-500 [animation-delay:-0.15s]"></div>
                <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 dark:bg-neutral-500"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-neutral-200/60 bg-white/40 p-3 dark:border-white/10 dark:bg-black/20">
        <div className="relative flex items-center rounded-full border border-neutral-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a1a1a] focus-within:ring-2 focus-within:ring-primary/50">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? getReply() : "")}
            placeholder="Type your message..."
            className="w-full bg-transparent py-2.5 pl-4 pr-12 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
          />
          <button
            onClick={getReply}
            disabled={!message.trim() || isLoading}
            className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary"
          >
            <Send className="h-4 w-4 ml-[-2px] mt-[1px]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
