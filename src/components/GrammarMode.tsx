import { useState, useRef, useEffect, useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  PenTool, 
  Highlighter, 
  Eraser, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Eye, 
  EyeOff,
  BookOpen
} from 'lucide-react';
import { getStroke } from 'perfect-freehand';
import { GRAMMAR_CARDS, type GrammarCard } from '../data/grammarRules';

interface Props {
  onBackToVocab?: () => void;
}

interface StrokeData {
  points: number[][];
  color: string;
  size: number;
  opacity: number;
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
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [showSelfCheckAnswers, setShowSelfCheckAnswers] = useState(false);
  const [stylusOnly, setStylusOnly] = useState<boolean>(() => {
    try {
      return localStorage.getItem('korean_stylus_only') === 'true';
    } catch {
      return false;
    }
  });

  // Card strokes mapping: cardId -> StrokeData[]
  const [cardStrokes, setCardStrokes] = useState<Record<string, StrokeData[]>>(() => {
    try {
      const saved = localStorage.getItem('korean_grammar_card_strokes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [currentPoints, setCurrentPoints] = useState<number[][] | null>(null);
  const activePointerType = useRef<'pen' | 'touch' | 'mouse' | null>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

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
  const currentStrokes: StrokeData[] = selectedCardId ? cardStrokes[selectedCardId] || [] : [];

  const saveStrokesForCard = useCallback((cardId: string, updated: StrokeData[]) => {
    setCardStrokes((prev) => {
      const next = { ...prev, [cardId]: updated };
      try {
        localStorage.setItem('korean_grammar_card_strokes', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  const clearCardStrokes = () => {
    if (!selectedCardId) return;
    saveStrokesForCard(selectedCardId, []);
    setCurrentPoints(null);
  };

  // Pointer Handlers for Full Card Annotation Canvas
  const handlePointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    activePointerType.current = e.pointerType as 'pen' | 'touch' | 'mouse';

    // If stylus-only is on, ignore non-pen input so touch can scroll naturally
    if (stylusOnly && e.pointerType !== 'pen') {
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = e.currentTarget.getBoundingClientRect();
    const point = [e.clientX - rect.left, e.clientY - rect.top, e.pressure || 0.5];

    if (tool === 'eraser') {
      eraseNear(point[0], point[1]);
    } else {
      setCurrentPoints([point]);
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
    } else if (currentPoints) {
      setCurrentPoints((prev) => (prev ? [...prev, point] : [point]));
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (stylusOnly && e.pointerType !== 'pen') return;
    activePointerType.current = null;

    if (currentPoints && currentPoints.length > 0 && selectedCardId) {
      const newStroke: StrokeData = {
        points: currentPoints,
        color: tool === 'highlighter' ? '#fbbf24' : '#1e1b4b',
        size: tool === 'highlighter' ? 14 : 3.5,
        opacity: tool === 'highlighter' ? 0.45 : 0.95
      };
      saveStrokesForCard(selectedCardId, [...currentStrokes, newStroke]);
      setCurrentPoints(null);
    }
  };

  const eraseNear = (x: number, y: number, radius = 25) => {
    if (!selectedCardId) return;
    const remaining = currentStrokes.filter((stroke) =>
      !stroke.points.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < radius)
    );
    saveStrokesForCard(selectedCardId, remaining);
  };

  // Navigation
  const currentIndex = GRAMMAR_CARDS.findIndex((c) => c.id === selectedCardId);
  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setSelectedCardId(GRAMMAR_CARDS[currentIndex - 1].id);
      setShowSelfCheckAnswers(false);
    }
  };

  const handleNextCard = () => {
    if (currentIndex < GRAMMAR_CARDS.length - 1) {
      setSelectedCardId(GRAMMAR_CARDS[currentIndex + 1].id);
      setShowSelfCheckAnswers(false);
    }
  };

  // ==========================================
  // VIEW 1: Chronological Overview
  // ==========================================
  if (!currentCard) {
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
                Textbook Study Cards
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mt-2">문법 Grammar Learning Points</h1>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
              Read the lesson and write notes, underline text, or practice directly on the card with your stylus.
            </p>
          </div>
          <button
            onClick={() => setSelectedCardId(GRAMMAR_CARDS[0].id)}
            className="px-5 py-3 border-2 border-black bg-indigo-600 text-white font-black hover:bg-indigo-700 active:translate-x-0.5 active:translate-y-0.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-2 text-sm self-start sm:self-auto"
          >
            Open Card 1
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Chronological Card List */}
        <div className="grid md:grid-cols-2 gap-4">
          {GRAMMAR_CARDS.map((card, idx) => {
            const hasNotes = Boolean(cardStrokes[card.id]?.length);
            return (
              <div
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className="cursor-pointer border-[3px] border-black bg-white dark:bg-slate-900 p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Step {idx + 1} · {card.unit}
                    </span>
                    {hasNotes && (
                      <span className="text-[10px] font-black uppercase bg-amber-200 text-amber-900 px-2 py-0.5 border border-black">
                        Handwritten notes saved
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
                    {card.examples.length} textbook examples
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-black group-hover:translate-x-1 transition-transform">
                    Annotate & Study →
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
  // VIEW 2: Single Card with Full Overlay Canvas
  // ==========================================
  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 md:p-6 space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 border-[3px] border-black bg-white dark:bg-slate-900 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <button
          onClick={() => setSelectedCardId(null)}
          className="min-h-10 px-3 flex items-center gap-1.5 border-2 border-black bg-slate-100 dark:bg-slate-800 font-black text-xs hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> All Cards
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

      {/* Floating Stylus Toolbar */}
      <div className="sticky top-16 z-20 flex flex-wrap items-center justify-between gap-2 border-2 border-black bg-amber-50 dark:bg-slate-800 p-2.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setTool('pen')}
            className={`min-h-9 px-3 border-2 border-black font-black text-xs flex items-center gap-1.5 ${
              tool === 'pen' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" /> Pen
          </button>
          <button
            onClick={() => setTool('highlighter')}
            className={`min-h-9 px-3 border-2 border-black font-black text-xs flex items-center gap-1.5 ${
              tool === 'highlighter' ? 'bg-amber-400 text-black' : 'bg-white text-black'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" /> Highlighter
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`min-h-9 px-3 border-2 border-black font-black text-xs flex items-center gap-1.5 ${
              tool === 'eraser' ? 'bg-rose-500 text-white' : 'bg-white text-black'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" /> Eraser
          </button>
          <button
            onClick={clearCardStrokes}
            className="min-h-9 px-3 border-2 border-black bg-white hover:bg-rose-100 font-black text-xs flex items-center gap-1 text-rose-700"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Notes
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleStylusOnly}
            className={`min-h-9 px-3 border-2 border-black font-black text-xs flex items-center gap-1.5 ${
              stylusOnly
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
            }`}
          >
            {stylusOnly ? 'Stylus Only: Touch Scrolls' : 'Stylus Only: Off'}
          </button>
          <button
            onClick={() => setShowSelfCheckAnswers(!showSelfCheckAnswers)}
            className="min-h-9 px-3 border-2 border-black bg-white dark:bg-slate-900 font-black text-xs flex items-center gap-1.5"
          >
            {showSelfCheckAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showSelfCheckAnswers ? 'Hide Answers' : 'Reveal Answers'}
          </button>
        </div>
      </div>

      {/* The Unified Card Container with Overlay Handwriting Canvas */}
      <div 
        ref={cardContainerRef} 
        className="relative border-[3px] border-black bg-white dark:bg-slate-900 shadow-[6px_6px_0_0_rgba(0,0,0,1)] select-none"
      >
        {/* Full Card SVG Canvas for Direct Handwriting and Marginalia */}
        <svg
          className="absolute inset-0 z-10 w-full h-full cursor-crosshair"
          style={{ touchAction: stylusOnly ? 'pan-y' : 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {currentStrokes.map((s, idx) => (
            <path
              key={idx}
              d={pathFromStroke(
                getStroke(s.points, {
                  size: s.size,
                  thinning: 0.5,
                  smoothing: 0.5,
                  streamline: 0.5
                })
              )}
              fill={s.color}
              opacity={s.opacity}
            />
          ))}
          {currentPoints && (
            <path
              d={pathFromStroke(
                getStroke(currentPoints, {
                  size: tool === 'highlighter' ? 14 : 3.5,
                  thinning: 0.5,
                  smoothing: 0.5,
                  streamline: 0.5
                })
              )}
              fill={tool === 'highlighter' ? '#fbbf24' : '#1e1b4b'}
              opacity={tool === 'highlighter' ? 0.45 : 0.95}
            />
          )}
        </svg>

        {/* Card Content (Rendered Underneath the Handwriting Layer) */}
        <div className="relative z-0 p-6 sm:p-10 space-y-8 pointer-events-none">
          {/* Unit & Title */}
          <div className="border-b-2 border-black pb-4">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {currentCard.unit}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black mt-1">{currentCard.title}</h2>
            <p className="text-sm font-bold text-slate-500 mt-0.5">{currentCard.koreanTitle}</p>
          </div>

          {/* Formula Banner */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-black font-mono font-bold text-base text-amber-950 dark:text-amber-200 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>{currentCard.formula}</span>
          </div>

          {/* Summary */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-l-4 border-indigo-600 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {currentCard.summary}
          </div>

          {/* Mechanics & Conditions */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Grammar Mechanics & Batchim Rules
            </h3>
            <div className="space-y-2 text-sm sm:text-base font-medium">
              {currentCard.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="font-black text-indigo-600 text-lg leading-none mt-0.5">•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Examples & Liaison Guides */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Textbook Dialogue & Sentence Examples
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {currentCard.examples.map((ex, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800 border-2 border-black/40 space-y-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-black text-lg text-slate-900 dark:text-slate-100">{ex.korean}</span>
                    {ex.pronunciation && (
                      <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400 font-bold">
                        {ex.pronunciation}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">{ex.english}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Integrated Study Prompts & Notes Space */}
          <div className="pt-6 border-t-2 border-dashed border-slate-300 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600">
                Self Practice Check & Textbook Marginalia
              </h3>
              <span className="text-[11px] font-bold text-slate-400">
                Use your stylus to write notes or answers directly here
              </span>
            </div>

            <div className="space-y-4">
              {currentCard.drills.map((drill, idx) => (
                <div key={drill.id} className="p-4 border-2 border-black bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-black uppercase text-slate-400">Exercise {idx + 1}</span>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{drill.prompt}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-700">
                        {drill.target}
                      </span>
                    </div>
                  </div>

                  {/* Lined Writing Space for Hand Notes */}
                  <div className="h-16 w-full border-b-2 border-slate-300 dark:border-slate-700 flex items-end pb-1 text-xs text-slate-300 italic">
                    Write solution here with stylus...
                  </div>

                  {/* Revealed Solution */}
                  {showSelfCheckAnswers && (
                    <div className="mt-2 p-2.5 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 text-xs space-y-1">
                      <p className="font-black text-emerald-900 dark:text-emerald-200 font-mono text-sm">
                        {drill.fullSentence}
                      </p>
                      <p className="font-bold text-emerald-800 dark:text-emerald-300">
                        {drill.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Card Navigation */}
          <div className="pt-6 border-t-2 border-black flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Handwritten annotations are automatically preserved on this card.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevCard}
                disabled={currentIndex === 0}
                className="pointer-events-auto min-h-11 px-4 border-2 border-black bg-white dark:bg-slate-800 font-black text-xs disabled:opacity-40"
              >
                ← Prev Card
              </button>
              <button
                onClick={handleNextCard}
                disabled={currentIndex === GRAMMAR_CARDS.length - 1}
                className="pointer-events-auto min-h-11 px-4 border-2 border-black bg-indigo-600 text-white font-black text-xs disabled:opacity-40"
              >
                Next Card →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
