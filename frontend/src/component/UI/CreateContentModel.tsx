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
import { CrossIcon } from '../../icons/CrossIcon.tsx';
import axios from 'axios';
import { BACKEND_URL } from '../../config.ts';
import { YoutubeIcon } from '../../icons/YoutubeIcon.tsx';
import { TwitterIcon } from '../../icons/TwitterIcon.tsx';
import { Document } from '../../icons/Document.tsx';
import { LinkIcon } from '../../icons/LinkIcon.tsx';
import { SubmitIcon } from '../../icons/SubmitIcon.tsx';

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
    activeClass: "border-rose-300 bg-rose-50 text-rose-700"
  },
  {
    value: ContentType.Twitter,
    label: "Twitter",
    icon: <TwitterIcon />,
    activeClass: "border-sky-300 bg-sky-50 text-sky-700"
  },
  {
    value: ContentType.Document,
    label: "Document",
    icon: <Document />,
    activeClass: "border-slate-300 bg-slate-100 text-slate-700"
  },
  {
    value: ContentType.Links,
    label: "Links",
    icon: <LinkIcon />,
    activeClass: "border-emerald-300 bg-emerald-50 text-emerald-700"
  }
];

export function CreateContentModel({ open, onClose }: CreateContentModelProps) {
    const titleRef = useRef<HTMLInputElement | null>(null);
    const linkRef = useRef<HTMLInputElement | null>(null);
    const textRef= useRef<HTMLTextAreaElement | null>(null);

  const [type,setType]=useState(ContentType.Youtube);
  async function addContent() {
      const title = titleRef.current?.value;
      const link =
    type === ContentType.Document
      ? textRef.current?.value
      : linkRef.current?.value;

  try {
    await axios.post(`${BACKEND_URL}/api/v1/content`, {
      link,
      title,
      type
    }, {
      headers: {
        "Authorization": localStorage.getItem("token")
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
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.35)]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />

      <div className="p-6 sm:p-8">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Add Content</h2>
            <p className="mt-1 text-sm text-slate-500">Capture links, notes, and resources to your workspace.</p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close add content modal"
          >
            <CrossIcon />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">Title</label>
            <input
              ref={titleRef}
              type="text"
              placeholder="Enter a clear title"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              {type === ContentType.Document ? "Document Content" : "Source Link"}
            </label>
            {type === ContentType.Document ? (
              <textarea
                ref={textRef}
                placeholder="Paste or write your document content..."
                className="h-40 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            ) : (
              <input
                ref={linkRef}
                type="url"
                placeholder="https://example.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
            )}
          </div>

          <div>
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wide text-slate-600">Content Type</label>
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
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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
            className="w-full rounded-xl border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 sm:w-auto sm:flex-1"
          >
            Cancel
          </button>
          <button
            onClick={addContent}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-slate-900/25 transition-all hover:bg-slate-800 sm:w-auto sm:flex-1"
          >
            <SubmitIcon />
            <span>Save Content</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);
}
