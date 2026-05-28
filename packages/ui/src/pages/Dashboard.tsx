import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/react";
import { ChevronLeft, ChevronRight, Search, Sparkles, X } from "lucide-react";
import axios from "axios";
import { v1 as uuidv1 } from "uuid";

import { Button } from "../component/UI/Button";
import { PlusIcon } from "../icons/PlusIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { CreateContentModel } from "../component/UI/CreateContentModel";
import { Sidebar } from "../component/UI/Sidebar";
import ChatBot from "./ChatBot";
import BotButton from "./BotButton";
import ChatWindow from "./ChatWindow";
import { MyContext } from "./Context";
import ChatNavbar from "./ChatNavbar";
import { Card } from "../component/UI/Card";
import { WebsitePreview } from "../component/UI/WebsitePreview";
import { BACKEND_URL } from "../config";
import { getAuthorizationHeader, getUserDisplayName } from "@mysecondbrain/common";

export function Dashboard() {
  const { getToken, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();

  const user = clerkUser
    ? {
        username: getUserDisplayName(clerkUser),
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
      }
    : undefined;

  const [modelOpen, setModelOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Content | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedType, setSelectedType] = useState<"twitter" | "youtube" | "document" | "links" | "chat">("youtube");
  const [isChatOpen, setisChatOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebaropen, setSidebaropen] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [currThreadId, setcurrThreadId] = useState<string>(uuidv1());
  const [prevChats, setprevChats] = useState<Chat[]>([]);
  const [newChat, setnewChat] = useState(true);
  const [allThreads, setAllThreads] = useState<Thread[]>([]);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  interface Content {
    _id: string;
    title: string;
    link: string;
    type: "youtube" | "twitter" | "document" | "links";
  }

  type Chat = {
    role: string;
    content: string;
  };

  interface Thread {
    threadId: string;
    title: string;
  }

  useEffect(() => {
    if (!isSignedIn) {
      setContents([]);
      return;
    }
    void fetchContents();
  }, [isSignedIn]);

  const fetchContents = async () => {
    try {
      const authorization = await getAuthorizationHeader(getToken);
      const res = await axios.get(`${BACKEND_URL}/api/v1/content`, {
        headers: {
          Authorization: authorization,
        },
      });
      setContents(res.data.content);
    } catch (err) {
      console.error("Failed to fetch contents", err);
    }
  };

  const handleDelete = async (contentId: string) => {
    try {
      const authorization = await getAuthorizationHeader(getToken);
      await axios.delete(`${BACKEND_URL}/api/v1/content/${contentId}`, {
        headers: {
          Authorization: authorization,
        },
      });
      setContents((prev) => prev.filter((item) => item._id !== contentId));
    } catch (err) {
      console.error("Failed to delete content", err);
      alert("Error deleting content");
    }
  };

  useEffect(() => {
    if (selectedCard?.type === "twitter" && (window as any).twttr) {
      (window as any).twttr.widgets.load();
    }
  }, [selectedCard]);

  const filteredContents = contents
    .filter((content) => content.type === selectedType)
    .filter((content) =>
      searchQuery
        ? content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          content.link.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const cardsPerPage = sidebaropen ? 3 : 4;
  const totalPages = Math.ceil(filteredContents.length / cardsPerPage);
  const paginatedContents = filteredContents.slice((currentPage - 1) * cardsPerPage, currentPage * cardsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  const selectedTypeLabel: Record<"twitter" | "youtube" | "document" | "links" | "chat", string> = {
    youtube: "YouTube",
    twitter: "Twitter",
    document: "Documents",
    links: "Links",
    chat: "Chat",
  };

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setcurrThreadId,
    newChat,
    setnewChat,
    prevChats,
    setprevChats,
    allThreads,
    setAllThreads,
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <Sidebar
        selectedType={selectedType}
        onSelectType={setSelectedType}
        user={user}
        sidebaropen={sidebaropen}
        setSidebaropen={setSidebaropen}
      />

      <div className={`relative transition-all duration-300 ${sidebaropen ? "lg:ml-[17rem]" : "lg:ml-0"}`}>
        <MyContext.Provider value={providerValues}>
          {selectedType === "chat" && (
            <div className="flex h-screen w-full bg-background">
              <div className="flex min-h-0 flex-1 flex-col">
                <ChatNavbar />
                <ChatWindow />
              </div>
            </div>
          )}
        </MyContext.Provider>

        <CreateContentModel
          open={modelOpen}
          onClose={() => {
            setModelOpen(false);
            fetchContents();
          }}
        />

        {selectedType !== "chat" && (
          <div className="min-h-screen px-4 pb-8 pt-5 lg:px-8 lg:pt-6">
            <div className="mx-auto max-w-[1560px]">
              <div className="sticky top-0 z-20 rounded-[32px] border border-border/80 bg-[hsl(var(--surface-elevated)/0.82)] p-4 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-[0_10px_24px_-22px_rgba(0,0,0,0.32)]">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Quiet workspace mode
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl font-semibold tracking-[-0.05em] text-brand-ink lg:text-3xl">
                        {selectedTypeLabel[selectedType]}
                      </h1>
                      <div className="inline-flex h-7 items-center justify-center rounded-full border border-border bg-surface px-3 text-xs font-semibold tabular-nums text-muted-foreground">
                        {filteredContents.length} items
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Browse, collect, and reopen the knowledge saved in this workspace.</p>
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
                    <div className="relative w-full lg:w-80">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search saved content"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-11 w-full rounded-full border border-border bg-surface/85 py-2 pl-11 pr-10 text-sm text-foreground shadow-[0_8px_24px_-22px_rgba(0,0,0,0.34)] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={async () => {
                          try {
                            const authorization = await getAuthorizationHeader(getToken);
                            const response = await axios.post(
                              `${BACKEND_URL}/api/v1/brain/share`,
                              { share: true },
                              {
                                headers: {
                                  Authorization: authorization,
                                },
                              }
                            );
                            const url = `${window.location.origin}/share/${response.data.hash}`;
                            alert(url);
                          } catch (error: any) {
                            console.error("Failed to share brain:", error);
                            alert("Could not generate shareable link. Please try again.");
                          }
                        }}
                        startIcon={<ShareIcon size="md" />}
                        variant="secondary"
                        text="Share"
                        size="md"
                      />
                      <Button
                        onClick={() => setModelOpen(true)}
                        startIcon={<PlusIcon size="md" />}
                        variant="primary"
                        text="Add Content"
                        size="md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                {searchQuery && <p className="mb-4 text-sm text-muted-foreground">Search results for "{searchQuery}"</p>}

                <div
                  key={currentPage}
                  className={`w-full transition-all duration-300 ease-out ${
                    direction === "next" ? "animate-slide-left" : "animate-slide-right"
                  }`}
                >
                  <div
                    className={`grid gap-5 lg:gap-6 ${
                      sidebaropen ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
                    }`}
                  >
                    {filteredContents.length > 0 ? (
                      paginatedContents.map(({ type, link, title, _id }) => (
                        <Card
                          key={_id}
                          type={type}
                          link={link}
                          title={title}
                          contentId={_id}
                          onDelete={() => handleDelete(_id)}
                          onClick={() => setSelectedCard({ _id, title, link, type })}
                        />
                      ))
                    ) : searchQuery ? (
                      <div className="col-span-full rounded-[32px] border border-dashed border-border bg-surface-elevated/75 py-18 text-center shadow-[0_18px_50px_-34px_rgba(0,0,0,0.32)]">
                        <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                        <h3 className="text-lg font-medium text-brand-ink">No results found</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Try another keyword or clear the search.</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {filteredContents.length > 0 && totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-4 pb-8">
                    <button
                      onClick={() => {
                        setDirection("prev");
                        setCurrentPage((prev) => Math.max(1, prev - 1));
                      }}
                      disabled={currentPage === 1}
                      className="group flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-elevated shadow-[0_12px_28px_-20px_rgba(0,0,0,0.34)] transition-all hover:bg-surface-strong disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronLeft className="h-5 w-5 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
                    </button>

                    <span className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-muted-foreground shadow-[0_12px_28px_-20px_rgba(0,0,0,0.3)]">
                      Page <span className="text-primary">{currentPage}</span> of {totalPages}
                    </span>

                    <button
                      onClick={() => {
                        setDirection("next");
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                      }}
                      disabled={currentPage === totalPages}
                      className="group flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-elevated shadow-[0_12px_28px_-20px_rgba(0,0,0,0.34)] transition-all hover:bg-surface-strong disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedType !== "chat" && (
          <>
            {isChatOpen && <ChatBot onClose={() => setisChatOpen(false)} />}
            {!isChatOpen && <BotButton onClick={() => setisChatOpen(true)} />}
          </>
        )}

        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="relative h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-border bg-surface-elevated p-4 shadow-[0_40px_100px_-50px_rgba(0,0,0,0.55)] sm:h-[85vh] sm:p-6">
              <button
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-sm transition-colors hover:bg-surface-strong hover:text-foreground"
                onClick={() => setSelectedCard(null)}
                aria-label="Close card"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="mb-4 pr-10 text-center text-xl font-semibold tracking-[-0.03em] text-brand-ink sm:mb-6 sm:text-2xl">
                {selectedCard.title}
              </h2>

              {selectedCard.type === "youtube" && (
                <iframe
                  className="h-[280px] w-full rounded-[24px] border border-border shadow-lg sm:h-[500px]"
                  src={selectedCard.link.replace("watch", "embed").replace("?v=", "/")}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              )}

              {selectedCard.type === "twitter" && (
                <div className="flex justify-center">
                  <blockquote className="twitter-tweet w-full" data-theme="dark">
                    <a href={selectedCard.link.replace("x.com", "twitter.com")}></a>
                  </blockquote>
                </div>
              )}

              {selectedCard.type === "document" && (
                <div className="rounded-[24px] border border-border bg-surface p-6">
                  <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{selectedCard.link}</p>
                </div>
              )}

              {selectedCard.type === "links" && (
                <div className="h-[280px] w-full overflow-hidden rounded-[24px] border border-border sm:h-[500px]">
                  <WebsitePreview url={selectedCard.link} title={selectedCard.title} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
