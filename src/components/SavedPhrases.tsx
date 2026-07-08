import { SavedSentence } from '../types';
import { Copy, Trash2, Check, Sparkles, History } from 'lucide-react';
import { useState } from 'react';

interface SavedPhrasesProps {
  phrases: SavedSentence[];
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function SavedPhrases({
  phrases,
  onCopy,
  onDelete,
  onClearAll,
}: SavedPhrasesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPhrase = (phrase: SavedSentence) => {
    const payload = `${phrase.korean} (${phrase.english})`;
    onCopy(payload);
    setCopiedId(phrase.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div 
      id="saved-phrases-history" 
      className="bg-[#efebe4] dark:bg-[#151515] border-[3px] border-black rounded-none p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] flex flex-col gap-3.5"
    >
      <div className="flex items-center justify-between">
        <div className="bg-[#cc3311] text-white font-black px-3.5 py-1.5 border-[3px] border-black rounded-none text-xs flex items-center gap-1.5 shadow-xs font-sans tracking-wide uppercase">
          <History className="w-3.5 h-3.5 text-white" />
          노트 ✍ (SAVED)
        </div>
        {phrases.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] text-red-500 hover:text-red-600 font-extrabold uppercase hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {phrases.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-black rounded-none bg-white">
          <Sparkles className="w-6 h-6 text-[#cc3311] mx-auto mb-1.5 animate-pulse" />
          <p className="text-xs font-extrabold text-black">No phrases saved yet</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Complete a sentence flow to save it here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
          {phrases.map((phrase) => {
            const isCopied = copiedId === phrase.id;
            return (
              <div
                key={phrase.id}
                className="bg-white dark:bg-slate-950 border-2 border-black rounded-none p-2.5 flex items-start justify-between gap-3 hover:bg-[#efebe4] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate font-sans">
                      {phrase.korean}
                    </span>
                    <span className="text-xs shrink-0" title="Visual sequence emojis">
                      {phrase.emojis}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold truncate">
                    {phrase.english}
                  </p>
                  <span className="text-[8px] font-bold text-slate-400/70 mt-1 block">
                    {new Date(phrase.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopyPhrase(phrase)}
                    className={`p-2 rounded-none border-2 border-black transition-all cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-500 text-white font-extrabold'
                        : 'bg-white text-black hover:bg-slate-100'
                    }`}
                    title="Copy to clipboard"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => onDelete(phrase.id)}
                    className="p-2 rounded-none border-2 border-black hover:bg-red-500 hover:text-white text-black transition-all cursor-pointer"
                    title="Delete phrase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
