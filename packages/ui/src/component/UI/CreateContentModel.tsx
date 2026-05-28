// import { useRef, useState } from 'react';
// import { CrossIcon } from '../../icons/CrossIcon.tsx';
// import { Button } from './Button.tsx';
// import { Input } from './Input.tsx';
// import axios from 'axios';
// import { BACKEND_URL } from '../../config.ts';
// import { YoutubeIcon } from '../../icons/YoutubeIcon.tsx';
// import { TwitterIcon } from '../../icons/TwitterIcon.tsx';
// import { Document } from '../../icons/Document.tsx';
// import { LinkIcon } from '../../icons/LinkIcon.tsx';
// import { SubmitIcon } from '../../icons/SubmitIcon.tsx';

// enum ContentType {
//   Youtube = "youtube",
//   Twitter = "twitter",
//   Document = "document",
//   Links = "links"
// }

// export function CreateContentModel({ open, onClose }: any) {
//     const titleRef = useRef<HTMLInputElement | null>(null);
//     const linkRef = useRef<HTMLInputElement | null>(null);
//     const textRef= useRef<HTMLTextAreaElement | null>(null);

//   const [type,setType]=useState(ContentType.Youtube);
//   async function addContent() {
//       const title = titleRef.current?.value;
//       const link =
//     type === ContentType.Document
//       ? textRef.current?.value
//       : linkRef.current?.value;

//   try {
//     await axios.post(`${BACKEND_URL}/api/v1/content`, {
//       link,
//       title,
//       type
//     }, {
//       headers: {
//         "Authorization": localStorage.getItem("token")
//       }
//     });
//     onClose();
//   } catch (error: any) {
//     console.error("Failed to add content:", error);
//     alert("Something went wrong. Please try again.");
//   }
// }


//   return (
//   <div>
//     {open && (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-30 backdrop-blur-sm">
//         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
//           {/* Close Button */}
//           <div className="flex justify-end">
//             <button onClick={onClose} className="text-gray-500 cursor-pointer">
//               <CrossIcon />
//             </button>
//           </div>

//           {/* Header */}
//         <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-center tracking-tight">
//                 Craft Your Content Here
//         </h2>



//           {/* Input Fields */}
//           <div className="space-y-3">
//             <Input ref={titleRef} placeholder="Title" />
//             {type === ContentType.Document ? (
//               <textarea
//                 ref={textRef}
//                 placeholder="Write your note here..."
//                 className="w-full h-36 p-3 border border-gray-300 rounded-lg resize-none shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
//               />
//             ) : (
//               <Input ref={linkRef} placeholder="Link" />
//             )}
//           </div>

//           {/* Type Selector */}
//           <div className="mt-6">
//             <h3 className="text-center font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-fuchsia-500 font-medium mb-2">What Are You Adding?</h3>
//             <div className="flex justify-between gap-2">
//               <Button
//                 size="md"
//                 text="Youtube"
//                 startIcon={<YoutubeIcon/>}
//                 variant={type === ContentType.Youtube ? "primary" : "secondary"}
//                 onClick={() => setType(ContentType.Youtube)}
//               />
//               <Button
//                 size="md"
//                 text="Twitter"
//                 startIcon={<TwitterIcon/>}
//                 variant={type === ContentType.Twitter ? "primary" : "secondary"}
//                 onClick={() => setType(ContentType.Twitter)}
//               />
//               <Button
//                 size="md"
//                 text="Document"
//                 startIcon={<Document/>}
//                 variant={type === ContentType.Document ? "primary" : "secondary"}
//                 onClick={() => setType(ContentType.Document)}
//               />
//               <Button
//                 size="md"
//                 text="Links"
//                 startIcon={<LinkIcon/>}
//                 variant={type === ContentType.Links ? "primary" : "secondary"}
//                 onClick={() => setType(ContentType.Links)}
//               />
//             </div>
//           </div>

//           {/* Submit */}
//           <div className="mt-6 flex justify-center">
//             <Button onClick={addContent} variant="primary" text="Craft" size="md" startIcon={<SubmitIcon/>}/>
//           </div>
//         </div>
//       </div>
//     )}
//   </div>
// );
// }

// <div className="relative flex items-center py-4">
 //  <div className={`absolute left-1/2 -translate-x-1/2 ${sidebaropen ? "min-w-5xl" : "min-w-2xl"}`}></div>
