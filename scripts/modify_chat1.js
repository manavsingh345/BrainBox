const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/hp/Projects/MySecondBrainProject/packages/ui/src/pages/Chat1.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replacements
content = content.replace(
  '{newChat && <h1 className="text-3xl pt-6 text-center">BrainBox Welcome\\'s you!</h1>}',
  `{newChat && (
  <div className="flex flex-col items-center justify-center h-full pt-20 pb-20 mb-[10vh] space-y-4 animate-fade-in my-auto">
     <div className="w-20 h-20 rounded-[28px] bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center mb-2 inset-0 ring-1 ring-orange-500/20">
       <i className="fa-solid fa-brain text-4xl text-orange-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.6)]"></i>
     </div>
     <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">BrainBox AI</h1>
     <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-sm text-center font-light">What can I help you discover today?</p>
  </div>
)}`
);

content = content.replace(
  '<div className="chats w-full h-full min-h-0">',
  '<div className="chats w-full h-full min-h-0 overflow-y-auto pt-6 pb-32 space-y-2 dashboard-content-scroll max-w-4xl mx-auto px-2 md:px-0">'
);

content = content.replace(
  '<div className={chat.role==="user" ? "userDiv" : "gptDiv"} key={idx}>',
  '<div className={chat.role==="user" ? "flex flex-col items-end w-full mb-6 w-full" : "flex flex-col items-start w-full mb-10 w-full"} key={idx}>'
);

content = content.replace(
  '<div className="userBlock">',
  '<div className="flex flex-col items-end max-w-[85%] md:max-w-[70%] space-y-2 group">'
);

content = content.replace(
  '{chat.content?.trim() && <p className="userMessage">{chat.content}</p>}',
  '{chat.content?.trim() && <p className="px-5 py-3.5 bg-[#f0f0f0] dark:bg-white/10 text-neutral-900 dark:text-neutral-50 rounded-[24px] rounded-tr-[4px] text-[15px] leading-relaxed shadow-sm dark:shadow-none border border-transparent dark:border-white/5">{chat.content}</p>}'
);

content = content.replace(
  '<div className="assistantMessage prose max-w-none dark:prose-invert">',
  `<div className="flex flex-col w-full max-w-[95%] md:max-w-[85%] space-y-3">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                          <i className="fa-solid fa-brain text-[14px]"></i>
                        </div>
                        <span className="font-semibold text-[15px] text-neutral-900 dark:text-white/90">BrainBox</span>
                      </div>
                      <div className="prose max-w-none dark:prose-invert prose-p:leading-loose prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 text-[15px] text-neutral-700 dark:text-neutral-300 ml-1">`
);

content = content.replace(
  '<ResponseRenderer content={typingChatIndex === idx ? typedAssistantMessage : chat.content} />\n                </div>',
  `<ResponseRenderer content={typingChatIndex === idx ? typedAssistantMessage : chat.content} />
                      </div>
                    </div>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Script updated Chat1.tsx successfully.');
