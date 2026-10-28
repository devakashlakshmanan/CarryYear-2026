import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AdvisorMarkdownProps {
  content: string;
}

export function preprocessAdvisorMarkdown(content: string): string {
  if (!content) return '';

  let text = content;

  // 1. Convert HTML line breaks <br>, <br/>, <br /> into markdown double-space line breaks
  text = text.replace(/<br\s*\/?>/gi, '  \n');

  // 2. Convert <hr>, <hr/> into markdown horizontal rules
  text = text.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

  // 3. Convert <p> and </p> tags into paragraph breaks
  text = text.replace(/<p\s*>/gi, '\n\n').replace(/<\/p\s*>/gi, '\n');

  // 4. Safely strip any remaining raw HTML tags to prevent raw tags from displaying or being interpreted unsafely
  text = text.replace(/<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s+[^>]*?)?\/?>/g, '');

  // 5. Ensure tables have a preceding blank line so remarkGfm parses them even if preceded by text without a blank line
  text = text.replace(/([^\n])\r?\n(\|[^\n]+\|\r?\n\|[-:\s|]+\|)/g, '$1\n\n$2');

  return text;
}

export const AdvisorMarkdown: React.FC<AdvisorMarkdownProps> = ({ content }) => {
  const processed = preprocessAdvisorMarkdown(content);

  return (
    <div className="advisor-markdown text-sm leading-relaxed text-zinc-800 break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base md:text-lg font-bold text-zinc-900 mt-3 mb-1.5 pb-1 border-b border-zinc-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm md:text-base font-bold text-zinc-900 mt-2.5 mb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs md:text-sm font-semibold text-zinc-800 mt-2 mb-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-zinc-800 mt-1.5 mb-0.5">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-2 leading-relaxed text-zinc-800 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-900">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-800">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-2.5 space-y-1 text-zinc-800 marker:text-violet-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-2.5 space-y-1 text-zinc-800 marker:text-violet-600 font-medium">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-0.5 font-normal text-zinc-800">
              {children}
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:text-violet-800 underline font-medium break-all"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-violet-400 bg-violet-50/60 pl-3 py-1.5 my-2.5 text-zinc-700 italic rounded-r-lg text-xs md:text-sm">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isCodeBlock = className && className.includes('language-');
            if (isCodeBlock) {
              return (
                <code className="block bg-zinc-900 text-zinc-100 p-3 rounded-xl overflow-x-auto text-xs font-mono my-2 border border-zinc-800">
                  {children}
                </code>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-violet-700 font-mono text-xs border border-zinc-200/60">
                {children}
              </code>
            );
          },
          hr: () => <hr className="my-3 border-zinc-200" />,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xs max-w-full">
              <table className="min-w-full divide-y divide-zinc-200 text-left text-xs md:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-50 border-b border-zinc-200">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-semibold text-zinc-800 uppercase tracking-wider text-[11px] md:text-xs whitespace-nowrap bg-zinc-100/70">
              {children}
            </th>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-zinc-100 bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-zinc-50/70 transition-colors">
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-zinc-700 align-top leading-normal text-xs md:text-sm">
              {children}
            </td>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
};