import { useRef, useState } from 'react';
import { useAuth } from '@clerk/react';
import { CrossIcon } from '../../icons/CrossIcon';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import { YoutubeIcon } from '../../icons/YoutubeIcon';
import { TwitterIcon } from '../../icons/TwitterIcon';
import { Document } from '../../icons/Document';
import { LinkIcon } from '../../icons/LinkIcon';
import { SubmitIcon } from '../../icons/SubmitIcon';
import { getAuthorizationHeader } from '@mysecondbrain/common';

enum ContentType {
  Youtube = "youtube",
  Twitter = "twitter",
  Document = "document",
  Links = "links"
}

interface CreateContentModelProps {
  open: boolean;
  onClose: () => void;
}

const typeOptions = [
  {
    value: ContentType.Youtube,
    label: "YouTube",
    icon: <YoutubeIcon />,
    activeClass: "border-rose-400/45 bg-rose-500/12 text-rose-600 dark:text-rose-300"
  },
  {
    value: ContentType.Twitter,
    label: "Twitter",
    icon: <TwitterIcon />,
    activeClass: "border-sky-400/45 bg-sky-500/12 text-sky-600 dark:text-sky-300"
  },
  {
    value: ContentType.Document,
    label: "Document",
    icon: <Document />,
    activeClass: "border-border bg-surface-strong text-foreground"
  },
  {
    value: ContentType.Links,
    label: "Links",
    icon: <LinkIcon />,
    activeClass: "border-emerald-400/45 bg-emerald-500/12 text-emerald-600 dark:text-emerald-300"
  }
];

export function CreateContentModel({ open, onClose }: CreateContentModelProps) {
    const titleRef = useRef<HTMLInputElement | null>(null);
    const linkRef = useRef<HTMLInputElement | null>(null);
    const textRef= useRef<HTMLTextAreaElement | null>(null);
    const { getToken } = useAuth();

  const [type,setType]=useState(ContentType.Youtube);
  async function addContent() {
      const title = titleRef.current?.value;
      const link =
    type === ContentType.Document
      ? textRef.current?.value
      : linkRef.current?.value;

  try {
    const authorization = await getAuthorizationHeader(getToken);
    await axios.post(`${BACKEND_URL}/api/v1/content`, {
      link,
      title,
      type
    }, {
      headers: {
        Authorization: authorization
      }
    });
    onClose();
  } catch (error: any) {
    console.error("Failed to add content:", error);
    alert("Something went wrong. Please try again.");
  }
}

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes overlayShow {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes contentShow {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-overlay { animation: overlayShow 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-content { animation: contentShow 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
      <div
        className="animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="animate-content relative w-full max-w-2xl overflow-hidden rounded-[24px] border border-border bg-surface-elevated shadow-[0_24px_80px_-40px_rgba(0,0,0,0.55)]"
          onClick={(e) => e.stopPropagation()}
        >
      {/* Clean affine card has no bright top bars */}

      <div className="p-6 sm:p-8">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl">Add Content</h2>
            <p className="mt-1 text-sm text-muted-foreground">Capture links, notes, and resources to your workspace.</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:bg-surface-strong hover:text-foreground"
            aria-label="Close add content modal"
          >
            <CrossIcon />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</label>
            <input
              ref={titleRef}
              type="text"
              placeholder="Enter a clear title"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {type === ContentType.Document ? "Document Content" : "Source Link"}
            </label>
            {type === ContentType.Document ? (
              <textarea
                ref={textRef}
                placeholder="Paste or write your document content..."
                className="h-40 w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
              />
            ) : (
              <input
                ref={linkRef}
                type="url"
                placeholder="https://example.com"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
              />
            )}
          </div>

          <div>
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Content Type</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {typeOptions.map((option) => {
                const isActive = type === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setType(option.value)}
                    className={`group flex flex-col items-center justify-center rounded-xl border px-3 py-3 text-xs font-semibold transition-all ${
                      isActive
                        ? `${option.activeClass} shadow-sm`
                        : "border-border bg-surface text-muted-foreground hover:border-primary/25 hover:bg-surface-strong hover:text-foreground"
                    }`}
                  >
                    <span className={`${isActive ? "scale-105" : ""} transition-transform`}>{option.icon}</span>
                    <span className="mt-2">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="w-full rounded-full border border-border px-6 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-surface-strong hover:text-foreground active:scale-[0.98] sm:w-auto sm:flex-1"
          >
            Cancel
          </button>
          <button
            onClick={addContent}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] sm:w-auto sm:flex-1"
          >
            <SubmitIcon />
            <span>Save Content</span>
          </button>
        </div>
      </div>
      </div>
    </div>
    </>
);
}
