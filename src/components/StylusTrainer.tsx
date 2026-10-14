import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PenTool, RotateCcw, Eraser, Eye, EyeOff, Sliders, Type } from 'lucide-react';

interface LetterItem {
  char: string;
  name: string;
  pron: string;
}

const CONSONANTS: LetterItem[] = [
  { char: 'ㄱ', name: '기역', pron: 'g / k' },
  { char: 'ㄴ', name: '니은', pron: 'n' },
  { char: 'ㄷ', name: '디귿', pron: 'd / t' },
  { char: 'ㄹ', name: '리을', pron: 'r / l' },
  { char: 'ㅁ', name: '미음', pron: 'm' },
  { char: 'ㅂ', name: '비읍', pron: 'b / p' },
  { char: 'ㅅ', name: '시옷', pron: 's' },
  { char: 'ㅇ', name: '이응', pron: 'ng / silent' },
  { char: 'ㅈ', name: '지읒', pron: 'j / ch' },
  { char: 'ㅊ', name: '치읓', pron: 'ch' },
  { char: 'ㅋ', name: '키읔', pron: 'k' },
  { char: 'ㅌ', name: '티읕', pron: 't' },
  { char: 'ㅍ', name: '피읖', pron: 'p' },
  { char: 'ㅎ', name: '히읗', pron: 'h' },
  { char: 'ㄲ', name: '쌍기역', pron: 'kk' },
  { char: 'ㄸ', name: '쌍디귿', pron: 'tt' },
  { char: 'ㅃ', name: '쌍비읍', pron: 'pp' },
  { char: 'ㅆ', name: '쌍시옷', pron: 'ss' },
  { char: 'ㅉ', name: '쌍지읒', pron: 'jj' },
];

const VOWELS: LetterItem[] = [
  { char: 'ㅏ', name: '아', pron: 'a' },
  { char: 'ㅑ', name: '야', pron: 'ya' },
  { char: 'ㅓ', name: '어', pron: 'eo' },
  { char: 'ㅕ', name: '여', pron: 'yeo' },
  { char: 'ㅗ', name: '오', pron: 'o' },
  { char: 'ㅛ', name: '요', pron: 'yo' },
  { char: 'ㅜ', name: '우', pron: 'u' },
  { char: 'ㅠ', name: '유', pron: 'yu' },
  { char: 'ㅡ', name: '으', pron: 'eu' },
  { char: 'ㅣ', name: '이', pron: 'i' },
  { char: 'ㅐ', name: '애', pron: 'ae' },
  { char: 'ㅒ', name: '얘', pron: 'yae' },
  { char: 'ㅔ', name: '에', pron: 'e' },
  { char: 'ㅖ', name: '예', pron: 'ye' },
  { char: 'ㅘ', name: '와', pron: 'wa' },
  { char: 'ㅙ', name: '왜', pron: 'wae' },
  { char: 'ㅚ', name: '외', pron: 'oe' },
  { char: 'ㅝ', name: '워', pron: 'wo' },
  { char: 'ㅞ', name: '웨', pron: 'we' },
  { char: 'ㅟ', name: '위', pron: 'wi' },
  { char: 'ㅢ', name: '의', pron: 'ui' },
];

