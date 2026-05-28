import { MyContext } from "./Context"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import ResponseRenderer from "./ResponseRender"
import { useUser } from "@clerk/react"

const getTypingStep = (messageLength: number) => {
  // Fluid, smooth typing animation matching standard LLM stream rates (Gemini-like)
  if (messageLength > 3000) return 12;
  if (messageLength > 2000) return 8;
  if (messageLength > 1000) return 5;
  if (messageLength > 500) return 4;
  return 2;
};

export default function Chat1(){
    const {newChat,prevChats} = useContext(MyContext);
    const { user } = useUser();
    const [typedAssistantMessage, setTypedAssistantMessage] = useState("");
    const [typingChatIndex, setTypingChatIndex] = useState<number | null>(null);
    const prevLengthRef = useRef(0);
    const isWelcomeState = newChat && (prevChats?.length ?? 0) === 0;

    const lastAssistantIndex = useMemo(() => {
      for (let i = (prevChats?.length ?? 0) - 1; i >= 0; i -= 1) {
        if (prevChats[i]?.role === "assistant") return i;
      }
      return -1;
    }, [prevChats]);

    useEffect(() => {
      const currentLength = prevChats?.length ?? 0;
      const previousLength = prevLengthRef.current;
      prevLengthRef.current = currentLength;

      if (currentLength <= previousLength || lastAssistantIndex < 0) return;
      const latestMessage = prevChats[currentLength - 1];
      const isNewAssistantAtEnd =
        latestMessage?.role === "assistant" && lastAssistantIndex === currentLength - 1;
      if (!isNewAssistantAtEnd) return;

      // Avoid replaying typing animation when loading long existing history.
      if (currentLength - previousLength > 2) {
        setTypingChatIndex(null);
        setTypedAssistantMessage("");
        return;
      }

      const latestAssistant = prevChats[lastAssistantIndex]?.content ?? "";
      setTypingChatIndex(lastAssistantIndex);
      setTypedAssistantMessage("");

      let cursor = 0;
      const step = getTypingStep(latestAssistant.length);
      const timer = window.setInterval(() => {
        cursor = Math.min(cursor + step, latestAssistant.length);
        setTypedAssistantMessage(latestAssistant.slice(0, cursor));
        if (cursor >= latestAssistant.length) {
          window.clearInterval(timer);
          setTypingChatIndex(null);
        }
      }, 16);

      return () => window.clearInterval(timer);
    }, [lastAssistantIndex, prevChats]);
    
    return (
        <div className="w-full h-full min-h-0 flex flex-col">
          {isWelcomeState && (
          <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 pt-18 text-center animate-fade-in md:px-8">
             <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-500 shadow-[0_0_40px_-18px_rgba(249,115,22,0.85)]">
               <i className="fa-solid fa-brain text-2xl"></i>
             </div>
             <div className="max-w-4xl">
               <h1 className="text-4xl font-semibold tracking-[-0.06em] text-white md:text-6xl">
                 What can <span className="text-orange-500">BrainBox</span> help you with?
               </h1>
               <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400 md:text-xl">
                 Ask across your saved knowledge, documents, links, and videos in one focused workspace.
               </p>
             </div>

             <div className="mt-10 flex w-full max-w-3xl flex-wrap items-center justify-center gap-3">
                <div className="rounded-full border border-slate-800 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.7)]">
                  <i className="fa-solid fa-file-lines mr-2 text-orange-400"></i>
                  Analyze documents
                </div>
                <div className="rounded-full border border-slate-800 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.7)]">
                  <i className="fa-solid fa-code mr-2 text-cyan-400"></i>
                  Debug code
                </div>
                <div className="rounded-full border border-slate-800 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.7)]">
                  <i className="fa-solid fa-link mr-2 text-amber-400"></i>
                  Summarize links
                </div>
                <div className="rounded-full border border-slate-800 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 shadow-[0_16px_40px_-30px_rgba(0,0,0,0.7)]">
                  <i className="fa-solid fa-bolt mr-2 text-fuchsia-400"></i>
                  Explore ideas
                </div>
             </div>
          </div>
          )}
        <div className={`chats w-full min-h-0 overflow-y-auto dashboard-content-scroll px-3 md:px-6 relative ${
          isWelcomeState ? "hidden" : "h-full pt-6 pb-32"
        }`}>
          <div className="flex flex-col max-w-5xl mx-auto w-full gap-5">
            {
                prevChats?.map((chat,idx)=>
                <div className="flex flex-col w-full" key={idx}>
                   {chat.role==="user" ? 
                <div className="flex w-full justify-end">
                  <div className="flex w-full max-w-2xl flex-col items-end px-2 py-2">
                     <div className="mb-3 flex items-center justify-end gap-2.5">
                         <span className="font-semibold text-sm text-brand-ink">{user?.firstName || "You"}</span>
                         <div className="w-7 h-7 rounded-full bg-surface-elevated flex items-center justify-center text-[10px] font-bold text-muted-foreground shadow-sm border border-border">
                            {user?.firstName?.charAt(0) || "U"}
                         </div>
                     </div>
                    <div className="w-full rounded-[28px] border border-primary/15 bg-primary/[0.06] px-5 py-4 text-left shadow-[0_18px_40px_-30px_rgba(30,112,235,0.45)]">
                    {Array.isArray(chat.attachments) && chat.attachments.length > 0 && (
                <div className="userAttachments mb-3 flex flex-wrap justify-end gap-2">
                  {chat.attachments.map((attachment, aIdx) => (
                    <a
                      key={`${attachment.type}-${attachment.href || attachment.label}-${aIdx}`}
                      href={attachment.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachmentCard w-fit rounded-full border border-border bg-surface px-3 py-2 flex items-center gap-2 text-sm text-muted-foreground hover:bg-surface-strong hover:text-foreground transition-colors shadow-[0_8px_22px_-18px_rgba(0,0,0,0.28)]"
                    >
                      <i
                        className={
                          attachment.type === "pdf"
                            ? "fa-solid fa-file-lines text-slate-500"
                            : attachment.type === "youtube"
                            ? "fa-brands fa-youtube text-red-500"
                            : "fa-solid fa-link text-slate-500"
                        }
                      ></i>
                      <span className="attachmentName truncate max-w-[200px]">{attachment.label}</span>
                    </a>
                  ))}
                </div>
                    )}
                    {chat.fileUrl && (
                <a
                    href={chat.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachmentCard mb-3 ml-auto flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-strong hover:text-foreground shadow-[0_8px_22px_-18px_rgba(0,0,0,0.28)]"
                >
                <i className="fa-solid fa-file-lines text-slate-500"></i>
                <span className="attachmentName">{chat.fileName || "Uploaded file"}</span>
                </a>
                )}
                {chat.linkUrl && (
                <a
                    href={chat.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachmentCard mb-3 ml-auto flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-strong hover:text-foreground shadow-[0_8px_22px_-18px_rgba(0,0,0,0.28)]"
                >
                <i className="fa-solid fa-link text-slate-500"></i>
                <span className="attachmentName">{chat.linkUrl}</span>
                </a>
                )}
                {chat.content?.trim() && <p className="text-[15px] leading-7 text-foreground whitespace-pre-wrap font-medium">{chat.content}</p>}
                </div>
                </div></div>: 
                    <div className="flex w-full justify-start">
                      <div className="w-full max-w-3xl px-2 py-2">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-orange-500 text-black shadow-sm ring-1 ring-orange-500/30">
                              <i className="fa-solid fa-brain text-[10px]"></i>
                            </div>
                            <span className="font-semibold text-sm tracking-[-0.02em] text-white">BrainBox</span>
                          </div>
                      <div className="prose max-w-none rounded-[28px] border border-white/8 bg-[#111317] px-5 py-4 shadow-[0_18px_36px_-30px_rgba(0,0,0,0.6)] dark:prose-invert prose-p:leading-loose prose-pre:bg-black prose-pre:border prose-pre:border-white/10 text-[15px] text-slate-200">
                        <ResponseRenderer content={typingChatIndex === idx ? typedAssistantMessage : chat.content} />
                      </div>
                      </div>
                    </div>
                    }
                </div>
            )
            }
          </div>
        </div>
        </div>
    )
}
