
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
// import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.css"; // dark theme for code

export default function ResponseRenderer({ content }: { content: string }) {
  const components: Components = {
    h1: ({ node, ...props }) => (
      <h1 className="text-4xl font-bold mt-4 mb-2" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-2xl font-semibold mt-4 mb-2" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="mb-3 mt-4 leading-7" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="list-disc ml-5 mb-1" {...props} />
    ),
    code: ({ className, children, ...props }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="bg-gray-200 dark:bg-gray-700 rounded px-1 text-sm" {...props}>
            {children}
          </code>
        );
      }
      return (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-2xl overflow-x-auto my-3 shadow-md">
          <code className={className} {...props}>{children}</code>
        </pre>
      );
    },
  };

  return (
    <div className="prose prose-lg max-w-none dark:prose-invert leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