export default function StylusTrainer() {
  const [sheetType, setSheetType] = useState<'consonants' | 'vowels'>('consonants');
  const [maskLevel, setMaskLevel] = useState<number>(2); // 1 = 25%, 2 = 50%, 3 = 75%, 4 = 100%
  const [revealed, setRevealed] = useState<boolean>(false);
  const [stylusOnly, setStylusOnly] = useState<boolean>(() => {
    try {
      return localStorage.getItem('korean_stylus_only') === 'true';
    } catch {
      return true;
    }
  });

  // Toggle for letter names and romanization (hidden by default)
  const [showLetterNames, setShowLetterNames] = useState<boolean>(() => {
    try {
      return localStorage.getItem('korean_stylus_show_names') === 'true';
    } catch {
      return false; // Hidden by default
    }
  });

  const letters = sheetType === 'consonants' ? CONSONANTS : VOWELS;

  // Global Canvas Drawing State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const activePointerType = useRef<'pen' | 'touch' | 'mouse' | null>(null);
  const lines = useRef<number[][][]>([]);
  const currentLine = useRef<number[][] | null>(null);

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

  const toggleShowLetterNames = () => {
    setShowLetterNames((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('korean_stylus_show_names', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#2563eb'; // Royal Blue Ink
    context.fillStyle = '#2563eb';
    context.lineCap = 'round';
    context.lineJoin = 'round';

    const allLines = currentLine.current ? [...lines.current, currentLine.current] : lines.current;

    for (const stroke of allLines) {
      if (stroke.length < 2) {
        if (stroke.length === 1) {
          context.beginPath();
          context.arc(stroke[0][0], stroke[0][1], 2, 0, Math.PI * 2);
          context.fill();
        }
        continue;
      }

      context.beginPath();
      context.lineWidth = 3.5;
      context.moveTo(stroke[0][0], stroke[0][1]);

      for (let i = 1; i < stroke.length - 1; i++) {
        const xc = (stroke[i][0] + stroke[i + 1][0]) / 2;
        const yc = (stroke[i][1] + stroke[i + 1][1]) / 2;
        context.quadraticCurveTo(stroke[i][0], stroke[i][1], xc, yc);
      }
      context.lineTo(stroke[stroke.length - 1][0], stroke[stroke.length - 1][1]);
      context.stroke();
    }
  }, []);

  // Resize canvas to match the responsive grid bounds
  useEffect(() => {
    const updateSize = () => {
      const container = gridContainerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 3);

      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      renderCanvas();
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [renderCanvas, sheetType]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (stylusOnly && e.pointerType !== 'pen') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;
    activePointerType.current = e.pointerType as 'pen' | 'touch' | 'mouse';
    drawing.current = true;

    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    const x = Math.round((e.clientX - rect.left) * ratio);
    const y = Math.round((e.clientY - rect.top) * ratio);

    currentLine.current = [[x, y]];
    renderCanvas();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || activePointerId.current !== e.pointerId) return;

    const canvas = canvasRef.current;
    if (!canvas || !currentLine.current) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    const x = Math.round((e.clientX - rect.left) * ratio);
    const y = Math.round((e.clientY - rect.top) * ratio);

    currentLine.current.push([x, y]);
    renderCanvas();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activePointerId.current === e.pointerId) {
      if (currentLine.current && currentLine.current.length > 0) {
        lines.current.push(currentLine.current);
      }
      drawing.current = false;
      activePointerId.current = null;
      currentLine.current = null;
      renderCanvas();
    }
  };

  const clearCanvas = () => {
    lines.current = [];
    currentLine.current = null;
    renderCanvas();
  };

  const undoStroke = () => {
    lines.current = lines.current.slice(0, -1);
    renderCanvas();
  };

  // Mask opacity & style calculation
  const getMaskStyle = () => {
    if (revealed) return 'opacity-100 text-emerald-600 dark:text-emerald-400 font-black';
    switch (maskLevel) {
      case 1:
        // 25% masked (mostly clear)
        return 'opacity-65 blur-[0.6px] text-slate-800 dark:text-slate-200';
      case 2:
        // 50% masked (anchor hints)
        return 'opacity-30 blur-[2px] text-slate-700 dark:text-slate-400';
      case 3:
        // 75% masked (very faint silhouette)
        return 'opacity-12 blur-[4px] text-slate-600 dark:text-slate-500';
      case 4:
        // 100% masked (pure recall canvas)
        return 'opacity-0';
      default:
        return 'opacity-30';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 select-none">
      {/* Control Toolbar */}
      <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-3.5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 border-2 border-black p-0.5">
            <button
              onClick={() => { setSheetType('consonants'); clearCanvas(); setRevealed(false); }}
              className={`px-3 py-1 text-xs font-black transition-colors ${
                sheetType === 'consonants' ? 'bg-black text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              자음 Consonants ({CONSONANTS.length})
            </button>
            <button
              onClick={() => { setSheetType('vowels'); clearCanvas(); setRevealed(false); }}
              className={`px-3 py-1 text-xs font-black transition-colors ${
                sheetType === 'vowels' ? 'bg-black text-white' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              모음 Vowels ({VOWELS.length})
            </button>
          </div>

          {/* Masking Intensity Level Slider */}
          <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800 border-2 border-black text-xs font-black">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Masking:</span>
            {[1, 2, 3, 4].map((lvl) => (
              <button
                key={lvl}
                onClick={() => { setMaskLevel(lvl); setRevealed(false); }}
                className={`w-6 h-6 border border-black grid place-items-center text-xs font-black ${
                  maskLevel === lvl ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700'
                }`}
                title={`Level ${lvl}: ${lvl * 25}% Masked`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hide/Show Letter Names & Romanization Toggle (Hidden by default) */}
          <button
            type="button"
            onClick={toggleShowLetterNames}
            className={`h-9 px-3 border-2 border-black flex items-center gap-1.5 font-black text-xs shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 ${
              showLetterNames
                ? 'bg-amber-400 text-black'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
            title="Toggle visibility of letter names and romanization"
          >
            <Type className="w-3.5 h-3.5" />
            <span>{showLetterNames ? 'Names: Visible' : 'Names: Hidden'}</span>
          </button>

          {/* Stylus Mode Toggle */}
          <button
            type="button"
            onClick={toggleStylusOnly}
            className={`h-9 px-3 border-2 border-black flex items-center gap-1.5 font-black text-xs shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 ${
              stylusOnly ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700'
            }`}
            title="When active, touch and palm touches are ignored"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>{stylusOnly ? 'Stylus: ON' : 'Stylus: OFF'}</span>
          </button>

          {/* Reveal & Check Button */}
          <button
            onClick={() => setRevealed(!revealed)}
            className={`h-9 px-4 border-2 border-black font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 ${
              revealed ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'
            }`}
          >
            {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{revealed ? 'Hide Ground Truth' : 'Reveal & Check'}</span>
          </button>

          <button
            onClick={undoStroke}
            className="h-9 px-2.5 bg-white dark:bg-slate-800 border-2 border-black flex items-center gap-1 font-black text-xs shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Undo
          </button>
          <button
            onClick={clearCanvas}
            className="h-9 px-2.5 bg-white dark:bg-slate-800 border-2 border-black flex items-center gap-1 font-black text-xs shadow-[1px_1px_0_0_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            <Eraser className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Full Sheet Canvas Container */}
      <div
        ref={gridContainerRef}
        className="relative bg-white dark:bg-slate-900 border-[3px] border-black p-3 sm:p-4 shadow-[5px_5px_0_0_rgba(0,0,0,1)] overflow-hidden"
      >
        {/* Background Letter Grid */}
        <div
          className={`grid ${
            sheetType === 'consonants'
              ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-7'
              : 'grid-cols-4 sm:grid-cols-5 md:grid-cols-7'
          } gap-2.5 sm:gap-3`}
        >
          {letters.map((item, idx) => (
            <div
              key={item.char + idx}
              className={`h-24 sm:h-28 border-2 border-black flex flex-col justify-between p-2 text-center transition-colors relative ${
                revealed
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-950'
                  : 'bg-slate-50 dark:bg-slate-800/80'
              }`}
            >
              {/* Header Label: Name & Sound (Hidden by default unless toggled or revealed) */}
              <div
                className={`flex justify-between items-center text-[10px] font-black pointer-events-none transition-opacity ${
                  showLetterNames || revealed ? 'opacity-100 text-slate-400' : 'opacity-0'
                }`}
              >
                <span>{item.name}</span>
                <span>{item.pron}</span>
              </div>

              {/* Partially Masked Character */}
              <div
                className={`text-5xl sm:text-6xl select-none pointer-events-none transition-all duration-300 ${getMaskStyle()}`}
              >
                {item.char}
              </div>

              {/* Status indicator */}
              <div className="text-[9px] font-bold text-slate-400 pointer-events-none">
                {revealed ? 'Verified' : `Mask L${maskLevel}`}
              </div>
            </div>
          ))}
        </div>

        {/* Global Interactive Canvas Layer for Digital Stylus */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 z-20 w-full h-full touch-none cursor-crosshair"
        />
      </div>

      {/* Instructions footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-2 border-black text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div>
          <strong>Active Recall Instruction:</strong> Letter names and romanizations are hidden by default. Use your Apple Pencil or stylus to write each letter directly over its box.
        </div>
        <div className="font-bold">
          When finished, tap <span className="text-indigo-600 dark:text-indigo-400">"Reveal & Check"</span> to compare your handwriting against the ground truth.
        </div>
      </div>
    </div>
  );
}
