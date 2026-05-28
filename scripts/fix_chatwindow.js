const fs = require('fs');
const filePath = 'C:/Users/hp/Projects/MySecondBrainProject/packages/ui/src/pages/ChatWindow.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const returnIndex = content.indexOf('return (');
if (returnIndex !== -1) {
  content = content.substring(0, returnIndex) + `return (
    <div className="flex h-full w-full min-h-0 bg-[#f9f9f9] dark:bg-black transition-colors duration-300">
      <div className="flex-1 min-h-0 pr-3 md:pr-5 lg:pr-6 relative">
        {/* Dark mode futuristic glow */}
        <div className="absolute inset-0 pointer-events-none hidden dark:block shadow-[inset_0_0_120px_rgba(0,150,255,0.05)] z-0 rounded-3xl mix-blend-screen"></div>

        <div className="chatWindow relative z-10 h-full w-full flex flex-col items-center bg-transparent text-[#1a1a1a] dark:text-white transition-colors duration-300">
          <div className="w-full flex-1 min-h-0 flex justify-center mt-4">
            <Chat1 />
          </div>
          <RingLoader color="currentColor" loading={loader} size={30} className="mb-2" />
          {notice && (
            <div
              className={\`absolute top-4 right-4 z-50 rounded-lg border px-4 py-2 text-sm shadow-md \${
                notice.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
                  : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"
              }\`}
            >
              {notice.message}
            </div>
          )}

          <div className="flex flex-col justify-center items-center w-full shrink-0 px-4 mb-4">
            <div className="inputBox w-full max-w-3xl pb-2 space-y-2">
              {contextItems.length > 0 && (
                <div className="flex flex-wrap gap-2 px-2">
                  {contextItems.map((item) => (
                    <div
                      key={item.id}
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 dark:border-white/10 dark:bg-white/10 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 backdrop-blur-md shadow-sm transition-all"
                    >
                      <i
                        className={
                          item.type === "pdf"
                            ? "fa-solid fa-file text-neutral-500 dark:text-neutral-400"
                            : item.type === "youtube"
                            ? "fa-brands fa-youtube text-red-500"
                            : "fa-solid fa-link text-blue-500 dark:text-blue-400"
                        }
                      ></i>
                      {item.href ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="max-w-[200px] truncate hover:underline"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <span className="max-w-[200px] truncate">{item.label}</span>
                      )}
                      {item.status && item.status !== "ready" && (
                        <span className="rounded-full bg-amber-100/80 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium uppercase text-amber-700 dark:text-amber-400">
                          {item.status}
                        </span>
                      )}
                      <button
                        type="button"
                        className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors ml-1 w-4 h-4 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
                        onClick={() => setContextItems((prev) => prev.filter((x) => x.id !== item.id))}
                        aria-label="Remove context item"
                      >
                        <i className="fa-solid fa-xmark text-[10px]"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative rounded-[32px] border border-neutral-300 bg-white/90 dark:border-white/10 dark:bg-white/5 backdrop-blur-md shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50 dark:focus-within:ring-white/20">
                {/* Textarea */}
                <textarea 
                  placeholder="Ask anything..." 
                  className="w-full pl-[52px] pr-[52px] py-[18px] bg-transparent text-inherit outline-none resize-none flex items-center min-h-[60px] rounded-[32px] placeholder:text-neutral-400 dark:placeholder:text-neutral-500" 
                  value={prompt} 
                  onChange={e => setPrompt(e.target.value)}
                  rows={prompt.split('\\n').length > 1 ? Math.min(prompt.split('\\n').length, 5) : 1}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      getReply();
                    }
                  }}
                />

                {/* PLUS BUTTON */}
                <div 
                  className="absolute left-5 top-1/2 -translate-y-1/2 cursor-pointer text-lg text-neutral-400 hover:text-neutral-700 dark:text-white/50 dark:hover:text-white transition-colors p-1" 
                  onClick={() => setShowMenu(prev => !prev)}
                >
                  <i className="fa-solid fa-plus"></i>
                </div>

              {showMenu && (
              <div className="absolute left-0 bottom-full mb-3 bg-white dark:bg-[#1a1a1a] border border-neutral-100 dark:border-white/10 shadow-xl rounded-2xl p-2 w-56 z-50 animate-fade-in">
              
              {/* PDF */}
              <button
                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-200"
                onClick={() => {
                  setShowMenu(false);
                  if (!ensureUploadAccess()) return;
                  handleFile();
                }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-white/5">
                  <i className="fa-solid fa-file text-neutral-600 dark:text-neutral-400"></i>
                </div>
                Upload Document
              </button>

              {/* YouTube */}
              <button 
                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-200"
                onClick={() => {
                  setShowMenu(false);
                  if (!ensureUploadAccess()) return;
                  setShowLinkInput("youtube");
                }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10">
                  <i className="fa-brands fa-youtube text-red-500"></i>
                </div>
                YouTube Video
              </button>

              {/* Link */}
              <button 
                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-xl transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-200"
                onClick={() => {
                  setShowMenu(false);
                  if (!ensureUploadAccess()) return;
                  setShowLinkInput("link");
                }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10">
                  <i className="fa-solid fa-link text-blue-500 dark:text-blue-400"></i>
                </div>
                Website Link
              </button>
            </div>
              )}

                {/* Send */}
                <div 
                  onClick={!loader && prompt.trim() ? getReply : undefined}  
                  className={\`flex items-center justify-center w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 \${ (loader || !prompt.trim()) ? "opacity-30 pointer-events-none" : "hover:scale-105 hover:bg-primary dark:hover:bg-primary shadow-sm"}\`}
                >
                  <i className="fa-solid fa-arrow-up text-sm"></i>
                </div>
              </div>
            </div>

            {showLinkInput && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-[#1a1a1a] p-5 rounded-2xl w-[400px] shadow-xl border border-neutral-200 dark:border-white/10">
                    <h3 className="font-semibold mb-3 text-neutral-900 dark:text-white">
                      {showLinkInput === "youtube" ? "Add YouTube link" : "Add website link"}
                    </h3>

                    <input
                      className="w-full border border-neutral-300 dark:border-white/10 bg-transparent p-2.5 rounded-lg mb-4 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Paste link here"
                      value={tempLink}
                      onChange={e => setTempLink(e.target.value)}
                    />

                    <div className="flex justify-end gap-2">
                       <button
                        className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-lg text-neutral-600 dark:text-neutral-400 transition-colors font-medium text-sm"
                        onClick={() => {
                          setShowLinkInput(null);
                          setTempLink("");
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-lg transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200 font-medium text-sm shadow-sm"
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

            <p className="info text-xs text-neutral-400 dark:text-neutral-500 mt-3 font-light mb-1">
              BrainBox can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>

      <Sidebar1 />
    </div>
  );
}
`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed syntax error by replacing return block completely');
}
