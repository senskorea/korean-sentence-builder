import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  PenTool, 
  Eraser, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Eye, 
  EyeOff,
  BookOpen,
  Filter
} from 'lucide-react';
import { getStroke } from 'perfect-freehand';
import { GRAMMAR_SUBCARDS, GRAMMAR_TOPICS, type GrammarSubcard } from '../data/grammarRules';

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
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stylusOnly, setStylusOnly] = useState<boolean>(() => {
    try {
      return localStorage.getItem('korean_stylus_only') === 'true';
    } catch {
      return false;
    }
  });

  // Filter cards by topic
  const filteredCards = selectedTopic === 'all' 
    ? GRAMMAR_SUBCARDS 
    : GRAMMAR_SUBCARDS.filter((c) => c.topicId === selectedTopic);

  const currentCard: GrammarSubcard = filteredCards[cardIndex] || filteredCards[0];

  // Canvas Drawing Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBoxRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const activePointerType = useRef<'pen' | 'touch' | 'mouse' | null>(null);
  const renderFrame = useRef<number | null>(null);
  const lines = useRef<number[][][]>([]);
  const currentLine = useRef<number[][] | null>(null);
  const toolRef = useRef<'pen' | 'eraser'>('pen');
  const [toolState, setToolState] = useState<'pen' | 'eraser'>('pen');

  // Per-card drawing memory (in-memory while active)
  const savedCardLines = useRef<Record<string, number[][][]>>({});

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

  // Render Canvas with High Performance 2D Path
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle Korean handwriting guidelines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const spacing = 36 * (window.devicePixelRatio || 1);
    for (let y = spacing; y < canvas.height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#1e1b4b';

    lines.current.forEach((stroke) => {
      const outline = getStroke(stroke, {
        size: 5 * (window.devicePixelRatio || 1),
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5
      });
      const pathData = pathFromStroke(outline);
      if (pathData) {
        ctx.fill(new Path2D(pathData));
      }
    });

    if (currentLine.current) {
      const outline = getStroke(currentLine.current, {
        size: 5 * (window.devicePixelRatio || 1),
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5
      });
      const pathData = pathFromStroke(outline);
      if (pathData) {
        ctx.fill(new Path2D(pathData));
      }
    }
  }, []);

  const requestCanvasRender = useCallback(() => {
    if (renderFrame.current !== null) return;
    renderFrame.current = window.requestAnimationFrame(() => {
      renderFrame.current = null;
      renderCanvas();
    });
  }, [renderCanvas]);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const box = canvasBoxRef.current;
    if (!canvas || !box) return;

    const rect = box.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    renderCanvas();
  }, [renderCanvas]);

  // Save current card lines before switching card
  const persistCurrentCardDrawing = useCallback(() => {
    if (currentCard) {
      savedCardLines.current[currentCard.id] = [...lines.current];
    }
  }, [currentCard]);

  // Load drawing when card changes
  useEffect(() => {
    setRevealed(false);
    if (currentCard) {
      lines.current = savedCardLines.current[currentCard.id] || [];
    } else {
      lines.current = [];
    }
    currentLine.current = null;
    requestCanvasRender();
  }, [currentCard?.id, requestCanvasRender]);

  // Sync canvas size on mount & resize
  useEffect(() => {
    syncCanvasSize();
    const box = canvasBoxRef.current;
    if (!box) return;

    const observer = new ResizeObserver(() => syncCanvasSize());
    observer.observe(box);
    window.addEventListener('resize', syncCanvasSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncCanvasSize);
    };
  }, [syncCanvasSize]);

  // Pointer stroke handlers with 120Hz Apple Pencil coalescing
  const appendPointerSamples = useCallback((event: PointerEvent, includeEndpoint = true) => {
    if (!currentLine.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    const coalesced = event.getCoalescedEvents?.() || [];
    const samples = includeEndpoint ? [...coalesced, event] : coalesced;

    samples.forEach((sample) => {
      const previous = currentLine.current?.[currentLine.current.length - 1];
      const pressure = sample.pointerType === 'pen' && sample.pressure > 0 ? sample.pressure : 0.5;
      const next = [
        (sample.clientX - rect.left) * ratio,
        (sample.clientY - rect.top) * ratio,
        pressure
      ];

      if (!previous) {
        currentLine.current?.push(next);
        return;
      }

      if (sample.pointerType === 'pen' && sample.pressure === 0) {
        next[2] = previous[2];
      }

      const dx = next[0] - previous[0];
      const dy = next[1] - previous[1];
      const distance = Math.hypot(dx, dy);
      if (distance < 0.2) return;

      const steps = Math.max(1, Math.ceil(distance / (3 * ratio)));
      for (let step = 1; step <= steps; step += 1) {
        const amount = step / steps;
        currentLine.current?.push([
          previous[0] + dx * amount,
          previous[1] + dy * amount,
          previous[2] + (next[2] - previous[2]) * amount
        ]);
      }
    });
  }, []);

  const eraseAt = useCallback((x: number, y: number, radius = 30) => {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const scaledRadius = radius * ratio;
    lines.current = lines.current.filter((stroke) =>
      !stroke.some(([sx, sy]) => Math.hypot(sx - x, sy - y) < scaledRadius)
    );
    renderCanvas();
  }, [renderCanvas]);

  const beginStroke = useCallback((event: PointerEvent) => {
    if (stylusOnly && event.pointerType === 'touch') {
      return;
    }

    // Palm rejection preemption: if pen touches down while touch active, pen wins
    if (event.pointerType === 'pen' && activePointerType.current === 'touch') {
      currentLine.current = null;
      activePointerId.current = null;
      activePointerType.current = null;
    }

    if (activePointerId.current !== null && activePointerId.current !== event.pointerId) {
      return;
    }

    // Reject broad palm contacts
    if (event.pointerType === 'touch' && (event.width > 24 || event.height > 24)) {
      return;
    }

    event.preventDefault();
    activePointerId.current = event.pointerId;
    activePointerType.current = event.pointerType as 'pen' | 'touch' | 'mouse';

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const pressure = event.pointerType === 'pen' && event.pressure > 0 ? event.pressure : 0.5;

    const x = (event.clientX - rect.left) * ratio;
    const y = (event.clientY - rect.top) * ratio;

    if (toolRef.current === 'eraser') {
      eraseAt(x, y);
      drawing.current = true;
    } else {
      currentLine.current = [[x, y, pressure]];
      drawing.current = true;
      requestCanvasRender();
    }
  }, [stylusOnly, eraseAt, requestCanvasRender]);

  const continueStroke = useCallback((event: PointerEvent) => {
    if (!drawing.current || activePointerId.current !== event.pointerId) {
      return;
    }
    event.preventDefault();

    if (toolRef.current === 'eraser') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      eraseAt((event.clientX - rect.left) * ratio, (event.clientY - rect.top) * ratio);
    } else {
      appendPointerSamples(event);
      requestCanvasRender();
    }
  }, [appendPointerSamples, eraseAt, requestCanvasRender]);

  const endStroke = useCallback((event: PointerEvent) => {
    if (!drawing.current || activePointerId.current !== event.pointerId) {
      return;
    }
    event.preventDefault();

    if (toolRef.current !== 'eraser') {
      appendPointerSamples(event, event.type !== 'pointercancel');
      if (currentLine.current?.length) {
        lines.current.push([...currentLine.current]);
      }
      currentLine.current = null;
    }

    drawing.current = false;
    activePointerId.current = null;
    activePointerType.current = null;

    if (renderFrame.current !== null) {
      window.cancelAnimationFrame(renderFrame.current);
      renderFrame.current = null;
    }
    renderCanvas();
    persistCurrentCardDrawing();
  }, [appendPointerSamples, renderCanvas, persistCurrentCardDrawing]);

  // Attach native listeners to canvas element
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerDown = (e: PointerEvent) => beginStroke(e);
    const onPointerMove = (e: PointerEvent) => continueStroke(e);
    const onPointerUp = (e: PointerEvent) => endStroke(e);
    const onPointerCancel = (e: PointerEvent) => endStroke(e);

    canvas.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerCancel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [beginStroke, continueStroke, endStroke]);

  const handleClear = () => {
    lines.current = [];
    currentLine.current = null;
    renderCanvas();
    persistCurrentCardDrawing();
  };

  const handleSelectTool = (t: 'pen' | 'eraser') => {
    toolRef.current = t;
    setToolState(t);
  };

  // Card Navigation
  const handlePrev = () => {
    persistCurrentCardDrawing();
    if (cardIndex > 0) {
      setCardIndex(cardIndex - 1);
    }
  };

  const handleNext = () => {
    persistCurrentCardDrawing();
    if (cardIndex < filteredCards.length - 1) {
      setCardIndex(cardIndex + 1);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Top Filter & Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-[3px] border-black bg-white dark:bg-slate-900 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
          {GRAMMAR_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => {
                persistCurrentCardDrawing();
                setSelectedTopic(topic.id);
                setCardIndex(0);
              }}
              className={`px-2.5 py-1 text-xs font-black border-2 border-black whitespace-nowrap transition-all ${
                selectedTopic === topic.id
                  ? 'bg-black text-white dark:bg-amber-400 dark:text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {topic.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs font-black px-2 py-1 bg-amber-100 dark:bg-amber-950 border border-black font-mono">
            Card {cardIndex + 1} / {filteredCards.length}
          </span>
        </div>
      </div>

      {/* Main Flashcard Card Container */}
      <div className="border-[3px] border-black bg-white dark:bg-slate-900 shadow-[6px_6px_0_0_rgba(0,0,0,1)] overflow-hidden flex flex-col">
        {/* Card Header */}
        <div className="p-4 sm:p-5 border-b-[3px] border-black bg-slate-50 dark:bg-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-indigo-600 text-white">
                {currentCard.topicTitle}
              </span>
              <span className="text-xs font-black text-slate-600 dark:text-slate-300">
                {currentCard.badge}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black mt-1 text-slate-900 dark:text-slate-100">
              {currentCard.title}
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              {currentCard.koreanTitle}
            </p>
          </div>

          {/* Formula Callout */}
          {currentCard.formula && (
            <div className="p-2.5 bg-amber-200 dark:bg-amber-950/60 border-2 border-black font-mono font-bold text-xs sm:text-sm text-black dark:text-amber-200 self-start sm:self-auto max-w-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-800 inline mr-1.5" />
              {currentCard.formula}
            </div>
          )}
        </div>

        {/* Card Body: Explanation & Examples */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Summary & Bullet Rules */}
          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
              {currentCard.summary}
            </p>
            <div className="space-y-1 text-xs sm:text-sm font-medium">
              {currentCard.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-black text-indigo-600 leading-none mt-1">•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Textbook Examples Grid */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Textbook Examples
            </span>
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              {currentCard.examples.map((ex, idx) => (
                <div key={idx} className="p-2.5 bg-slate-100 dark:bg-slate-800 border border-black/30">
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

          {/* Interactive Stylus Practice Box */}
          <div className="pt-3 border-t-2 border-black space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs font-black text-indigo-600 uppercase tracking-wide">
                  Practice Prompt
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {currentCard.practicePrompt}
                </p>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleStylusOnly}
                  className={`px-2 py-1 text-xs font-black border-2 border-black flex items-center gap-1 shadow-[1px_1px_0_0_rgba(0,0,0,1)] ${
                    stylusOnly
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {stylusOnly ? 'Stylus Only (On)' : 'Stylus Only (Off)'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTool('pen')}
                  className={`px-2 py-1 text-xs font-black border-2 border-black flex items-center gap-1 ${
                    toolState === 'pen' ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  <PenTool className="w-3 h-3" /> Pen
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTool('eraser')}
                  className={`px-2 py-1 text-xs font-black border-2 border-black flex items-center gap-1 ${
                    toolState === 'eraser' ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  <Eraser className="w-3 h-3" /> Eraser
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-1 text-xs font-black border-2 border-black bg-white hover:bg-rose-50 text-rose-700 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>

            {/* High Performance HTML5 Drawing Canvas */}
            <div 
              ref={canvasBoxRef}
              className="relative w-full h-40 sm:h-44 bg-white dark:bg-slate-950 border-[3px] border-black overflow-hidden shadow-[3px_3px_0_0_rgba(0,0,0,1)]"
            >
              <canvas
                ref={canvasRef}
                className="absolute inset-0 z-10 w-full h-full touch-none cursor-crosshair"
              />
              <div className="absolute top-2 left-3 z-0 pointer-events-none text-slate-300 dark:text-slate-700 text-xs font-mono font-bold select-none">
                {currentCard.practiceTarget}
              </div>
            </div>

            {/* Answer Reveal Button & Feedback */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => setRevealed(!revealed)}
                className="min-h-10 px-4 border-2 border-black bg-amber-300 dark:bg-amber-500 text-black font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-amber-400 active:translate-y-0.5"
              >
                {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {revealed ? 'Hide Solution' : 'Check Solution'}
              </button>

              {revealed && currentCard.practiceAnswer && (
                <div className="flex-1 p-2 bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 text-xs font-mono font-black text-emerald-950 dark:text-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
                  {currentCard.practiceAnswer}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Big Bottom Navigation Buttons */}
        <div className="p-4 sm:p-5 border-t-[3px] border-black bg-slate-100 dark:bg-slate-800 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={cardIndex === 0}
            className="flex-1 min-h-14 sm:min-h-16 px-6 border-[3px] border-black bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] disabled:opacity-30 disabled:shadow-none hover:enabled:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
            Previous Card
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={cardIndex === filteredCards.length - 1}
            className="flex-1 min-h-14 sm:min-h-16 px-6 border-[3px] border-black bg-indigo-600 text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] disabled:opacity-30 disabled:shadow-none hover:enabled:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            Next Card
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
