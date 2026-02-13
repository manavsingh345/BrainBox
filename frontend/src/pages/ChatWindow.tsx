import { useContext, useState, useEffect } from "react";
import Chat1 from "./Chat1";
import "./ChatWindow.css";
import { MyContext } from "./Context";
import { RingLoader } from "react-spinners";
import Sidebar1 from "./Sidebar1";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

export default function ChatWindow() {
  const { prompt, setPrompt,setReply, currThreadId,setprevChats,setnewChat} = useContext(MyContext);
  const navigate = useNavigate();

  const [loader, setLoader] = useState<boolean>(false);
  const [contextItems, setContextItems] = useState<
    Array<{ id: string; type: "pdf" | "link" | "youtube"; label: string; href?: string }>
  >([]);

  const [showMenu, setShowMenu] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState<null | "youtube" | "link">(null);
  const [tempLink, setTempLink] = useState("");
  const [notice, setNotice] = useState<{ type: "info" | "error"; message: string } | null>(null);


  const token = localStorage.getItem("token") ?? "";

  const safeParseJson = <T,>(raw: string | null): T | null => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  };

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

  const addContextItem = (item: { type: "pdf" | "link" | "youtube"; label: string; href?: string }) => {
    const id = `${item.type}:${item.href || item.label}`;
    setContextItems((prev) => {
      if (prev.some((x) => x.id === id)) return prev;
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

  const ensureUploadAccess = () => {
    const parsedUser = safeParseJson<{ isUpgraded?: boolean }>(localStorage.getItem("user"));
    const hasUpgrade = Boolean(parsedUser?.isUpgraded);

    if (hasUpgrade) return true;

    setShowMenu(false);
    setShowLinkInput(null);
    navigate("/pricing", { state: { reason: "upgrade_required" } });
    return false;
  };

  // CHAT 
  const getReply = async () => {
    if (!prompt.trim() || loader) return;
    const userMessage = prompt.trim();
    const messageAttachments = contextItems.map((item) => ({
      type: item.type,
      label: item.label,
      href: item.href
    }));

    setLoader(true);
    setnewChat(false);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chat1`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({
          message: userMessage,
          threadId: currThreadId
        })
      });

      const data = await parseJsonResponse(response);
      if (!response.ok) {
        setReply(data?.error || "Something went wrong. Please try again.");
        return;
      }
      const assistantReply = data.reply || "Something went wrong. Please try again.";
      setReply(assistantReply);
      setprevChats(prev => [
        ...prev,
        { role: "user", content: userMessage, attachments: messageAttachments },
        { role: "assistant", content: assistantReply }
      ]);
      setPrompt("");
      setContextItems([]);
    } catch (err) {
      console.error(err);
      setReply("Failed to fetch response.");
    } finally {
      setLoader(false);
    }
  };

  // PDF UPLOAD 
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
      const response = await fetch(
          `${BACKEND_URL}/api/v1/upload/pdf`,
          {
            method: "POST",
            headers: {
              Authorization: token
            },
            body: formData
          }
        );

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
          addContextItem({
            type: "pdf",
            label: data.filename || "Uploaded PDF",
            href: data.path,
          });
          showNotice("PDF added. Ask your question to chat with this file.", "info");
        }
      } catch (err) {
        console.error("PDF upload failed", err);
        showNotice("Failed to upload file");
      }
    });

    el.click();
  };

  // NEW: upload youtube using direct url
const uploadYoutubeByUrl = async (url: string) => {
  if (!ensureUploadAccess()) return;
  if (!url.trim()) return;

  try {
    setLoader(true);

    const response = await fetch(`${BACKEND_URL}/api/v1/youtube`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        url,
        threadId: currThreadId
      })
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
    });
    showNotice("YouTube link added. Ask your question now.", "info");
  } catch (err) {
    console.error("YouTube upload failed", err);
    showNotice("Failed to upload YouTube link");
  } finally {
    setLoader(false);
  }
};

// NEW: upload link using direct url
const uploadLinkByUrl = async (url: string) => {
  if (!ensureUploadAccess()) return;
  if (!url.trim()) return;

  try {
    setLoader(true);

    const res = await fetch(`${BACKEND_URL}/api/v1/upload/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        url,
        threadId: currThreadId
      })
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
    });
    showNotice("Website link added. Ask your question now.", "info");
  } catch (err) {
    console.error("Link upload failed", err);
    showNotice("Failed to upload link");
  } finally {
    setLoader(false);
  }
};

  return (
    <div className="flex h-full w-full min-h-0">
      <div className="flex-1 min-h-0 pr-3 md:pr-5 lg:pr-6">
        <div className="chatWindow h-full w-full flex flex-col items-center bg-white text-black">
          <div className="w-full flex-1 min-h-0 flex justify-center">
            <Chat1 />
          </div>
          <RingLoader color="#000" loading={loader} />
          {notice && (
            <div
              className={`absolute top-4 right-4 z-50 rounded-lg border px-4 py-2 text-sm shadow-md ${
                notice.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {notice.message}
            </div>
          )}

          <div className="flex flex-col justify-center items-center w-full shrink-0">
            <div className="inputBox w-full pb-2">
              {contextItems.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2 px-1">
                  {contextItems.map((item) => (
                    <div
                      key={item.id}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                    >
                      <i
                        className={
                          item.type === "pdf"
                            ? "fa-solid fa-file text-slate-600"
                            : item.type === "youtube"
                            ? "fa-brands fa-youtube text-red-500"
                            : "fa-solid fa-link text-blue-600"
                        }
                      ></i>
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="max-w-[220px] truncate hover:underline"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span className="max-w-[220px] truncate">{item.label}</span>
                      )}
                      <button
                        type="button"
                        className="text-slate-500 hover:text-slate-800"
                        onClick={() => setContextItems((prev) => prev.filter((x) => x.id !== item.id))}
                        aria-label="Remove context item"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                {/* Textarea */}
                <textarea placeholder="Ask anything" className="w-full pl-12 pr-12" value={prompt} onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      getReply();
                    }
                  }}
                />

                {/* PLUS BUTTON */}
                <div className="absolute left-4 top-1/2 -translate-y-1/5 cursor-pointer text-xl" onClick={() => setShowMenu(prev => !prev)}
                  ><i className="fa-solid fa-plus"></i></div>

              {showMenu && (
              <div className="absolute left-4 bottom-16 bg-white shadow-lg rounded-xl p-2 w-48 z-50">
              
              {/* PDF */}
              <button
                className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  setShowMenu(false);
                  if (!ensureUploadAccess()) return;
                  handleFile();
                }}
              >
                <i className="fa-solid fa-file text-gray-700"></i>
                Upload PDF
              </button>

              {/* YouTube */}
              <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  setShowMenu(false);
                  if (!ensureUploadAccess()) return;
                  setShowLinkInput("youtube");
                }}
              >
                <i className="fa-brands fa-youtube text-red-500"></i>YouTube link
              </button>

              {/* Link */}
              <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  setShowMenu(false);
                  if (!ensureUploadAccess()) return;
                  setShowLinkInput("link");
                }}
              >
                <i className="fa-solid fa-link text-blue-600"></i> Website link </button>
            </div>
              )}




                {/* Send */}
                <div onClick={!loader ? getReply : undefined}  className={`cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-xl ${ loader ? "opacity-50 pointer-events-none" : ""}`}>
                  <i className="fa-solid fa-paper-plane"></i>
                </div>
              </div>
            </div>


            {showLinkInput && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                  <div className="bg-white p-4 rounded-xl w-[400px]">
                    <h3 className="font-semibold mb-2">
                      {showLinkInput === "youtube" ? "Add YouTube link" : "Add website link"}
                    </h3>

                    <input
                      className="w-full border p-2 rounded mb-3"
                      placeholder="Paste link here"
                      value={tempLink}
                      onChange={e => setTempLink(e.target.value)}
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        className="px-3 py-1 border rounded"
                        onClick={() => {
                          setShowLinkInput(null);
                          setTempLink("");
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        className="px-3 py-1 bg-black text-white rounded"
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
                        Add
                </button>
              </div>
            </div>
          </div>
            )}


            <p className="info text-sm">
              BrainBox can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>

      <Sidebar1 />
    </div>
  );
}

