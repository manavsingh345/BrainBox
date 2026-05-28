import { useContext, useEffect } from "react";
import { useAuth } from "@clerk/react";
import { Brain, FileText, MessageSquarePlus, Trash2 } from "lucide-react";
import { v1 as uuidv1 } from "uuid";

import { MyContext } from "./Context";
import { BACKEND_URL } from "../config";
import { getAuthorizationHeader } from "@mysecondbrain/common";

interface Thread {
  threadId: string;
  title: string;
  pdfId?: string[];
  hasPDF?: boolean;
}

export default function Sidebar1() {
  const { getToken, isSignedIn } = useAuth();
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setPrompt,
    setnewChat,
    setReply,
    setcurrThreadId,
    setprevChats,
  } = useContext(MyContext);

  const getAllThreads = async () => {
    try {
      const token = await getAuthorizationHeader(getToken);
      const response = await fetch(`${BACKEND_URL}/api/v1/thread`, {
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch threads");

      const res = await response.json();
      const filterData = res.map((thread: Thread) => ({
        threadId: thread.threadId,
        title: thread.title,
        hasPDF: Array.isArray(thread.pdfId) && thread.pdfId.length > 0,
      }));
      setAllThreads(filterData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      setAllThreads([]);
      return;
    }
    void getAllThreads();
  }, [currThreadId, getToken, isSignedIn, setAllThreads]);

  const NewChat = () => {
    setnewChat(true);
    setPrompt("");
    setReply("");
    setcurrThreadId(uuidv1());
    setprevChats([]);
  };

  const changeThread = async (newthreadId: string) => {
    setcurrThreadId(newthreadId);
    try {
      const token = await getAuthorizationHeader(getToken);
      const response = await fetch(`${BACKEND_URL}/api/v1/thread/${newthreadId}`, {
        headers: {
          Authorization: token,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch thread");

      const res = await response.json();
      setprevChats(res);
      setnewChat(false);
      setReply("");
    } catch (e) {
      console.error(e);
    }
  };

  const deleteThread = async (threadId: string) => {
    try {
      const token = await getAuthorizationHeader(getToken);
      const response = await fetch(`${BACKEND_URL}/api/v1/thread/${threadId}`, {
        headers: {
          Authorization: token,
        },
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete thread");

      setAllThreads((prev) => prev.filter((thread) => thread.threadId !== threadId));
      if (threadId === currThreadId) {
        NewChat();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="hidden h-full w-[17rem] shrink-0 flex-col border-l border-white/6 bg-[#0c0d10] px-4 py-5 lg:flex">
      <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-3 shadow-[0_20px_50px_-34px_rgba(0,0,0,0.65)]">
        <button
          className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/[0.05]"
          onClick={NewChat}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
            <MessageSquarePlus className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold tracking-[-0.02em] text-white">New chat</div>
            <div className="text-xs text-slate-400">Start a fresh thread</div>
          </div>
        </button>
      </div>

      <div className="mt-4 flex-1 overflow-hidden rounded-[24px] border border-white/8 bg-white/[0.03] shadow-[0_20px_50px_-34px_rgba(0,0,0,0.65)]">
        <div className="flex items-center gap-2 border-b border-white/8 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-400">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Conversations
            </div>
            <div className="text-sm text-white">{allThreads?.length ?? 0} threads</div>
          </div>
        </div>

        <div className="dashboard-content-scroll h-[calc(100%-73px)] space-y-1 overflow-y-auto p-3">
          {allThreads?.map((thread: Thread) => (
            <button
              key={thread.threadId}
              onClick={() => changeThread(thread.threadId)}
              className={`group flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                currThreadId === thread.threadId
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  currThreadId === thread.threadId ? "bg-orange-500/10 text-orange-500" : "bg-white/[0.04] text-slate-400"
                }`}
              >
                <Brain className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium tracking-[-0.02em]">{thread.title}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                  {thread.hasPDF && (
                    <>
                      <FileText className="h-3.5 w-3.5" />
                      Document context
                    </>
                  )}
                </div>
              </div>

              <span
                onClick={(e) => {
                  e.stopPropagation();
                  void deleteThread(thread.threadId);
                }}
                className="flex h-8 w-8 cursor-pointer shrink-0 items-center justify-center rounded-full text-slate-500 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
