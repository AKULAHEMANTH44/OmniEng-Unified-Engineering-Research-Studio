import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

interface MathRendererProps {
  content: string;
  className?: string;
}

declare global {
  interface Window {
    katex?: {
      renderToString: (tex: string, options?: any) => string;
    };
  }
}

// Helper to safely render LaTeX string using KaTeX
export function renderLatex(tex: string, displayMode: boolean = false): string {
  if (typeof window !== 'undefined' && window.katex) {
    try {
      return window.katex.renderToString(tex.trim(), {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return tex;
    }
  }
  return tex;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Render markdown blocks with math and code syntax handling
  const parseBlocks = () => {
    if (!content) return null;

    // Split content by code blocks first
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let codeBlockIdx = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const textBefore = content.substring(lastIndex, match.index);
      if (textBefore) {
        parts.push(renderTextAndMath(textBefore, `text-${lastIndex}`));
      }

      const lang = match[1] || 'code';
      const codeSnippet = match[2];
      const currentIdx = codeBlockIdx++;

      parts.push(
        <div key={`code-${currentIdx}`} className="my-4 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900/90 shadow-xl">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/60 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
              <Code2 className="w-3.5 h-3.5" />
              {lang.toUpperCase()}
            </span>
            <button
              onClick={() => copyCode(codeSnippet, currentIdx)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-700/70 hover:bg-slate-700 text-slate-200 transition-colors text-xs"
            >
              {copiedIndex === currentIdx ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-xs md:text-sm font-mono text-cyan-100 overflow-x-auto leading-relaxed bg-slate-950/70">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(renderTextAndMath(content.substring(lastIndex), `text-${lastIndex}`));
    }

    return parts;
  };

  const renderTextAndMath = (rawText: string, keyPrefix: string) => {
    // Process paragraphs, headers, and math
    const lines = rawText.split('\n');
    return (
      <div key={keyPrefix} className="space-y-3 leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;

          // Headers
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-lg font-bold text-cyan-300 mt-5 mb-2 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-cyan-500 rounded-full inline-block" />
                {renderInlineMathAndFormatting(trimmed.replace('### ', ''))}
              </h3>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-xl font-bold text-slate-100 mt-6 mb-3 border-b border-slate-800 pb-1.5 flex items-center gap-2">
                <span className="w-2 h-5 bg-sky-500 rounded-full inline-block" />
                {renderInlineMathAndFormatting(trimmed.replace('## ', ''))}
              </h2>
            );
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-2xl font-extrabold text-white mt-6 mb-4 tracking-tight">
                {renderInlineMathAndFormatting(trimmed.replace('# ', ''))}
              </h1>
            );
          }

          // Block Math: $$...$$
          if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
            const math = trimmed.slice(2, -2);
            const renderedHtml = renderLatex(math, true);
            return (
              <div
                key={idx}
                className="my-3 py-3 px-4 bg-slate-900/80 border border-cyan-900/40 rounded-xl overflow-x-auto text-center shadow-inner"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={idx} className="ml-5 list-disc text-slate-300 pl-1">
                {renderInlineMathAndFormatting(trimmed.substring(2))}
              </li>
            );
          }

          // Numbered list
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex gap-2.5 items-start ml-2 text-slate-300">
                <span className="text-cyan-400 font-mono font-bold text-sm shrink-0 mt-0.5">{numMatch[1]}.</span>
                <span>{renderInlineMathAndFormatting(numMatch[2])}</span>
              </div>
            );
          }

          // Blockquote
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={idx} className="border-l-4 border-cyan-500/80 pl-4 py-1 italic text-slate-300 bg-cyan-950/20 rounded-r-lg my-2">
                {renderInlineMathAndFormatting(trimmed.substring(2))}
              </blockquote>
            );
          }

          return (
            <p key={idx} className="text-slate-300 text-sm md:text-base">
              {renderInlineMathAndFormatting(line)}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to render bold, italic, and inline math $...$
  const renderInlineMathAndFormatting = (text: string): React.ReactNode => {
    // Regex for inline math $...$
    const mathRegex = /\$([^\$]+)\$/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = mathRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(renderFormatting(text.substring(lastIndex, match.index), `sub-${lastIndex}`));
      }
      const mathTex = match[1];
      const html = renderLatex(mathTex, false);
      elements.push(
        <span
          key={`math-${match.index}`}
          className="inline-math font-mono text-cyan-200 px-1 py-0.5 rounded bg-slate-900/60 border border-cyan-900/30 text-sm mx-0.5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      elements.push(renderFormatting(text.substring(lastIndex), `sub-${lastIndex}`));
    }

    return elements.length > 0 ? elements : text;
  };

  const renderFormatting = (plainText: string, key: string): React.ReactNode => {
    // Basic bold parsing **text**
    const parts = plainText.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={key}>
        {parts.map((p, i) => {
          if (p.startsWith('**') && p.endsWith('**')) {
            return (
              <strong key={i} className="font-semibold text-slate-100">
                {p.slice(2, -2)}
              </strong>
            );
          }
          return p;
        })}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={`math-renderer ${className}`}>
      {parseBlocks()}
    </div>
  );
};
