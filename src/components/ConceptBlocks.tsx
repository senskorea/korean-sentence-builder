import { Word, StepState } from '../types';
import { SentenceAnalysis } from '../lib/ai';
import { Sparkles, Check, Loader2, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ConceptBlocksProps {
  currentStep: StepState;
  selectedSubject: Word | null;
  selectedObject: Word | null;
  selectedVerb: Word | null;
  bypassMode: boolean;
  onSelectWord: (word: Word) => void;
  activeTab: 'subject' | 'object' | 'verb';
  setActiveTab: (tab: 'subject' | 'object' | 'verb') => void;
  subjects: Word[];
  objects: Word[];
  verbs: Word[];
  isFlipped?: boolean;
  isAnalyzing?: boolean;
  analysisResult?: SentenceAnalysis | null;
  onFlipBack?: () => void;
}

export default function ConceptBlocks({
  currentStep,
  selectedSubject,
  selectedObject,
  selectedVerb,
  bypassMode,
  onSelectWord,
  activeTab,
  setActiveTab,
  subjects,
  objects,
  verbs,
  isFlipped,
  isAnalyzing,
  analysisResult,
  onFlipBack,
}: ConceptBlocksProps) {
  // Determine which words to display based on active tab
  const getWordsToDisplay = (): Word[] => {
    switch (activeTab) {
      case 'subject':
        return subjects;
      case 'object':
        return objects;
      case 'verb':
        return verbs;
      default:
        return subjects;
    }
  };

  // Check if a word is currently selected in the active sentence
  const isWordSelected = (word: Word): boolean => {
    if (word.type === 'subject') return selectedSubject?.id === word.id;
    if (word.type === 'object') return selectedObject?.id === word.id;
    if (word.type === 'verb') return selectedVerb?.id === word.id;
    return false;
  };

  // Determine if a verb is highly compatible with the currently selected object
  const isVerbCompatible = (verbWord: Word): boolean => {
    if (!selectedObject || verbWord.type !== 'verb') return false;
    return selectedObject.compatibleVerbs?.includes(verbWord.id) || false;
  };

  const words = getWordsToDisplay();

  // Helper messages for strict mode
  const getStepGuidance = () => {
    if (bypassMode) return 'FREE FLOW — CHOOSE ANY COMPONENT LIBRE';

    switch (currentStep) {
      case 'START':
        return 'STEP 1: SELECT A SUBJECT (WHO) 👤';
      case 'SUBJECT_SELECTED':
        return 'STEP 2: SELECT AN OBJECT (WHAT) 🍎';
      case 'OBJECT_SELECTED':
        return 'STEP 3: SELECT AN ACTION VERB (ACTION) ⚡';
      case 'VERB_STEM_SELECTED':
        return 'STEP 4: ATTACH PARTICLES, ENDINGS & EXPRESSIONS BELOW 🧩';
      case 'COMPLETED':
        return 'COMPLETE! PRESS RESET OR SAVE TO NOTEBOOK FRESH 🎉';
      default:
        return '';
    }
  };

  return (
    <div 
      id="concept-blocks-container" 
      className="[perspective:1000px]"
    >
      <motion.div
        className="w-full relative [transform-style:preserve-3d]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front Face */}
        <div className="w-full [backface-visibility:hidden] bg-slate-200 dark:bg-brand-surface-dark border-[3px] border-black rounded-none p-3.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] flex flex-col gap-3.5">
          {/* Navigation tabs for categories */}
      <div className="grid grid-cols-3 gap-1.5">
        {(['subject', 'object', 'verb'] as const).map((tab) => {
          const isLocked = !bypassMode && (
            (tab === 'object' && !selectedSubject) ||
            (tab === 'verb' && (!selectedSubject || !selectedObject))
          );

          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => {
                if (!isLocked || bypassMode) {
                  setActiveTab(tab);
                }
              }}
              disabled={isLocked && !bypassMode}
              className={`py-1.5 text-xs font-extrabold uppercase border-[3px] border-black rounded-none transition-all relative cursor-pointer ${
                isActive
                  ? 'bg-brand-primary text-white shadow-none translate-y-[2px]'
                  : isLocked
                  ? 'bg-slate-100/40 text-slate-400 dark:text-slate-700 border-dashed border-slate-300 dark:border-slate-800 cursor-not-allowed opacity-35'
                  : 'bg-white hover:bg-brand-surface-light text-black shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <span>{tab + 's'}</span>
                <span>
                  {tab === 'subject' && '👤'}
                  {tab === 'object' && '🍎'}
                  {tab === 'verb' && '⚡'}
                </span>
              </div>
              
              {/* Highlight badge for predictive step */}
              {!bypassMode && !isLocked && !selectedSubject && tab === 'subject' && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-primary animate-ping" />
              )}
              {!bypassMode && !isLocked && selectedSubject && !selectedObject && tab === 'object' && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-primary animate-ping" />
              )}
              {!bypassMode && !isLocked && selectedSubject && selectedObject && !selectedVerb && tab === 'verb' && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-primary animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Step guidance bar (Compact) */}
      <div className="flex items-center gap-2 border-[2px] border-black py-1 px-2.5 bg-white text-black">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shrink-0" />
        <p className="text-[10px] font-mono leading-none font-bold tracking-wider uppercase">
          {getStepGuidance()}
        </p>
      </div>

      {/* The main Grid of Flat Buttons */}
      <div className="grid gap-2.5 min-h-[140px] grid-cols-2 sm:grid-cols-4">
        {words.map((word) => {
          const isSelected = isWordSelected(word);
          const isCompatible = word.type === 'verb' && selectedObject && isVerbCompatible(word);

          // Since the tab itself manages locks on the category level, displayed cards are always active
          const isLocked = false;

          return (
            <motion.button
              whileTap={isLocked ? {} : { y: 2 }}
              key={word.id}
              onClick={() => {
                if (!isLocked || bypassMode) {
                  onSelectWord(word);
                }
              }}
              className={`group relative flex flex-col items-center justify-center p-2.5 pb-2 rounded-none border-[3px] border-black transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-brand-primary text-white shadow-none translate-y-[2px]'
                  : isLocked
                  ? 'bg-slate-100/20 border-dashed border-slate-400 text-slate-400 cursor-not-allowed opacity-30 shadow-none'
                  : isCompatible
                  ? 'bg-white border-black text-black shadow-[3px_3px_0px_0px_rgba(204,51,17,0.3)] hover:shadow-none hover:translate-y-[2px]'
                  : 'bg-brand-surface-light text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-y-[2px]'
              }`}
            >
              {/* Checkmark inside circular badge */}
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 bg-black text-brand-primary p-0.5 rounded-full ring-1 ring-white">
                  <Check className="w-2 h-2 stroke-[4]" />
                </span>
              )}

              {/* Big high-contrast icon slot (Compact) */}
              {!isLocked && (
                <div className={`w-9 h-9 rounded-full border-2 border-black flex items-center justify-center text-lg mb-1.5 transition-transform group-hover:scale-105 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                  isSelected ? 'bg-black' : 'bg-white'
                }`}>
                  <span>{word.emoji}</span>
                </div>
              )}

              {/* Korean word */}
              <span className={`text-base font-black font-display tracking-wide leading-tight ${isSelected ? 'text-white' : 'text-black'}`}>
                {word.korean}
              </span>

              {/* English meaning */}
              <span className={`text-[10px] font-bold font-mono mt-0.5 uppercase tracking-wide leading-none ${isSelected ? 'text-white opacity-85' : 'text-black opacity-75'}`}>
                {word.english.toLowerCase()}
              </span>

              {/* Syllable marker indicator for Batchim */}
              <span className={`text-[7px] font-mono mt-0.5 ${isSelected ? 'text-white/60' : 'text-black/45'}`}>
                {word.hasBatchim ? 'consonant' : 'vowel'}
              </span>
            </motion.button>
          );
        })}
        </div>
        </div>

        {/* Back Face (AI Analysis) */}
        <div className="absolute top-0 left-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-brand-bg-light dark:bg-brand-surface-dark border-[3px] border-black p-4 sm:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] flex flex-col overflow-y-auto">
          {isAnalyzing && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-800 dark:text-slate-200">
              <Loader2 className="w-10 h-10 stroke-[3] animate-spin text-brand-primary" />
              <p className="font-display font-black text-sm tracking-wider animate-pulse uppercase">분석 중... (ANALYZING)</p>
            </div>
          )}
          {!isAnalyzing && analysisResult && (
            <div className="flex flex-col h-full gap-3">
              <div className="flex justify-between items-start shrink-0">
                <div className={`border-[3px] border-black px-2.5 py-1 font-black uppercase tracking-widest text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${analysisResult.isCorrect ? 'bg-emerald-400 text-black' : 'bg-brand-accent text-black'}`}>
                  {analysisResult.isCorrect ? 'PERFECT ✨' : 'NEEDS TWEAKING 🔧'}
                </div>
                <button onClick={onFlipBack} className="p-1 border-[3px] border-black bg-white dark:bg-slate-800 hover:bg-brand-primary dark:hover:bg-brand-primary hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none">
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center py-2 shrink-0">
                {analysisResult.correctedSentence && (
                  <div className="mb-3">
                    <h4 className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Better Phrasing:</h4>
                    <p className="font-display font-black text-xl md:text-2xl text-brand-primary">{analysisResult.correctedSentence}</p>
                  </div>
                )}

                <div>
                  <p className="font-sans font-bold text-xs md:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {analysisResult.explanation}
                  </p>
                </div>
              </div>

              <div className="mt-auto shrink-0 border-[3px] border-black p-3 bg-white dark:bg-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]">
                <h4 className="font-mono font-bold text-[9px] text-indigo-600 dark:text-indigo-400 uppercase mb-1.5 flex items-center gap-1"><Sparkles className="w-3 h-3" /> GRAMMAR POINT</h4>
                <p className="font-display font-black text-sm mb-1 text-slate-900 dark:text-white leading-tight">{analysisResult.grammarPoint.title}</p>
                <p className="font-sans font-medium text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{analysisResult.grammarPoint.description}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
