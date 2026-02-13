import { MyContext } from "./Context"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import "./Chat1.css"
import ResponseRenderer from "./ResponseRender"

export default function Chat1(){
    const {newChat,prevChats} = useContext(MyContext);
    const [typedAssistantMessage, setTypedAssistantMessage] = useState("");
    const [typingChatIndex, setTypingChatIndex] = useState<number | null>(null);
    const prevLengthRef = useRef(0);

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
      const timer = window.setInterval(() => {
        cursor += 1;
        setTypedAssistantMessage(latestAssistant.slice(0, cursor));
        if (cursor >= latestAssistant.length) {
          window.clearInterval(timer);
          setTypingChatIndex(null);
        }
      }, 12);

      return () => window.clearInterval(timer);
    }, [lastAssistantIndex, prevChats]);
    
    return (
        <div className="w-full h-full min-h-0 flex flex-col">
        {newChat && <h1 className="text-3xl pt-6 text-center">BrainBox Welcome's you!</h1>}
        <div className="chats w-full h-full min-h-0">
            {
                prevChats?.map((chat,idx)=>
                <div className={chat.role==="user" ? "userDiv" : "gptDiv"} key={idx}>
                   {chat.role==="user" ? 
                <div className="userBlock">
                    {chat.fileUrl && (
                <a
                    href={chat.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachmentCard"
                >
                <i className="fa-solid fa-file-lines text-slate-600"></i>
                <span className="attachmentName">{chat.fileName || "Uploaded file"}</span>
                </a>
                )}
                {chat.linkUrl && (
                <a
                    href={chat.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="attachmentCard"
                >
                <i className="fa-solid fa-link text-slate-600"></i>
                <span className="attachmentName">{chat.linkUrl}</span>
                </a>
                )}
                {chat.content?.trim() && <p className="userMessage">{chat.content}</p>}
                </div>: 
                    <div className="prose max-w-none dark:prose-invert">
                    <ResponseRenderer content={typingChatIndex === idx ? typedAssistantMessage : chat.content} />
                </div>
                    }
                </div>
            )
            }
            
        </div>
        </div>
    )
}
