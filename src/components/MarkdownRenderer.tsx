'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically load highlight.js and apply to code blocks
    async function highlight() {
      if (typeof window === 'undefined') return;
      try {
        const hljs = (await import('highlight.js')).default;
        if (contentRef.current) {
          contentRef.current.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
          });
        }
      } catch (err) {
        console.warn('Failed to load highlight.js', err);
      }
    }
    highlight();
  }, [content]);

  return (
    <div ref={contentRef} className="prose prose-zinc max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-zinc-600 dark:prose-a:text-zinc-400 prose-code:rounded prose-code:bg-zinc-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm dark:prose-code:bg-zinc-800 prose-pre:border prose-pre:border-zinc-200 dark:prose-pre:border-zinc-800 prose-pre:bg-zinc-50 dark:prose-pre:bg-zinc-900/50 prose-img:rounded-lg">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
