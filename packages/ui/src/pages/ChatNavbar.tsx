import { Brain, Search } from "lucide-react";

export default function ChatNavbar() {
  return (
    <div className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/6 bg-[#09090b]/95 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-orange-500/15 bg-orange-500/10 text-orange-500">
          <Brain className="h-4.5 w-4.5" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-[-0.03em] text-white">BrainBox Chat</div>
          <div className="text-xs text-slate-400">Ask across your saved workspace</div>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 md:flex">
        <Search className="h-3.5 w-3.5 text-orange-400" />
        Knowledge-grounded answers
      </div>
    </div>
  );
}
