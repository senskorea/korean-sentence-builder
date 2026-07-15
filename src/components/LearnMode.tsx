import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Word } from '../types';
import { RefreshCw, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LearnModeProps {
  vocab: {
    subjects: Word[];
    objects: Word[];
    verbs: Word[];
  };
}

interface WordStats {
  id: string;
  score: number; // e.g., 0 for don't know, 1 for somewhat, 2 for well.
  lastReviewed: number;
}

export default function LearnMode({ vocab }: LearnModeProps) {
  const [wordPool, setWordPool] = useState<Word[]>([]);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  
  // Stats
  const [stats, setStats] = useState<Record<string, WordStats>>({});

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  // Initialize word pool and stats
  useEffect(() => {
    const loadedStats = localStorage.getItem('korean_learn_stats');
    if (loadedStats) {
      try {
        setStats(JSON.parse(loadedStats));
      } catch (e) {
        console.error('Failed to parse stats', e);
      }
    }

    const allWords = [...vocab.subjects, ...vocab.objects, ...vocab.verbs];
    setWordPool(allWords);
  }, [vocab]);

  // Pick a word when pool is ready or stats change
  const pickNextWord = useCallback(() => {
    if (wordPool.length === 0) return;
    
    // Simple logic: favor words with lower scores, or words not yet seen.
    // We sort the pool by score (undefined/not seen = -1) and take one of the lowest.
    const sortedPool = [...wordPool].sort((a, b) => {
      const scoreA = stats[a.id]?.score ?? -1;
      const scoreB = stats[b.id]?.score ?? -1;
      return scoreA - scoreB;
    });

    // Pick from the bottom 30% of the pool for some randomness but focusing on weak words
    const sliceIndex = Math.max(1, Math.floor(sortedPool.length * 0.3));
    const candidates = sortedPool.slice(0, sliceIndex);
    const randomIndex = Math.floor(Math.random() * candidates.length);
    
    setCurrentWord(candidates[randomIndex]);
    setIsRevealed(false);
    clearCanvas();
  }, [wordPool, stats]);

  // Initialize first word
  useEffect(() => {
    if (wordPool.length > 0 && !currentWord) {
      pickNextWord();
    }
  }, [wordPool, currentWord, pickNextWord]);

  // Resize canvas to fit container
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        // Get CSS dimensions
        const rect = container.getBoundingClientRect();
        // Set internal dimensions to match CSS dimensions for 1:1 mapping
        // Can optionally multiply by devicePixelRatio for sharper lines on retina
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = 12; // Thick for stylus/finger
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          ctx.strokeStyle = isDark ? '#f8fafc' : '#1e293b'; // slate-50 (light) for dark mode, else slate-800
        }
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // initial size

    // Adding a slight delay for initial render sizing in flex layouts
    setTimeout(resizeCanvas, 100);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [currentWord]); // re-run if needed when UI changes

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Need to clear accounting for dpr
        const dpr = window.devicePixelRatio || 1;
        // reset transform to clear the whole canvas, then re-apply scale
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(dpr, dpr);
      }
    }
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultColor = isDark ? '#f8fafc' : '#1e293b';
    ctx.strokeStyle = isRevealed ? '#22c55e' : defaultColor; // Use green for tracing over answers
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawing.current = true;
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
  };

  const handleRank = (score: number) => {
    if (!currentWord) return;
    
    const newStats = {
      ...stats,
      [currentWord.id]: {
        id: currentWord.id,
        score: score,
        lastReviewed: Date.now()
      }
    };
    
    setStats(newStats);
    localStorage.setItem('korean_learn_stats', JSON.stringify(newStats));
    pickNextWord();
  };

  if (!currentWord) {
    return <div className="flex-1 flex items-center justify-center">Loading words...</div>;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdf9f0] dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-900 dark:border-slate-800 relative min-h-[780px] select-none touch-none">
      {/* Header */}
      <div className="p-6 border-b-2 border-slate-900 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-950 z-10 relative">
        <div className="flex items-center gap-3">
          <span className="font-black text-2xl tracking-tighter text-indigo-600 dark:text-indigo-400">LEARN MODE</span>
          <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full">iPad Stylus Ready</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={clearCanvas}
            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors border-2 border-transparent hover:border-slate-900"
            title="Clear Canvas"
          >
            <RefreshCw className="w-5 h-5 text-slate-900 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef} 
        className="flex-1 relative bg-white dark:bg-slate-900 overflow-hidden cursor-crosshair touch-none"
      >
        {/* Helper text if nothing is drawn yet - could add state for this, but simple background works too */}
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
              <div className="text-center">
                <div className="text-[160px] md:text-[200px] font-black text-slate-900 dark:text-white leading-none drop-shadow-2xl mb-6">
                  {currentWord.korean}
                </div>
                <div className="text-6xl text-slate-500 font-bold">{currentWord.emoji}</div>
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
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {currentWord.english}
            </h2>
            {!isRevealed && <p className="text-lg text-slate-500 mt-2 font-bold">Draw the Korean word above</p>}
          </div>

          {/* Actions */}
          <div className="w-full max-w-2xl">
            {!isRevealed ? (
              <button 
                onClick={() => setIsRevealed(true)}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-3xl shadow-[0_8px_0_0_rgba(49,46,129,1)] active:translate-y-[8px] active:shadow-none transition-all border-4 border-slate-900"
              >
                CHECK ANSWER
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-6"
              >
                <button 
                  onClick={() => handleRank(0)}
                  className="flex flex-col items-center justify-center py-6 bg-rose-100 dark:bg-rose-950/50 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-800 dark:text-rose-400 rounded-[2rem] border-4 border-slate-900 dark:border-rose-800 shadow-[0_6px_0_0_rgba(15,23,42,1)] active:translate-y-[6px] active:shadow-none transition-all"
                >
                  <XCircle className="w-12 h-12 mb-3" />
                  <span className="font-black text-xl">Didn't Know</span>
                </button>
                <button 
                  onClick={() => handleRank(1)}
                  className="flex flex-col items-center justify-center py-6 bg-amber-100 dark:bg-amber-950/50 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-400 rounded-[2rem] border-4 border-slate-900 dark:border-amber-800 shadow-[0_6px_0_0_rgba(15,23,42,1)] active:translate-y-[6px] active:shadow-none transition-all"
                >
                  <AlertCircle className="w-12 h-12 mb-3" />
                  <span className="font-black text-xl">Somewhat</span>
                </button>
                <button 
                  onClick={() => handleRank(2)}
                  className="flex flex-col items-center justify-center py-6 bg-emerald-100 dark:bg-emerald-950/50 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-400 rounded-[2rem] border-4 border-slate-900 dark:border-emerald-800 shadow-[0_6px_0_0_rgba(15,23,42,1)] active:translate-y-[6px] active:shadow-none transition-all"
                >
                  <CheckCircle2 className="w-12 h-12 mb-3" />
                  <span className="font-black text-xl">Knew Well</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
