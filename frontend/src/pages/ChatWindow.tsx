import { useContext, useState, useEffect } from "react";
import Chat1 from "./Chat1";
import "./ChatWindow.css";
import { MyContext } from "./Context";
import { RingLoader } from "react-spinners";
import Sidebar1 from "./Sidebar1";
import { useNavigate } from "react-router-dom";

export default function ChatWindow() {
  const { prompt, setPrompt,reply,setReply, currThreadId,setprevChats,setnewChat} = useContext(MyContext);
  const navigate = useNavigate();

  const [loader, setLoader] = useState<boolean>(false);
  const [uploadedFileurl, setUploadedFileurl] = useState("");
  const [uploadedFilename, setUploadedFilename] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState<null | "youtube" | "link">(null);
  const [tempLink, setTempLink] = useState("");
  const [notice, setNotice] = useState<{ type: "info" | "error"; message: string } | null>(null);


  const token = localStorage.getItem("token") ?? "";

  const showNotice = (message: string, type: "info" | "error" = "error") => {
    setNotice({ type, message });
  };

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const ensureUploadAccess = () => {
    const rawUser = localStorage.getItem("user");
    const parsedUser = rawUser ? JSON.parse(rawUser) : null;
    const hasUpgrade = Boolean(parsedUser?.isUpgraded);

    if (hasUpgrade) return true;

    setShowMenu(false);
    setShowLinkInput(null);
    navigate("/pricing", { state: { reason: "upgrade_required" } });
    return false;
  };

  // ---------------- CHAT ----------------
  const getReply = async () => {
    if (!prompt.trim() || loader) return;

    setLoader(true);
    setnewChat(false);

    try {
      const response = await fetch("http://localhost:3000/api/v1/chat1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({
          message: prompt,
          threadId: currThreadId
        })
      });

      const data = await response.json();
      setReply(data.reply || "Something went wrong. Please try again.");
      setUploadedFileurl("");
      setUploadedFilename("");
    } catch (err) {
      console.error(err);
      setReply("Failed to fetch response.");
    }

    setLoader(false);
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
          "http://localhost:3000/api/v1/upload/pdf",
          {
            method: "POST",
            headers: {
              Authorization: token
            },
            body: formData
          }
        );

        const data = await response.json();
        if (!response.ok) {
          if (data?.upgradeRequired) {
            navigate("/pricing", { state: { reason: "upgrade_required" } });
            return;
          }
          showNotice(data?.message || data?.error || "Failed to upload file");
          return;
        }

        if (data.path) {
          setReply("");
          setUploadedFileurl(data.path);
          setUploadedFilename(data.filename);

          setprevChats(prev => [
            ...prev,
            {
              role: "user",
              content: "",
              fileUrl: data.path,
              fileName: data.filename
            }
          ]);
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

    const response = await fetch("http://localhost:3000/api/v1/youtube", {
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
    const data = await response.json();
    if (!response.ok) {
      if (data?.upgradeRequired) {
        navigate("/pricing", { state: { reason: "upgrade_required" } });
        return;
      }
      showNotice(data?.message || "Failed to upload YouTube link");
      return;
    }

    setprevChats(prev => [
      ...prev,
      {
        role: "user",
        content: "Uploaded a YouTube video",
        videoUrl: url
      }
    ]);
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

    const res = await fetch("http://localhost:3000/api/v1/upload/link", {
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

    const data = await res.json();
    if (!res.ok) {
      if (data?.upgradeRequired) {
        navigate("/pricing", { state: { reason: "upgrade_required" } });
        return;
      }
      showNotice(data.error || "Failed to upload link");
      return;
    }

    setReply("");
    setprevChats(prev => [
      ...prev,
      {
        role: "user",
        content: "",
        linkUrl: url
      }
    ]);
  } catch (err) {
    console.error("Link upload failed", err);
    showNotice("Failed to upload link");
  } finally {
    setLoader(false);
  }
};



  // APPEND CHATS 
  useEffect(() => {
    if (prompt && reply) {
      setprevChats(prev => [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content: reply }
      ]);
    }
    setPrompt("");
  }, [reply]);


  return (
    <div className="flex h-full w-full min-h-0">
      <div className="flex-1 min-h-0">
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
            <div className="inputBox w-full flex justify-between items-center relative">
              {/* Uploaded file chip */}
              {uploadedFileurl && (
                <a
                  href={uploadedFileurl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute left-4 top-3 bg-gray-200 px-3 py-1 rounded-lg flex items-center gap-2 text-sm shadow"
                >
                  <i className="fa-solid fa-file"></i>
                  <span className="max-w-[120px] truncate">
                    {uploadedFilename}
                  </span>
                  <button
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      setUploadedFileurl("");
                    }}
                  >
                    ✕
                  </button>
                </a>
              )}

              {/* Textarea */}
              <textarea placeholder="Ask anything" className="w-full" value={prompt} onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    getReply();
                  }
                }}
              />

              {/* PLUS BUTTON */}
              <div className="absolute left-4 top-13 -translate-y-1/2 cursor-pointer text-xl" onClick={() => setShowMenu(prev => !prev)}
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
              <div onClick={!loader ? getReply : undefined}  className={`cursor-pointer absolute right-0 pr-8 text-xl ${ loader ? "opacity-50 pointer-events-none" : ""}`}>
                <i className="fa-solid fa-paper-plane"></i>
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
