import { useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { RingLoader } from "react-spinners";
import { BACKEND_URL } from "../config";
import { getAuthorizationHeader } from "@mysecondbrain/common";

import Chat1 from "./Chat1";
import { MyContext } from "./Context";
import Sidebar1 from "./Sidebar1";
import { useNavigate } from "react-router-dom";

export default function ChatWindow() {
  const { prompt, setPrompt, setReply, currThreadId, setcurrThreadId, setprevChats, setnewChat, newChat, prevChats } =
    useContext(MyContext);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [loader, setLoader] = useState<boolean>(false);
  const [contextItems, setContextItems] = useState<
    Array<{
      id: string;
      type: "pdf" | "link" | "youtube";
      label: string;
      href?: string;
      sourceId?: string;
      status?: "pending" | "processing" | "ready" | "failed";
      error?: string;
    }>
  >([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState<null | "youtube" | "link">(null);
  const [tempLink, setTempLink] = useState("");
  const [notice, setNotice] = useState<{ type: "info" | "error"; message: string } | null>(null);
  const isWelcomeState = newChat && (prevChats?.length ?? 0) === 0;

  const parseJsonResponse = async (response: Response) => {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return {};
    }
  };

  const showNotice = (message: string, type: "info" | "error" = "error") => {
    setNotice({ type, message });
  };

  const addContextItem = (item: {
    type: "pdf" | "link" | "youtube";
    label: string;
    href?: string;
    sourceId?: string;
    status?: "pending" | "processing" | "ready" | "failed";
    error?: string;
  }) => {
    const id = item.sourceId
      ? `${item.type}:${item.sourceId}`
      : `${item.type}:${item.href || item.label}`;
    setContextItems((prev) => {
      const existing = prev.find((x) => x.id === id);
      if (existing) {
        return prev.map((x) => (x.id === id ? { ...x, ...item, id } : x));
      }
      return [...prev, { ...item, id }];
    });
  };

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    setContextItems([]);
  }, [currThreadId]);

  useEffect(() => {
    const hasPending = contextItems.some((item) => item.status && item.status !== "ready" && item.status !== "failed");
    if (!hasPending || !currThreadId) return;

    let cancelled = false;
    const run = async () => {
      try {
        const token = await getAuthorizationHeader(getToken);
        const response = await fetch(`${BACKEND_URL}/api/v1/thread/${currThreadId}/context-status`, {
          headers: {
            Authorization: token,
          },
        });
        const data = await parseJsonResponse(response);
        if (!response.ok || cancelled) return;

        const statusMap = new Map<
          string,
          { status?: "pending" | "processing" | "ready" | "failed"; error?: string }
        >();
        const addStatusEntry = (type: "pdf" | "link" | "youtube", item: any) => {
          const fallbackKey = `${type}:${item.href || item.label}`;
          const sourceKey = item.id ? `${type}:${item.id}` : fallbackKey;
          const nextStatus = { status: item.status, error: item.error || "" };

          statusMap.set(sourceKey, nextStatus);
          statusMap.set(fallbackKey, nextStatus);
        };

        (data.pdfs || []).forEach((item: any) => addStatusEntry("pdf", item));
        (data.links || []).forEach((item: any) => addStatusEntry("link", item));
        (data.youtubeItems || []).forEach((item: any) => addStatusEntry("youtube", item));

        setContextItems((prev) => {
          const next = prev.map((item) => {
            const latest = statusMap.get(item.id) ?? statusMap.get(`${item.type}:${item.href || item.label}`);
            return latest
              ? {
                  ...item,
                  status: latest.status || item.status,
                  error: latest.error || "",
                }
              : item;
          });

          const failedItem = next.find(
            (item, index) =>
              item.status === "failed" &&
              prev[index]?.status !== "failed"
          );
          if (failedItem) {
            showNotice(
              failedItem.error
                ? `${failedItem.label} failed to process: ${failedItem.error}`
                : `${failedItem.label} failed to process.`,
              "error"
            );
          }

          return next;
        });
      } catch (error) {
        console.error("Failed to refresh context status", error);
      }
    };

    void run();
    const timer = window.setInterval(run, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [contextItems, currThreadId, getToken]);

  const ensureUploadAccess = () => {
    setShowMenu(false);
    return true;
  };

  const getReply = async () => {
    if (!prompt.trim() || loader) return;
    const pendingContext = contextItems.find(
      (item) => item.status && item.status !== "ready" && item.status !== "failed"
    );
    if (pendingContext) {
      showNotice(
        `${pendingContext.label} is still processing. You can keep chatting, but answers from that file will only work after indexing finishes.`,
        "info"
      );
    }

    const userMessage = prompt.trim();
    const messageAttachments = contextItems.map((item) => ({
      type: item.type,
      label: item.label,
      href: item.href,
    }));

    setLoader(true);
    setnewChat(false);

    try {
      const token = await getAuthorizationHeader(getToken);
      const response = await fetch(`${BACKEND_URL}/api/v1/chat1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          message: userMessage,
          threadId: currThreadId,
        }),
      });

      const data = await parseJsonResponse(response);
      if (!response.ok) {
        setReply(data?.error || "Something went wrong. Please try again.");
        return;
      }
      const assistantReply = data.reply || "Something went wrong. Please try again.";
      if (data.threadId && data.threadId !== currThreadId) {
        setcurrThreadId(data.threadId);
      }
      setReply(assistantReply);
      setprevChats((prev) => [...prev, { role: "user", content: userMessage, attachments: messageAttachments }, { role: "assistant", content: assistantReply }]);
      setPrompt("");
      setContextItems([]);
    } catch (err) {
      console.error(err);
      setReply("Failed to fetch response.");
    } finally {
      setLoader(false);
    }
  };

  const handleFile = () => {
    if (!ensureUploadAccess()) return;
    const el = document.createElement("input");
    el.type = "file";
    el.accept = ".pdf,.pptx,.docx";

    el.addEventListener("change", async () => {
      if (!el.files || el.files.length === 0) return;
      const file = el.files[0];
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("threadId", currThreadId);

      try {
        const token = await getAuthorizationHeader(getToken);
        const response = await fetch(`${BACKEND_URL}/api/v1/upload/pdf`, {
          method: "POST",
          headers: {
            Authorization: token,
          },
          body: formData,
        });

        const data = await parseJsonResponse(response);
        if (!response.ok) {
          if (data?.upgradeRequired) {
            navigate("/pricing", { state: { reason: "upgrade_required" } });
            return;
          }
          showNotice(data?.message || data?.error || "Failed to upload file");
          return;
        }

        if (data.path) {
          if (data.threadId && data.threadId !== currThreadId) {
            setcurrThreadId(data.threadId);
          }
          addContextItem({
            type: "pdf",
            label: data.filename || "Uploaded PDF",
            href: data.path,
            sourceId: data.pdfId?.toString(),
            status: data.processingStatus || "pending",
            error: data.error || "",
          });
          showNotice("Document added. We'll enable reliable answers once processing finishes.", "info");
        }
      } catch (err) {
        console.error("PDF upload failed", err);
        showNotice("Failed to upload file");
      }
    });

    el.click();
  };

  const uploadYoutubeByUrl = async (url: string) => {
    if (!ensureUploadAccess() || !url.trim()) return;

    try {
      setLoader(true);
      const token = await getAuthorizationHeader(getToken);
      const response = await fetch(`${BACKEND_URL}/api/v1/youtube`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          url,
          threadId: currThreadId,
        }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok) {
        if (data?.upgradeRequired) {
          navigate("/pricing", { state: { reason: "upgrade_required" } });
          return;
        }
        showNotice(data?.message || "Failed to upload YouTube link");
        return;
      }

      addContextItem({
        type: "youtube",
        label: "YouTube video",
        href: url,
        sourceId: data.videoId,
        status: data.processingStatus || "pending",
        error: data.error || "",
      });
      if (data.threadId && data.threadId !== currThreadId) {
        setcurrThreadId(data.threadId);
      }
      showNotice("YouTube link added. Processing started.", "info");
    } catch (err) {
      console.error("YouTube upload failed", err);
      showNotice("Failed to upload YouTube link");
    } finally {
      setLoader(false);
    }
  };

  const uploadLinkByUrl = async (url: string) => {
    if (!ensureUploadAccess() || !url.trim()) return;

    try {
      setLoader(true);
      const token = await getAuthorizationHeader(getToken);
      const res = await fetch(`${BACKEND_URL}/api/v1/upload/link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          url,
          threadId: currThreadId,
        }),
      });

      const data = await parseJsonResponse(res);
      if (!res.ok) {
        if (data?.upgradeRequired) {
          navigate("/pricing", { state: { reason: "upgrade_required" } });
          return;
        }
        showNotice(data.error || "Failed to upload link");
        return;
      }

      addContextItem({
        type: "link",
        label: url,
        href: url,
        sourceId: data.linkId?.toString(),
        status: data.processingStatus || "pending",
        error: data.error || "",
      });
      if (data.threadId && data.threadId !== currThreadId) {
        setcurrThreadId(data.threadId);
      }
      showNotice("Website link added. You can ask now while indexing continues.", "info");
    } catch (err) {
      console.error("Link upload failed", err);
      showNotice("Failed to upload link");
    } finally {
      setLoader(false);
    }
  };

  const composerWrapperClass = isWelcomeState
    ? "mx-auto w-full max-w-4xl space-y-3"
    : "mx-auto w-full max-w-3xl space-y-2 pb-2";

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full min-h-0 bg-[#09090b] text-white">
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 lg:px-5">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-white/6 bg-[#09090b] shadow-[0_30px_80px_-44px_rgba(0,0,0,0.9)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_55%)]" />
            <div className="absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.08),transparent_58%)]" />
          </div>

          <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center bg-transparent text-white">
            <div className="w-full flex-1 min-h-0">
              <Chat1 />
            </div>

            <RingLoader color="currentColor" loading={loader} size={26} className="mb-2" />

            {notice && (
              <div
                className={`absolute right-4 top-4 z-50 rounded-2xl border px-4 py-2 text-sm shadow-md ${
                  notice.type === "error"
                    ? "border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-300"
                    : "border-primary/25 bg-primary/10 text-primary"
                }`}
              >
                {notice.message}
              </div>
            )}

            <div className={`w-full shrink-0 px-4 ${isWelcomeState ? "pb-14" : "pb-4"}`}>
              <div className={composerWrapperClass}>
                {contextItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-2">
                    {contextItems.map((item) => (
                      <div
                        key={item.id}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 shadow-[0_8px_22px_-18px_rgba(0,0,0,0.6)]"
                      >
                        <i
                          className={
                            item.type === "pdf"
                              ? "fa-solid fa-file text-neutral-500"
                              : item.type === "youtube"
                              ? "fa-brands fa-youtube text-red-500"
                              : "fa-solid fa-link text-blue-500"
                          }
                        ></i>
                        {item.href ? (
                          <a href={item.href} target="_blank" rel="noopener noreferrer" className="max-w-[200px] truncate hover:underline">
                            {item.label}
                          </a>
                        ) : (
                          <span className="max-w-[200px] truncate">{item.label}</span>
                        )}
                        {item.status && item.status !== "ready" && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                              item.status === "failed"
                                ? "bg-red-500/12 text-red-600 dark:text-red-300"
                                : "bg-amber-500/12 text-amber-600 dark:text-amber-300"
                            }`}
                            title={item.error || undefined}
                          >
                            {item.status}
                          </span>
                        )}
                        <button
                          type="button"
                          className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-white/8 text-slate-400 transition-colors hover:text-white"
                          onClick={() => setContextItems((prev) => prev.filter((x) => x.id !== item.id))}
                          aria-label="Remove context item"
                        >
                          <i className="fa-solid fa-xmark text-[10px]"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className={`relative rounded-[32px] border border-white/10 bg-[#141414] p-2 shadow-[0_30px_80px_-38px_rgba(0,0,0,0.92)] ${
                  isWelcomeState ? "min-h-[172px]" : ""
                }`}>
                  <textarea
                    placeholder="Ask BrainBox anything..."
                    className={`w-full resize-none rounded-[28px] bg-transparent text-[15px] text-white outline-none placeholder:text-slate-500 ${
                      isWelcomeState
                        ? "min-h-[156px] px-5 pt-8 pb-20"
                        : "min-h-[60px] py-[16px] pl-[52px] pr-[52px]"
                    }`}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={prompt.split("\n").length > 1 ? Math.min(prompt.split("\n").length, 5) : 1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void getReply();
                      }
                    }}
                  />

                  <div
                    className={`absolute flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/8 bg-white/[0.04] text-slate-400 transition-colors hover:bg-white/[0.08] hover:text-white ${
                      isWelcomeState ? "bottom-5 left-5 top-auto translate-y-0" : "left-5 top-1/2 -translate-y-1/2"
                    }`}
                    onClick={() => setShowMenu((prev) => !prev)}
                  >
                    <i className="fa-solid fa-plus"></i>
                  </div>

                  {isWelcomeState && (
                    <div className="absolute bottom-5 left-[4.75rem] flex items-center gap-2">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">
                        <i className="fa-solid fa-globe text-slate-400"></i>
                        Workspace
                      </div>
                    </div>
                  )}

                  {showMenu && (
                    <div className="absolute bottom-full left-0 z-50 mb-3 w-56 rounded-[24px] border border-white/10 bg-[#111317] p-2 shadow-[0_22px_60px_-36px_rgba(0,0,0,0.88)] animate-fade-in">
                      <button
                        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.05]"
                        onClick={() => {
                          setShowMenu(false);
                          if (!ensureUploadAccess()) return;
                          handleFile();
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05]">
                          <i className="fa-solid fa-file text-slate-300"></i>
                        </div>
                        Upload Document
                      </button>

                      <button
                        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.05]"
                        onClick={() => {
                          setShowMenu(false);
                          if (!ensureUploadAccess()) return;
                          setShowLinkInput("youtube");
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10">
                          <i className="fa-brands fa-youtube text-red-500 dark:text-red-300"></i>
                        </div>
                        YouTube Video
                      </button>

                      <button
                        className="flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.05]"
                        onClick={() => {
                          setShowMenu(false);
                          if (!ensureUploadAccess()) return;
                          setShowLinkInput("link");
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <i className="fa-solid fa-link text-primary"></i>
                        </div>
                        Website Link
                      </button>
                    </div>
                  )}

                  {!isWelcomeState && (
                    <div className="absolute bottom-4 left-14 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                      grounded chat
                    </div>
                  )}

                  <div
                    onClick={!loader && prompt.trim() ? () => void getReply() : undefined}
                    className={`absolute flex items-center justify-center rounded-full transition-all duration-300 ${
                      isWelcomeState
                        ? "bottom-5 right-5 h-12 w-12 bg-orange-500 text-black"
                        : "right-4 top-1/2 h-8 w-8 -translate-y-1/2 bg-orange-500 text-black"
                    } ${
                      loader || !prompt.trim() ? "pointer-events-none opacity-30" : "cursor-pointer shadow-sm hover:bg-orange-400"
                    }`}
                  >
                    <i className="fa-solid fa-arrow-up text-sm"></i>
                  </div>
                </div>
              </div>

              {showLinkInput && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
                  <div className="w-[400px] rounded-[28px] border border-white/10 bg-[#111317] p-5 shadow-[0_24px_60px_-34px_rgba(0,0,0,0.8)]">
                    <h3 className="mb-3 font-semibold text-white">
                      {showLinkInput === "youtube" ? "Add YouTube link" : "Add website link"}
                    </h3>

                    <input
                      className="mb-4 w-full rounded-2xl border border-white/10 bg-transparent p-3 text-white outline-none focus:ring-2 focus:ring-orange-500/30"
                      placeholder="Paste link here"
                      value={tempLink}
                      onChange={(e) => setTempLink(e.target.value)}
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-full px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.05]"
                        onClick={() => {
                          setShowLinkInput(null);
                          setTempLink("");
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-black shadow-sm transition-colors hover:bg-orange-400"
                        onClick={async () => {
                          if (showLinkInput === "youtube") {
                            await uploadYoutubeByUrl(tempLink);
                          } else {
                            await uploadLinkByUrl(tempLink);
                          }
                          setTempLink("");
                          setShowLinkInput(null);
                        }}
                      >
                        Add Link
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <p className="info mt-3 mb-1 text-center text-xs text-slate-500">
                BrainBox can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Sidebar1 />
    </div>
  );
}
