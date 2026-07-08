import { Copy, Check, RotateCcw, Volume2, Bookmark, BookmarkCheck } from 'lucide-react';
import { Word, EndingOption } from '../types';
import { CONJUGATIONS } from '../data';
import { useState } from 'react';

interface WorkingSentenceProps {
  subject: Word | null;
  subjectParticle: string;
  object: Word | null;
  objectParticle: string;
  verb: Word | null;
  ending: EndingOption | null;
  bypassMode: boolean;
  onReset: () => void;
  onCopy: (text: string) => void;
  copyFormat: 'korean_only' | 'bilingual';
  englishTranslation: string;
  onPlayAudio?: () => void;
  activeKorean?: boolean;
  onSave?: () => void;
}

export default function WorkingSentence({
  subject,
  subjectParticle,
  object,
  objectParticle,
  verb,
  ending,
  bypassMode,
  onReset,
  onCopy,
  copyFormat,
  englishTranslation,
  onPlayAudio,
  activeKorean,
  onSave,
}: WorkingSentenceProps) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Helper to compile the active Korean string
  const compileKoreanString = (): string => {
    let result = '';
    if (subject) {
      result += subject.korean;
      if (subjectParticle) result += subjectParticle;
    }
    if (object) {
      if (result) result += ' ';
      result += object.korean;
      if (objectParticle) result += objectParticle;
    }
    if (verb) {
      if (result) result += ' ';
      if (ending) {
        // Conjugate verb
        const conj = CONJUGATIONS[verb.id]?.[ending.id];
        result += conj ? conj.korean : verb.korean;
      } else {
        result += verb.korean; // dictionary form
      }
    }
    return result;
  };

  const currentKorean = compileKoreanString();

  const handleCopy = () => {
    if (!currentKorean) return;
    const payload = copyFormat === 'korean_only' 
      ? currentKorean 
      : `${currentKorean} (${englishTranslation})`;
    
    onCopy(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!currentKorean || !onSave) return;
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div 
      id="working-sentence-ribbon" 
      className="relative bg-[#1a1a1a] border-[3px] border-black px-4 py-3 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-all overflow-hidden"
    >

 
      <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
        
        {/* Left Side: Reset & Audio Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0 z-10">
          {(subject || object || verb) && (
            <button
              onClick={onReset}
              className="p-1.5 text-[#cc3311] hover:text-white transition-all rounded-none border-[3px] border-black bg-white hover:bg-[#cc3311] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none cursor-pointer"
              title="Reset current sentence"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}
          {activeKorean && onPlayAudio && (
            <button
              onClick={onPlayAudio}
              className="p-1.5 text-slate-700 hover:text-black transition-all rounded-none border-[3px] border-black bg-[#efebe4] hover:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none cursor-pointer"
              title="Slow Speech Audio"
            >
              <Volume2 className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}
        </div>
 
        {/* Center Sentence Display */}
        <div className="flex-1 text-center py-0.5 overflow-x-auto">
          {currentKorean ? (
            <div className="flex flex-col gap-3 items-center justify-center min-h-[80px]">
              <div className="flex items-end justify-center gap-3 md:gap-4 flex-wrap">
                {subject && (
                  <div className="flex flex-col items-center gap-1.5 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#f7f5f0] dark:bg-slate-800 rounded-full flex items-center justify-center text-lg md:text-xl border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
                      {subject.emoji}
                    </div>
                    <span className="text-2xl md:text-3xl font-extrabold tracking-wide text-white font-display leading-none underline decoration-[#cc3311] decoration-3 underline-offset-4">
                      {subject.korean}{subjectParticle}
                    </span>
                  </div>
                )}
                {object && (
                  <div className="flex flex-col items-center gap-1.5 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#f7f5f0] dark:bg-slate-800 rounded-full flex items-center justify-center text-lg md:text-xl border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
                      {object.emoji}
                    </div>
                    <span className="text-2xl md:text-3xl font-extrabold tracking-wide text-white font-display leading-none underline decoration-[#cc3311] decoration-3 underline-offset-4">
                      {object.korean}{objectParticle}
                    </span>
                  </div>
                )}
                {verb && (
                  <div className="flex flex-col items-center gap-1.5 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#f7f5f0] dark:bg-slate-800 rounded-full flex items-center justify-center text-lg md:text-xl border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
                      {verb.emoji}
                    </div>
                    <span className="text-2xl md:text-3xl font-extrabold tracking-wide text-white font-display leading-none underline decoration-[#cc3311] decoration-3 underline-offset-4 flex items-baseline">
                      {ending ? (CONJUGATIONS[verb.id]?.[ending.id]?.korean || verb.korean) : verb.korean}
                      <span className="font-bold text-[#cc3311] ml-0.5">.</span>
                    </span>
                  </div>
                )}
              </div>
 
              {englishTranslation && (
                <p className="text-xs md:text-sm font-bold text-[#cc3311] font-mono tracking-wide uppercase leading-none mt-1">
                  {englishTranslation}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 text-slate-400 min-h-[80px]">
              <span className="w-4 h-1 bg-[#cc3311] animate-pulse"></span>
            </div>
          )}
        </div>
 
        {/* Right Side: Action Buttons */}
        <div className="shrink-0 z-10 flex gap-2">
          {currentKorean ? (
            <>
              {onSave && (
                <button
                  onClick={handleSave}
                  className={`flex flex-col items-center justify-center w-12 h-12 rounded-none border-[3px] transition-all duration-150 select-none cursor-pointer ${
                    saved
                      ? 'bg-emerald-500 border-black text-black shadow-none'
                      : 'bg-white text-black border-black hover:bg-[#cc3311] hover:text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-[1px]'
                  }`}
                  title="Save to Notebook"
                >
                  {saved ? (
                    <>
                      <BookmarkCheck className="w-4.5 h-4.5 stroke-[3]" />
                      <span className="text-[8px] font-extrabold mt-0.5 uppercase tracking-wide">저장됨</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4.5 h-4.5 stroke-[3]" />
                      <span className="text-[8px] font-extrabold mt-0.5 tracking-wider uppercase">저장</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleCopy}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-none border-[3px] transition-all duration-150 select-none cursor-pointer ${
                  copied
                    ? 'bg-emerald-500 border-black text-black shadow-none'
                    : 'bg-white text-black border-black hover:bg-slate-100 shadow-[3px_3px_0px_0px_rgba(204,51,17,1)] hover:shadow-none active:translate-y-[1px]'
                }`}
                title="Copy to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-4.5 h-4.5 stroke-[3]" />
                    <span className="text-[8px] font-extrabold mt-0.5 uppercase tracking-wide">완료</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4.5 h-4.5 stroke-[3]" />
                    <span className="text-[8px] font-extrabold mt-0.5 tracking-wider uppercase">복사</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 border-[3px] border-dashed border-slate-700 rounded-none flex flex-col items-center justify-center opacity-30 select-none">
                <Bookmark className="w-4 h-4 text-slate-400 stroke-[2]" />
                <span className="text-[8px] font-bold mt-0.5 uppercase tracking-wider text-slate-400">저장</span>
              </div>
              <div className="w-12 h-12 border-[3px] border-dashed border-slate-700 rounded-none flex flex-col items-center justify-center opacity-30 select-none">
                <Copy className="w-4 h-4 text-slate-400 stroke-[2]" />
                <span className="text-[8px] font-bold mt-0.5 uppercase tracking-wider text-slate-400">복사</span>
              </div>
            </>
          )}
        </div>
 
      </div>
 
      {/* Retro 3x6 Dot Grid Matrix Decoration in bottom-right corner */}
      <div className="absolute bottom-2 right-2 grid grid-cols-6 gap-0.5 opacity-10 pointer-events-none select-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="w-1 h-1 bg-white rounded-full" />
        ))}
      </div>
    </div>
  );
}
