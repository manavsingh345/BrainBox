import { useEffect, useState } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../component/UI/Button';
import { PlusIcon } from '../icons/PlusIcon';
import { ShareIcon } from '../icons/ShareIcon';
import { Card } from '../component/UI/Card';
import { CreateContentModel } from '../component/UI/CreateContentModel';
import { Sidebar } from '../component/UI/Sidebar';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import Microlink from '@microlink/react';
import DraggableChatBot from './Draggable';
import BotButton from './BotButton';
import ChatWindow from './ChatWindow';
import { MyContext } from './Context';
import { v1 as uuidv1 } from 'uuid';
import ChatNavbar from './ChatNavbar';

import './Dashboard.css';

export function Dashboard() {
  const safeParseJson = <T,>(raw: string | null): T | null => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  };
  const user = safeParseJson<{ username: string; email: string }>(
    localStorage.getItem('user')
  ) || undefined;
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Content | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  interface Content {
    _id: string;
    title: string;
    link: string;
    type: 'youtube' | 'twitter' | 'document' | 'links';
  }
  type Chat = {
    role: string;
    content: string;
  };
  interface Thread {
    threadId: string;
    title: string;
  }

  const [contents, setContents] = useState<Content[]>([]);
  const [selectedType, setSelectedType] = useState<'twitter' | 'youtube' | 'document' | 'links' | 'chat'>('youtube');
  const [isChatOpen, setisChatOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebaropen, setSidebaropen] = useState(false);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/content`, {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      setContents(res.data.content);
    } catch (err) {
      console.error('Failed to fetch contents', err);
    }
  };

  const handleDelete = async (contentId: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/content/${contentId}`, {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      setContents((prev) => prev.filter((item) => item._id !== contentId));
    } catch (err) {
      console.error('Failed to delete content', err);
      alert('Error deleting content');
    }
  };

  useEffect(() => {
    if (selectedCard?.type === 'twitter' && (window as any).twttr) {
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
  const paginatedContents = filteredContents.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [currThreadId, setcurrThreadId] = useState<string>(uuidv1());
  const [prevChats, setprevChats] = useState<Chat[]>([]);
  const [newChat, setnewChat] = useState(true);
  const [allThreads, setAllThreads] = useState<Thread[]>([]);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const selectedTypeLabel: Record<'twitter' | 'youtube' | 'document' | 'links' | 'chat', string> = {
    youtube: 'YouTube',
    twitter: 'Twitter',
    document: 'Documents',
    links: 'Links',
    chat: 'Chat',
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
    <div className='dashboard-grid dashboard-content-scroll'>
      <Sidebar selectedType={selectedType} onSelectType={setSelectedType} user={user} sidebaropen={sidebaropen} setSidebaropen={setSidebaropen}/>

      <div
        className={`transition-all duration-300 ${
          selectedType === 'chat'
            ? 'h-screen overflow-hidden px-0 pt-0'
            : 'min-h-screen px-3 pt-10 sm:px-4 lg:px-6 lg:pt-2'
        } ${
          sidebaropen ? 'lg:ml-72' : 'lg:ml-10'
        }`}
      >
        <MyContext.Provider value={providerValues}>
          {selectedType === 'chat' && (
            <div className="h-full w-full flex flex-col bg-white">
              <ChatNavbar />
              <ChatWindow />
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

        {selectedType !== 'chat' && (
          <div className="mx-auto w-full max-w-[1400px] py-2">
            <div className="mb-1 grid grid-cols-1 gap-2 xl:grid-cols-[1fr_minmax(380px,540px)_auto] xl:items-center">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between xl:justify-start xl:gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
                  <p className="text-sm text-slate-500">
                    Manage your <span className="font-medium text-slate-700">{selectedTypeLabel[selectedType]}</span> content in real time
                  </p>
                </div>
                <div className="inline-flex min-w-[92px] items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium tabular-nums text-slate-600 shadow-sm">
                  {filteredContents.length} items
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-white via-slate-50 to-white p-2.5 shadow-sm xl:col-span-2">
                <div className="grid grid-cols-1 gap-2 xl:grid-cols-[minmax(380px,540px)_auto] xl:items-center">
                  <div className="relative xl:w-full">
                    <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by title or link..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/95 py-3 pl-12 pr-12 text-gray-800 placeholder-gray-400 shadow-sm transition-all hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  <div className="flex w-full flex-row flex-wrap items-center justify-end gap-2 xl:w-auto xl:flex-nowrap">
                    <Button
                      onClick={() => setModelOpen(true)}
                      startIcon={<PlusIcon size="lg" />}
                      variant="primary"
                      text="Add content"
                      size="sm"
                    />

                    <Button
                      onClick={async () => {
                        try {
                          const response = await axios.post(
                            `${BACKEND_URL}/api/v1/brain/share`,
                            { share: true },
                            {
                              headers: {
                                Authorization: localStorage.getItem('token'),
                              },
                            }
                          );
                          const url = `http://localhost:5173/share/${response.data.hash}`;
                          alert(url);
                        } catch (error: any) {
                          console.error('Failed to share brain:', error);
                          alert('Could not generate shareable link. Please try again.');
                        }
                      }}
                      startIcon={<ShareIcon size="lg" />}
                      variant="secondary"
                      text="Share Brain"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            {searchQuery && (
              <p className="mt-3 text-sm text-slate-600">
                Found {filteredContents.length} result{filteredContents.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {selectedType !== 'chat' && (
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 overflow-hidden pb-6">
            <div key={currentPage} className={`transition-all duration-300 ease-out ${direction === 'next' ? 'animate-slide-left': 'animate-slide-right'}`}>
        <div
          className={`grid gap-3 lg:gap-4 ${
            sidebaropen
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
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
          <div className="col-span-full w-full rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <Search className="mx-auto mb-3 h-8 w-8 text-gray-400" />
            <h3 className="text-lg font-medium text-slate-800">No results found</h3>
            <p className="mt-1 text-sm text-slate-500">Try another keyword or clear the search.</p>
          </div>
        ) : null}
      </div>
    </div>


            {filteredContents.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pb-8">
                    <button
                        onClick={() => {
                          setDirection('prev');
                          setCurrentPage(prev => Math.max(1, prev - 1));
                        }}
                        disabled={currentPage === 1}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white shadow-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>


                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600 shadow-sm">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => {
                    setDirection('next');
                    setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  }}
                  disabled={currentPage === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white shadow-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>

              </div>
            )}
          </div>
        )}

        {selectedType !== 'chat' && (
          <>
            {isChatOpen && <DraggableChatBot onClose={() => setisChatOpen(false)} />}
            {!isChatOpen && <BotButton onClick={() => setisChatOpen(true)} />}
          </>
        )}

        {selectedCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="relative h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/60 bg-white/95 p-4 shadow-2xl sm:h-[85vh] sm:p-6">
              <button
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setSelectedCard(null)}
                aria-label="Close card"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="mb-4 pr-10 text-center text-xl font-semibold text-gray-900 sm:mb-6 sm:text-2xl">{selectedCard.title}</h2>

              {selectedCard.type === 'youtube' && (
                <iframe
                  className="h-[280px] w-full rounded-xl border border-gray-200 sm:h-[500px]"
                  src={selectedCard.link.replace('watch', 'embed').replace('?v=', '/')}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              )}

              {selectedCard.type === 'twitter' && (
                <div className="flex justify-center">
                  <blockquote className="twitter-tweet w-full">
                    <a href={selectedCard.link.replace('x.com', 'twitter.com')}></a>
                  </blockquote>
                </div>
              )}

              {selectedCard.type === 'document' && (
                <p className="whitespace-pre-line text-gray-800 mt-2">{selectedCard.link}</p>
              )}

              {selectedCard.type === 'links' && (
                <div className="h-[280px] w-full sm:h-[500px]">
                  <div className="w-full h-full block">
                    <Microlink url={selectedCard.link} size="large" style={{ height: '100%', maxWidth: '100%' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
