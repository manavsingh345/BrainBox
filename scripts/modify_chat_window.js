const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/hp/Projects/MySecondBrainProject/packages/ui/src/pages/ChatWindow.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replacements
content = content.replace(
  '<div className="flex h-full w-full min-h-0">', 
  '<div className="flex h-full w-full min-h-0 bg-[#f9f9f9] dark:bg-black transition-colors duration-300">'
);

content = content.replace(
  '<div className="flex-1 min-h-0 pr-3 md:pr-5 lg:pr-6">',
  '<div className="flex-1 min-h-0 pr-3 md:pr-5 lg:pr-6 relative"><div className="absolute inset-0 pointer-events-none hidden dark:block shadow-[inset_0_0_120px_rgba(0,150,255,0.05)] z-0 rounded-3xl mix-blend-screen"></div>'
);

content = content.replace(
  '<div className="chatWindow h-full w-full flex flex-col items-center bg-white text-black">',
  '<div className="chatWindow relative z-10 h-full w-full flex flex-col items-center bg-transparent text-[#1a1a1a] dark:text-white transition-colors duration-300">'
);

content = content.replace(
  'notice.type === "error"\n                  ? "border-red-200 bg-red-50 text-red-700"\n                  : "border-blue-200 bg-blue-50 text-blue-700"',
  'notice.type === "error"\n                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"\n                  : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400"'
);

content = content.replace(
  '<div className="flex flex-col justify-center items-center w-full shrink-0">',
  '<div className="flex flex-col justify-center items-center w-full shrink-0 px-4 mb-4">'
);

content = content.replace(
  '<div className="inputBox w-full pb-2">',
  '<div className="inputBox w-full max-w-3xl pb-2 space-y-2">'
);

content = content.replace(
  '<div className="mb-2 flex flex-wrap gap-2 px-1">',
  '<div className="flex flex-wrap gap-2 px-2">'
);

content = content.replace(
  'className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"',
  'className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 dark:border-white/10 dark:bg-white/10 px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-200 backdrop-blur-md shadow-sm transition-all"'
);

content = content.replace(
  /className={[\s\S]*?item\.type === "pdf"[\s\S]*?\? "fa-solid fa-file text-slate-600"[\s\S]*?: item\.type === "youtube"[\s\S]*?\? "fa-brands fa-youtube text-red-500"[\s\S]*?: "fa-solid fa-link text-blue-600"[\s\S]*?}/g,
  `className={
                          item.type === "pdf"
                            ? "fa-solid fa-file text-neutral-500 dark:text-neutral-400"
                            : item.type === "youtube"
                            ? "fa-brands fa-youtube text-red-500"
                            : "fa-solid fa-link text-blue-500 dark:text-blue-400"
                        }`
);

content = content.replace(
  '<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase text-amber-700">',
  '<span className="rounded-full bg-amber-100/80 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium uppercase text-amber-700 dark:text-amber-400">'
);

content = content.replace(
  '<button\n                        type="button"\n                        className="text-slate-500 hover:text-slate-800"\n                        onClick={() => setContextItems((prev) => prev.filter((x) => x.id !== item.id))}\n                        aria-label="Remove context item"\n                      >\n                        x\n                      </button>',
  `<button
                        type="button"
                        className="text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors ml-1 w-4 h-4 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10"
                        onClick={() => setContextItems((prev) => prev. filter((x) => x.id !== item.id))}
                        aria-label="Remove context item"
                      >
                        <i className="fa-solid fa-xmark text-[10px]"></i>
                      </button>`
);

content = content.replace(
  '<div className="relative">',
  '<div className="relative rounded-[32px] border border-neutral-300 bg-white/90 dark:border-white/10 dark:bg-white/5 backdrop-blur-md shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50 dark:focus-within:ring-white/20">'
);

content = content.replace(
  '<textarea placeholder="Ask anything" className="w-full pl-12 pr-12" value={prompt} onChange={e => setPrompt(e.target.value)}',
  `<textarea 
                  placeholder="Ask anything..." 
                  className="w-full pl-[52px] pr-[52px] py-[18px] bg-transparent text-inherit outline-none resize-none flex items-center min-h-[60px] rounded-[32px] placeholder:text-neutral-400 dark:placeholder:text-neutral-500" 
                  value={prompt} 
                  onChange={e => setPrompt(e.target.value)}
                  rows={prompt.split('\\n').length > 1 ? Math.min(prompt.split('\\n').length, 5) : 1}`
);

content = content.replace(
  '<div className="absolute left-4 top-1/2 -translate-y-1/5 cursor-pointer text-xl" onClick={() => setShowMenu(prev => !prev)}\n                  ><i className="fa-solid fa-plus"></i></div>',
  `<div 
                  className="absolute left-5 top-1/2 -translate-y-1/2 cursor-pointer text-lg text-neutral-400 hover:text-neutral-700 dark:text-white/50 dark:hover:text-white transition-colors p-1" 
                  onClick={() => setShowMenu(prev => !prev)}
                >
                  <i className="fa-solid fa-plus"></i>
                </div>`
);


content = content.replace(
  '<div className="absolute left-4 bottom-16 bg-white shadow-lg rounded-xl p-2 w-48 z-50">',
  '<div className="absolute left-0 bottom-full mb-3 bg-white dark:bg-[#1a1a1a] border border-neutral-100 dark:border-white/10 shadow-xl rounded-2xl p-2 w-56 z-50 animate-fade-in">'
);

// Menu Buttons
content = content.replace(
  '<button\n                className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded"\n                onClick={() => {\n                  setShowMenu(false);\n                  if (!ensureUploadAccess()) return;\n                  handleFile();\n                }}\n              >\n                <i className="fa-solid fa-file text-gray-700"></i>\n                Upload PDF\n              </button>',
  `<button
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
              </button>`
);

content = content.replace(
  '<button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded"\n                onClick={() => {\n                  setShowMenu(false);\n                  if (!ensureUploadAccess()) return;\n                  setShowLinkInput("youtube");\n                }}\n              >\n                <i className="fa-brands fa-youtube text-red-500"></i>YouTube link\n              </button>',
  `<button 
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
              </button>`
);

content = content.replace(
  '<button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded"\n                onClick={() => {\n                  setShowMenu(false);\n                  if (!ensureUploadAccess()) return;\n                  setShowLinkInput("link");\n                }}\n              >\n                <i className="fa-solid fa-link text-blue-600"></i> Website link </button>',
  `<button 
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
              </button>`
);

content = content.replace(
  '<div onClick={!loader ? getReply : undefined}  className={`cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-xl ${ loader ? "opacity-50 pointer-events-none" : ""}`}>\n                  <i className="fa-solid fa-paper-plane"></i>\n                </div>',
  `<div 
                  onClick={!loader && prompt.trim() ? getReply : undefined}  
                  className={\`flex items-center justify-center w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 \${ (loader || !prompt.trim()) ? "opacity-30 pointer-events-none" : "hover:scale-105 hover:bg-primary dark:hover:bg-primary shadow-sm"}\`}
                >
                  <i className="fa-solid fa-arrow-up text-sm"></i>
                </div>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Script updated ChatWindow.tsx successfully.');
