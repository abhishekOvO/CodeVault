import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-python';

interface CodeBlockProps {
  code: string;
  lang?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({ code, lang = 'cpp', showLineNumbers = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!', { duration: 1500 });
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedHtml = useMemo(() => {
    try {
      const language = lang === 'c++' ? 'cpp' : lang.toLowerCase();
      const grammar = Prism.languages[language] || Prism.languages.cpp || Prism.languages.clike;
      return Prism.highlight(code || '', grammar, language);
    } catch {
      return '';
    }
  }, [code, lang]);

  return (
    <div className="code-block rounded-xl border border-dark-800 bg-dark-950 overflow-hidden shadow-inner">
      <div className="flex items-center justify-between px-4 py-2 border-b border-dark-800/80 bg-dark-900/90 select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/40 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/40 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 inline-block" />
          </div>
          <span className="text-xs font-mono text-dark-400 uppercase font-semibold ml-2">
            {lang.toUpperCase()}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono text-dark-200">
        {highlightedHtml ? (
          <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
}
