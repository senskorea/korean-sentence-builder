import { useState, useRef, useEffect, useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Check, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  Award,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { getStroke } from 'perfect-freehand';
import { GRAMMAR_CARDS, type GrammarCard, type GrammarDrillItem } from '../data/grammarRules';

interface Props {
  onBackToVocab?: () => void;
}

function pathFromStroke(stroke: number[][]) {
  if (!stroke.length) return '';
  const path = stroke.reduce<(string | number)[]>((result, [x0, y0], index, points) => {
    const [x1, y1] = points[(index + 1) % points.length];
    result.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    return result;
  }, ['M', ...stroke[0], 'Q']);
  path.push('Z');
  return path.join(' ');
}

export default function GrammarMode({ onBackToVocab }: Props) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [drillIndex, setDrillIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [completedDrills, setCompletedDrills] = useState<Record<string, boolean>>({});

  // Canvas Drawing State
  const [strokes, setStrokes] = useState<number[][][]>([]);
  const [currentStroke, setCurrentStroke] = useState<number[][] | null>(null);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [stylusOnly, setStylusOnly] = useState<boolean>(() => {
    try {
      return localStorage.getItem('korean_stylus_only') === 'true';
    } catch {
      return false;
    }
  });

  const activePointerType = useRef<'pen' | 'touch' | 'mouse' | null>(null);

  const toggleStylusOnly = () => {
    setStylusOnly((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('korean_stylus_only', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const currentCard = GRAMMAR_CARDS.find((c) => c.id === selectedCardId) || null;
  const currentDrill: GrammarDrillItem | undefined = currentCard?.drills[drillIndex];

  // Reset drill state when card or drill changes
  useEffect(() => {
    setSelectedOption(null);
    setRevealed(false);
    setStrokes([]);
    setCurrentStroke(null);
  }, [selectedCardId, drillIndex]);

  // Pointer Handlers for Handwriting Canvas
  const handlePointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    activePointerType.current = e.pointerType as 'pen' | 'touch' | 'mouse';
    if (stylusOnly && e.pointerType !== 'pen') return;

    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const point = [e.clientX - rect.left, e.clientY - rect.top, e.pressure || 0.5];

    if (tool === 'eraser') {
      eraseNear(point[0], point[1]);
    } else {
      setCurrentStroke([point]);
    }
  };

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (stylusOnly && e.pointerType !== 'pen') return;
    if (activePointerType.current !== e.pointerType) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const point = [e.clientX - rect.left, e.clientY - rect.top, e.pressure || 0.5];

    if (tool === 'eraser') {
      if (e.buttons === 1) {
        eraseNear(point[0], point[1]);
      }
    } else if (currentStroke) {
      setCurrentStroke((prev) => (prev ? [...prev, point] : [point]));
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (stylusOnly && e.pointerType !== 'pen') return;
    activePointerType.current = null;

    if (currentStroke && currentStroke.length > 0) {
      setStrokes((prev) => [...prev, currentStroke]);
      setCurrentStroke(null);
    }
  };

  const eraseNear = (x: number, y: number, radius = 25) => {
    setStrokes((prev) =>
      prev.filter((stroke) =>
        !stroke.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < radius)
      )
    );
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke(null);
  };

  // Card Navigation
  const currentIndex = GRAMMAR_CARDS.findIndex((c) => c.id === selectedCardId);
  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setSelectedCardId(GRAMMAR_CARDS[currentIndex - 1].id);
      setDrillIndex(0);
    }
  };

  const handleNextCard = () => {
    if (currentIndex < GRAMMAR_CARDS.length - 1) {
      setSelectedCardId(GRAMMAR_CARDS[currentIndex + 1].id);
      setDrillIndex(0);
    }
  };

  // Check Answer
  const handleCheckDrill = () => {
    setRevealed(true);
    if (currentDrill) {
      setCompletedDrills((prev) => ({
        ...prev,
        [currentDrill.id]: true
      }));
    }
  };

  // ==========================================
  // VIEW 1: Chronological Cards Overview
  // ==========================================
  if (!currentCard) {
    const totalDrills = GRAMMAR_CARDS.reduce((acc, c) => acc + c.drills.length, 0);
    const completedCount = Object.keys(completedDrills).length;

    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-[3px] border-black bg-amber-100 dark:bg-amber-950/40 p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-black uppercase tracking-wider bg-black text-white">
                Sogang Korean 1A
              </span>
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Chronological Curriculum
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mt-2">문법 Grammar Learning Points</h1>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
              Interactive rule breakdowns, liaison guides, and Apple Pencil stylus handwriting practice.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right sm:text-center px-4 py-2 bg-white dark:bg-slate-900 border-2 border-black">
              <p className="text-xs font-bold text-slate-500">Drills Done</p>
              <p className="text-xl font-black">{completedCount} / {totalDrills}</p>
            </div>
            <button
              onClick={() => {
                setSelectedCardId(GRAMMAR_CARDS[0].id);
                setDrillIndex(0);
              }}
              className="px-5 py-3 border-2 border-black bg-indigo-600 text-white font-black hover:bg-indigo-700 active:translate-x-0.5 active:translate-y-0.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-2 text-sm"
            >
              Start in order
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chronological Card List */}
        <div className="grid md:grid-cols-2 gap-4">
          {GRAMMAR_CARDS.map((card, idx) => {
            const cardDone = card.drills.every((d) => completedDrills[d.id]);
            return (
              <div
                key={card.id}
                onClick={() => {
                  setSelectedCardId(card.id);
                  setDrillIndex(0);
                }}
                className="cursor-pointer border-[3px] border-black bg-white dark:bg-slate-900 p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Step {idx + 1} · {card.unit}
                    </span>
                    {cardDone && (
                      <span className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 border border-emerald-400">
                        <Check className="w-3.5 h-3.5" /> Complete
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black mt-1 group-hover:text-indigo-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">{card.koreanTitle}</p>
                  
                  {/* Formula Chip */}
                  <div className="mt-3 p-2.5 bg-slate-100 dark:bg-slate-800 border-2 border-black text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    {card.formula}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium line-clamp-2">
                    {card.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-500">
                    {card.drills.length} practice drills
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-black group-hover:translate-x-1 transition-transform">
                    Practice with Stylus →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: Focused Grammar Card & Stylus Drill
  // ==========================================
  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3 border-[3px] border-black bg-white dark:bg-slate-900 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <button
          onClick={() => setSelectedCardId(null)}
          className="min-h-10 px-3 flex items-center gap-1.5 border-2 border-black bg-slate-100 dark:bg-slate-800 font-black text-xs hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> All Grammar Cards
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevCard}
            disabled={currentIndex === 0}
            className="min-h-10 px-3 flex items-center border-2 border-black bg-white dark:bg-slate-800 font-black text-xs disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs font-black px-2">
            Card {currentIndex + 1} / {GRAMMAR_CARDS.length}
          </span>
          <button
            onClick={handleNextCard}
            disabled={currentIndex === GRAMMAR_CARDS.length - 1}
            className="min-h-10 px-3 flex items-center border-2 border-black bg-white dark:bg-slate-800 font-black text-xs disabled:opacity-40"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Header & Rule Breakdown */}
      <div className="border-[3px] border-black bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {currentCard.unit}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">{currentCard.title}</h2>
            <p className="text-xs font-bold text-slate-500">{currentCard.koreanTitle}</p>
          </div>
          <div className="self-start sm:self-center">
            <span className="px-3 py-1 text-xs font-black border-2 border-black bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200">
              #{currentCard.tag}
            </span>
          </div>
        </div>

        {/* Formula Box */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-2 border-black font-mono font-bold text-sm text-amber-950 dark:text-amber-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{currentCard.formula}</span>
        </div>

        {/* Core Rules List */}
        <div className="space-y-1.5 text-xs sm:text-sm font-medium">
          {currentCard.rules.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="font-black text-indigo-600 flex-shrink-0 mt-0.5">•</span>
              <span>{rule}</span>
            </div>
          ))}
        </div>

        {/* Examples Grid */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
            Curriculum Examples
          </p>
          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            {currentCard.examples.map((ex, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-black/30">
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-sm text-slate-900 dark:text-slate-100">{ex.korean}</span>
                  {ex.pronunciation && (
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      {ex.pronunciation}
                    </span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{ex.english}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Stylus Practice Drill */}
      {currentDrill && (
        <div className="border-[3px] border-black bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)] space-y-5">
          {/* Drill Navigation Tabs */}
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
                Drill {drillIndex + 1} of {currentCard.drills.length}
              </span>
              {completedDrills[currentDrill.id] && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Solved
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {currentCard.drills.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setDrillIndex(idx)}
                  className={`w-7 h-7 text-xs font-black border-2 border-black ${
                    drillIndex === idx
                      ? 'bg-black text-white'
                      : completedDrills[currentCard.drills[idx].id]
                      ? 'bg-emerald-200 text-black'
                      : 'bg-slate-100'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Drill Prompt */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500">Practice Prompt</p>
            <h4 className="text-lg sm:text-xl font-black">{currentDrill.prompt}</h4>
            <div className="inline-block mt-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 text-xs font-bold text-indigo-800 dark:text-indigo-200">
              Target: <span className="font-black text-sm">{currentDrill.target}</span>
            </div>
          </div>

          {/* Stylus Handwriting Canvas Area */}
          <div className="border-2 border-black bg-slate-50 dark:bg-slate-950 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <PenTool className="w-3.5 h-3.5" /> Write here with iPad Stylus or Touch
              </span>
              
              {/* Canvas Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleStylusOnly}
                  className={`px-2 py-1 text-xs font-black border border-black flex items-center gap-1 ${
                    stylusOnly
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {stylusOnly ? 'Stylus Only (On)' : 'Stylus Only (Off)'}
                </button>
                <button
                  onClick={() => setTool('pen')}
                  className={`px-2 py-1 text-xs font-black border border-black ${
                    tool === 'pen' ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  Pen
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`px-2 py-1 text-xs font-black border border-black ${
                    tool === 'eraser' ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  Eraser
                </button>
                <button
                  onClick={clearCanvas}
                  className="px-2 py-1 text-xs font-black border border-black bg-white dark:bg-slate-800 hover:bg-rose-50"
                >
                  <RotateCcw className="w-3 h-3 inline mr-1" />
                  Clear
                </button>
              </div>
            </div>

            {/* SVG Canvas with subtle writing grid */}
            <div className="relative w-full h-40 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden touch-none">
              {/* Syllable grid background */}
              <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />
              
              <svg
                className="w-full h-full cursor-crosshair"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                {strokes.map((stroke, i) => (
                  <path
                    key={i}
                    d={pathFromStroke(
                      getStroke(stroke, {
                        size: 4,
                        thinning: 0.5,
                        smoothing: 0.5,
                        streamline: 0.5
                      })
                    )}
                    fill="currentColor"
                    className="text-slate-900 dark:text-slate-100"
                  />
                ))}
                {currentStroke && (
                  <path
                    d={pathFromStroke(
                      getStroke(currentStroke, {
                        size: 4,
                        thinning: 0.5,
                        smoothing: 0.5,
                        streamline: 0.5
                      })
                    )}
                    fill="currentColor"
                    className="text-slate-900 dark:text-slate-100"
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Option Selector Chips (if options available) */}
          {currentDrill.options && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-500">Select Rule Option</p>
              <div className="flex flex-wrap gap-2">
                {currentDrill.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedOption(opt)}
                    className={`min-h-11 px-4 py-2 border-2 border-black font-black text-sm transition-transform active:translate-y-0.5 ${
                      selectedOption === opt
                        ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Check Button */}
          <div className="flex items-center gap-3 pt-2">
            {!revealed ? (
              <button
                onClick={handleCheckDrill}
                className="min-h-12 px-6 border-2 border-black bg-black text-white font-black text-sm flex items-center gap-2 hover:bg-slate-800 active:translate-y-0.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
              >
                <Eye className="w-4 h-4" /> Check Answer & Rule
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setRevealed(false);
                    clearCanvas();
                    setSelectedOption(null);
                  }}
                  className="min-h-12 px-4 border-2 border-black bg-white dark:bg-slate-800 font-black text-sm flex items-center gap-1.5 hover:bg-slate-100"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
                {drillIndex < currentCard.drills.length - 1 ? (
                  <button
                    onClick={() => setDrillIndex((idx) => idx + 1)}
                    className="min-h-12 px-6 border-2 border-black bg-indigo-600 text-white font-black text-sm flex items-center gap-2 hover:bg-indigo-700 shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
                  >
                    Next Drill <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleNextCard}
                    disabled={currentIndex === GRAMMAR_CARDS.length - 1}
                    className="min-h-12 px-6 border-2 border-black bg-emerald-600 text-white font-black text-sm flex items-center gap-2 hover:bg-emerald-700 shadow-[3px_3px_0_0_rgba(0,0,0,1)] disabled:opacity-40"
                  >
                    Next Grammar Card <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Feedback & Explanation Box */}
          {revealed && (
            <div className={`p-4 border-[3px] border-black space-y-2 ${
              selectedOption === currentDrill.correctAnswer || !selectedOption
                ? 'bg-emerald-50 dark:bg-emerald-950/40'
                : 'bg-rose-50 dark:bg-rose-950/40'
            }`}>
              <div className="flex items-center gap-2 font-black text-sm">
                {selectedOption === currentDrill.correctAnswer ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5" /> Correct Rule Match!
                  </span>
                ) : selectedOption ? (
                  <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                    <XCircle className="w-5 h-5" /> Not quite: check the formula below
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
                    <BookOpen className="w-5 h-5" /> Verified Solution
                  </span>
                )}
              </div>

              <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                {currentDrill.fullSentence}
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                {currentDrill.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
