import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Word, SavedSentence } from '../types';
import { RefreshCw, CheckCircle2, AlertCircle, XCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getStroke } from 'perfect-freehand';

interface LearnModeProps {
  vocab: {
    subjects: Word[];
    objects: Word[];
    verbs: Word[];
  };
  savedPhrases?: SavedSentence[];
}

interface ItemStats {
  id: string;
  repetition: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: number;
  
  // Legacy support
  score?: number;
  lastReviewed?: number;
}

// Helper to generate SVG path data from the stroke points
function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
}

export default function LearnMode({ vocab, savedPhrases = [] }: LearnModeProps) {
  const [learnType, setLearnType] = useState<'words' | 'sentences'>('words');
  
  const [wordPool, setWordPool] = useState<Word[]>([]);
  const [sentencePool, setSentencePool] = useState<SavedSentence[]>([]);
  
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [currentSentence, setCurrentSentence] = useState<SavedSentence | null>(null);
  
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasDismissedCelebration, setHasDismissedCelebration] = useState(false);
  
  // Stats
  const [wordStats, setWordStats] = useState<Record<string, ItemStats>>({});
  const [sentenceStats, setSentenceStats] = useState<Record<string, ItemStats>>({});

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  // Drawing state
  const linesRef = useRef<number[][][]>([]);
  const currentLineRef = useRef<number[][] | null>(null);

  // Initialize word pool and stats
  useEffect(() => {
    const migrateStats = (rawStats: any) => {
      const migrated: Record<string, ItemStats> = {};
      for (const key in rawStats) {
        const stat = rawStats[key];
        if (stat.score !== undefined && stat.repetition === undefined) {
          // It's old format
          migrated[key] = {
            id: stat.id,
            repetition: stat.score >= 2 ? 3 : (stat.score === 1 ? 1 : 0),
            interval: stat.score >= 2 ? 3 : (stat.score === 1 ? 1 : 0.5),
            easeFactor: 2.5,
            nextReviewDate: stat.lastReviewed || Date.now()
          };
        } else {
          migrated[key] = stat;
        }
      }
      return migrated;
    };

    const loadedWordStats = localStorage.getItem('korean_learn_stats');
    if (loadedWordStats) {
      try {
        setWordStats(migrateStats(JSON.parse(loadedWordStats)));
      } catch (e) {
        console.error('Failed to parse word stats', e);
      }
    }
    const loadedSentenceStats = localStorage.getItem('korean_learn_sentence_stats');
    if (loadedSentenceStats) {
      try {
        setSentenceStats(migrateStats(JSON.parse(loadedSentenceStats)));
      } catch (e) {
        console.error('Failed to parse sentence stats', e);
      }
    }

    const allWords = [...vocab.subjects, ...vocab.objects, ...vocab.verbs];
    setWordPool(allWords);
    setSentencePool(savedPhrases);
    setHasDismissedCelebration(false);
  }, [vocab, savedPhrases]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#22c55e';

    const allLines = [...linesRef.current];
    if (currentLineRef.current && currentLineRef.current.length > 0) {
      allLines.push(currentLineRef.current);
    }

    for (const line of allLines) {
      if (line.length === 0) continue;
      
      const stroke = getStroke(line, {
        size: 14,
        thinning: 0.6,
        smoothing: 0.5,
        streamline: 0.5,
        simulatePressure: false // Allows actual iPad pencil pressure
      });
      
      if (stroke.length > 0) {
        const pathData = getSvgPathFromStroke(stroke);
        const path = new Path2D(pathData);
        ctx.fill(path);
      }
    }
  }, []);

  const clearCanvas = () => {
    linesRef.current = [];
    currentLineRef.current = null;
    renderCanvas();
  };

  const pickNextWord = useCallback((stats?: Record<string, ItemStats>) => {
    const currentStats = stats || wordStats;
    if (wordPool.length === 0) return;
    
    const now = Date.now();
    const unmastered = wordPool.filter(w => (currentStats[w.id]?.repetition || 0) < 5);
    let candidates = unmastered.filter(w => !currentStats[w.id] || currentStats[w.id].nextReviewDate <= now);
    
    if (candidates.length === 0 && unmastered.length > 0) candidates = unmastered;
    
    let nextWord;
    if (candidates.length > 0) {
      nextWord = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      nextWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    }
    
    setCurrentWord(nextWord);
    setIsRevealed(false);
    clearCanvas();
  }, [wordPool, wordStats]);

  const pickNextSentence = useCallback((stats?: Record<string, ItemStats>) => {
    const currentStats = stats || sentenceStats;
    if (sentencePool.length === 0) return;
    
    const now = Date.now();
    const unmastered = sentencePool.filter(s => (currentStats[s.id]?.repetition || 0) < 5);
    let candidates = unmastered.filter(s => !currentStats[s.id] || currentStats[s.id].nextReviewDate <= now);
    
    if (candidates.length === 0 && unmastered.length > 0) candidates = unmastered;
    
    let nextSentence;
    if (candidates.length > 0) {
      nextSentence = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      nextSentence = sentencePool[Math.floor(Math.random() * sentencePool.length)];
    }
    
    setCurrentSentence(nextSentence);
    setIsRevealed(false);
    clearCanvas();
  }, [sentencePool, sentenceStats]);

  // Initialize first word/sentence
  useEffect(() => {
    if (learnType === 'words' && wordPool.length > 0 && !currentWord) {
      pickNextWord();
    } else if (learnType === 'sentences' && sentencePool.length > 0 && !currentSentence) {
      pickNextSentence();
    }
  }, [learnType, wordPool, sentencePool, currentWord, currentSentence, pickNextWord, pickNextSentence]);

  // Resize canvas to fit container
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        renderCanvas();
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // initial size
    setTimeout(resizeCanvas, 100);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [currentWord, currentSentence, learnType, renderCanvas]);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let pressure = e.pressure !== undefined ? e.pressure : 0.5;
    if (pressure === 0) pressure = 0.5;

    currentLineRef.current = [[x, y, pressure]];
    isDrawing.current = true;
    renderCanvas();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentLineRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const events = e.nativeEvent && typeof (e.nativeEvent as any).getCoalescedEvents === 'function'
      ? (e.nativeEvent as any).getCoalescedEvents()
      : [e.nativeEvent];
      
    for (const event of events) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      let pressure = event.pressure !== undefined ? event.pressure : 0.5;
      if (pressure === 0) pressure = 0.5;
      
      currentLineRef.current.push([x, y, pressure]);
    }
    
    renderCanvas();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    
    if (currentLineRef.current && currentLineRef.current.length > 0) {
      linesRef.current.push([...currentLineRef.current]);
    }
    currentLineRef.current = null;
    renderCanvas();
  };

  const handleRank = (score: number) => {
    const isWord = learnType === 'words';
    const currentItem = isWord ? currentWord : currentSentence;
    if (!currentItem) return;

    const stats = isWord ? wordStats : sentenceStats;
    const oldStat = stats[currentItem.id] || { id: currentItem.id, repetition: 0, interval: 1, easeFactor: 2.5, nextReviewDate: Date.now() };

    // Map 0, 1, 2 scores to SM-2 quality (0-5)
    const q = score === 0 ? 0 : score === 1 ? 3 : 5;
    
    let newRepetition = oldStat.repetition || 0;
    let newInterval = oldStat.interval || 1;
    let newEaseFactor = oldStat.easeFactor || 2.5;

    if (q < 3) {
      newRepetition = 0;
      newInterval = 1;
    } else {
      if (newRepetition === 0) {
        newInterval = 1;
      } else if (newRepetition === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(newInterval * newEaseFactor);
      }
      newRepetition += 1;
    }

    newEaseFactor = newEaseFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (newEaseFactor < 1.3) newEaseFactor = 1.3;

    if (newRepetition > 5) newRepetition = 5; // Cap for mastery progress

    const newStat: ItemStats = {
      id: currentItem.id,
      repetition: newRepetition,
      interval: newInterval,
      easeFactor: newEaseFactor,
      nextReviewDate: Date.now() + newInterval * 24 * 60 * 60 * 1000
    };

    const newStats = { ...stats, [currentItem.id]: newStat };

    if (isWord) {
      setWordStats(newStats);
      localStorage.setItem('korean_learn_stats', JSON.stringify(newStats));
      pickNextWord(newStats);
    } else {
      setSentenceStats(newStats);
      localStorage.setItem('korean_learn_sentence_stats', JSON.stringify(newStats));
      pickNextSentence(newStats);
    }
  };

  const switchLearnType = (type: 'words' | 'sentences') => {
    setLearnType(type);
    setIsRevealed(false);
    clearCanvas();
  };

  const calculateProgress = () => {
    const totalItems = wordPool.length + sentencePool.length;
    if (totalItems === 0) return 0;
    
    let totalRepetitions = 0;
    wordPool.forEach(w => {
      totalRepetitions += Math.min(wordStats[w.id]?.repetition || 0, 5);
    });
    sentencePool.forEach(s => {
      totalRepetitions += Math.min(sentenceStats[s.id]?.repetition || 0, 5);
    });
    
    return totalRepetitions / (totalItems * 5);
  };

  const progress = calculateProgress();
  const isModuleMastered = progress >= 1;

  const masteredWordsCount = wordPool.filter(w => (wordStats[w.id]?.repetition || 0) >= 5).length;
  const masteredSentencesCount = sentencePool.filter(s => (sentenceStats[s.id]?.repetition || 0) >= 5).length;

  const currentItemLabel = learnType === 'words' 
    ? (currentWord?.english || "Loading...") 
    : (currentSentence?.english || "Loading...");

  const currentItemAnswer = learnType === 'words'
    ? currentWord?.korean
    : currentSentence?.korean;

  const currentItemEmoji = learnType === 'words'
    ? currentWord?.emoji
    : currentSentence?.emojis;

  if (learnType === 'words' && !currentWord) {
    return <div className="flex-1 flex items-center justify-center font-bold text-slate-500">Loading words...</div>;
  }
  
  if (learnType === 'sentences' && sentencePool.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-brand-bg-light dark:bg-slate-900 rounded-[3rem] border-4 border-slate-900 dark:border-slate-800 relative min-h-[780px]">
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-full w-48 mb-8">
          <button onClick={() => switchLearnType('words')} className="flex-1 text-xs font-bold py-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white">Words</button>
          <button className="flex-1 text-xs font-bold py-1.5 rounded-full bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white">Sentences</button>
        </div>
        <h2 className="text-2xl font-black mb-4">No Saved Sentences</h2>
        <p className="text-slate-500 font-bold max-w-md">
          You don't have any saved sentences yet. Build some sentences in the Builder mode and click "Save Phrase" to unlock sentence flashcards!
        </p>
        <button 
          onClick={() => switchLearnType('words')}
          className="mt-8 px-6 py-3 bg-indigo-600 text-white font-black rounded-full shadow-[0_4px_0_0_rgba(49,46,129,1)] active:translate-y-[4px] active:shadow-none transition-all"
        >
          Back to Words
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-brand-bg-light dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-900 dark:border-slate-800 relative min-h-[780px] select-none touch-none">
      {/* Header */}
      <div className="p-6 border-b-2 border-slate-900 dark:border-slate-800 flex flex-col gap-4 bg-white dark:bg-slate-950 z-10 relative">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="font-black text-2xl tracking-tighter text-indigo-600 dark:text-indigo-400">LEARN MODE</span>
              <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full hidden sm:inline-block">iPad Stylus Ready</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
                {learnType === 'words' 
                  ? `Mastered: ${masteredWordsCount} / ${wordPool.length}`
                  : `Mastered: ${masteredSentencesCount} / ${sentencePool.length}`}
              </span>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full w-48 border-2 border-slate-900 dark:border-slate-700">
              <button
                onClick={() => switchLearnType('words')}
                className={`flex-1 text-xs font-extrabold py-1.5 rounded-full transition-all ${learnType === 'words' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white border-2 border-slate-900' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Words
              </button>
              <button
                onClick={() => switchLearnType('sentences')}
                className={`flex-1 text-xs font-extrabold py-1.5 rounded-full transition-all ${learnType === 'sentences' ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white border-2 border-slate-900' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Sentences
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={clearCanvas}
              className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors border-2 border-transparent hover:border-slate-900 cursor-pointer"
              title="Clear Canvas"
            >
              <RefreshCw className="w-5 h-5 text-slate-900 dark:text-white" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden border-2 border-slate-200 dark:border-slate-700 relative">
          <div 
            className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black mix-blend-difference text-white">
            MODULE PROGRESS: {Math.round(progress * 100)}%
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef} 
        className="flex-1 relative bg-white dark:bg-slate-900 overflow-hidden cursor-crosshair touch-none"
      >
        <AnimatePresence>
          {isModuleMastered && !hasDismissedCelebration && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-50 p-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0.5, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.6 }}
                className="flex flex-col items-center"
              >
                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-6 rounded-full mb-6 shadow-xl border-4 border-emerald-500">
                  <Award className="w-24 h-24 text-emerald-500" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Module Mastered!</h2>
                <p className="text-lg md:text-xl text-slate-500 font-bold mb-10 max-w-md">
                  You've successfully reached the highest mastery level for every word and sentence in this module. Incredible job!
                </p>
                <button
                  onClick={() => setHasDismissedCelebration(true)}
                  className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-black text-xl shadow-[0_6px_0_0_rgba(4,120,87,1)] active:translate-y-[6px] active:shadow-none transition-all cursor-pointer border-4 border-emerald-700"
                >
                  Keep Reviewing
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <span className="text-[150px] font-black">✍️</span>
        </div>

        {/* Answer Overlay */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-slate-950/90 backdrop-blur-md z-20 pointer-events-none"
            >
              <div className="text-center p-8 max-w-full">
                <div className={`${learnType === 'sentences' ? 'text-4xl md:text-6xl' : 'text-[160px] md:text-[200px]'} font-black text-slate-900 dark:text-white leading-tight drop-shadow-2xl mb-6 break-words`}>
                  {currentItemAnswer}
                </div>
                <div className="text-4xl md:text-6xl text-slate-500 font-bold break-words">{currentItemEmoji}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerOut={stopDrawing}
          onPointerCancel={stopDrawing}
          className="absolute inset-0 w-full h-full touch-none z-30"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Footer Controls */}
      <div className="p-8 bg-white dark:bg-slate-950 border-t-2 border-slate-900 dark:border-slate-800 z-10 relative">
        <div className="flex flex-col items-center gap-8">
          {/* Prompt */}
          <div className="text-center">
            <h2 className={`${learnType === 'sentences' ? 'text-3xl md:text-5xl' : 'text-5xl md:text-7xl'} font-black text-slate-900 dark:text-white uppercase tracking-tight break-words max-w-3xl`}>
              {currentItemLabel}
            </h2>
            {!isRevealed && <p className="text-lg text-slate-500 mt-2 font-bold">Draw the Korean {learnType === 'sentences' ? 'sentence' : 'word'} above</p>}
          </div>

          {/* Actions */}
          <div className="w-full max-w-2xl">
            {!isRevealed ? (
              <button 
                onClick={() => setIsRevealed(true)}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-3xl shadow-[0_8px_0_0_rgba(49,46,129,1)] active:translate-y-[8px] active:shadow-none transition-all border-4 border-slate-900 cursor-pointer"
              >
                CHECK ANSWER
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-3 md:gap-6"
              >
                <button 
                  onClick={() => handleRank(0)}
                  className="flex flex-col items-center justify-center py-4 md:py-6 bg-rose-100 dark:bg-rose-950/50 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-400 rounded-[2rem] border-4 border-slate-900 dark:border-rose-800 shadow-[0_6px_0_0_rgba(15,23,42,1)] active:translate-y-[6px] active:shadow-none transition-all cursor-pointer"
                >
                  <XCircle className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-3" />
                  <span className="font-black text-sm md:text-xl text-center">Didn't Know</span>
                </button>
                <button 
                  onClick={() => handleRank(1)}
                  className="flex flex-col items-center justify-center py-4 md:py-6 bg-amber-100 dark:bg-amber-950/50 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-400 rounded-[2rem] border-4 border-slate-900 dark:border-amber-800 shadow-[0_6px_0_0_rgba(15,23,42,1)] active:translate-y-[6px] active:shadow-none transition-all cursor-pointer"
                >
                  <AlertCircle className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-3" />
                  <span className="font-black text-sm md:text-xl text-center">Somewhat</span>
                </button>
                <button 
                  onClick={() => handleRank(2)}
                  className="flex flex-col items-center justify-center py-4 md:py-6 bg-emerald-100 dark:bg-emerald-950/50 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-400 rounded-[2rem] border-4 border-slate-900 dark:border-emerald-800 shadow-[0_6px_0_0_rgba(15,23,42,1)] active:translate-y-[6px] active:shadow-none transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12 mb-2 md:mb-3" />
                  <span className="font-black text-sm md:text-xl text-center">Knew Well</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
