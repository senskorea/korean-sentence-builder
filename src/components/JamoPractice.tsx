import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, Award, Eraser, Eye, EyeOff, RotateCcw, X } from 'lucide-react';
import { getStroke } from 'perfect-freehand';
import { JAMO_EXERCISES, type JamoExercise, type JamoLayout, type JamoLevel } from '../data/jamoPractice';

type Screen = 'setup' | 'session' | 'summary';
type Rating = 0 | 1 | 2;
interface ReviewStat { repetition: number; nextReviewDate: number; }

function strokePath(stroke: number[][]) {
  if (!stroke.length) return '';
  const path = stroke.reduce<(string | number)[]>((result, [x0, y0], index, points) => {
    const [x1, y1] = points[(index + 1) % points.length];
    result.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    return result;
  }, ['M', ...stroke[0], 'Q']);
  path.push('Z');
  return path.join(' ');
}

const levelLabels: Record<JamoLevel | 'mixed', string> = { basic: 'Basic CV', compound: 'Compound vowels', batchim: 'CVC + batchim', mixed: 'Mixed practice' };

export default function JamoPractice({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>('setup');
  const [level, setLevel] = useState<JamoLevel | 'mixed'>('basic');
  const [sessionLength, setSessionLength] = useState(10);
  const [items, setItems] = useState<JamoExercise[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<Record<string, ReviewStat>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBoxRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const lines = useRef<number[][][]>([]);
  const currentLine = useRef<number[][] | null>(null);

  useEffect(() => {
    try { setStats(JSON.parse(localStorage.getItem('korean_jamo_stats') || '{}')); }
    catch { setStats({}); }
  }, []);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const ratio = window.devicePixelRatio || 1;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(ratio, ratio);
    context.fillStyle = '#4f46e5';
    const strokes = currentLine.current?.length ? [...lines.current, currentLine.current] : lines.current;
    strokes.forEach((line) => {
      const stroke = getStroke(line, { size: 14, thinning: 0.55, smoothing: 0.5, streamline: 0.5, simulatePressure: false });
      if (stroke.length) context.fill(new Path2D(strokePath(stroke)));
    });
  }, []);

  const clear = useCallback(() => { lines.current = []; currentLine.current = null; renderCanvas(); }, [renderCanvas]);
  const undo = () => { lines.current = lines.current.slice(0, -1); renderCanvas(); };

  useEffect(() => {
    if (screen !== 'session') return;
    const resize = () => {
      const canvas = canvasRef.current;
      const box = canvasBoxRef.current;
      if (!canvas || !box) return;
      const rect = box.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      renderCanvas();
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [screen, index, renderCanvas]);

  const begin = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    currentLine.current = [[event.clientX - rect.left, event.clientY - rect.top, event.pressure || 0.5]];
    drawing.current = true;
    renderCanvas();
  };
  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !currentLine.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    currentLine.current.push([event.clientX - rect.left, event.clientY - rect.top, event.pressure || 0.5]);
    renderCanvas();
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentLine.current?.length) lines.current.push([...currentLine.current]);
    currentLine.current = null;
    renderCanvas();
  };

  const filtered = useMemo(() => level === 'mixed' ? JAMO_EXERCISES : JAMO_EXERCISES.filter((item) => item.level === level), [level]);
  const start = () => {
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const ordered = [...shuffled.filter((item) => !stats[item.id] || stats[item.id].nextReviewDate <= Date.now()), ...shuffled.filter((item) => stats[item.id]?.nextReviewDate > Date.now())];
    setItems(ordered.slice(0, Math.min(sessionLength, ordered.length)));
    setIndex(0); setRatings([]); setRevealed(false); setShowOverlay(true); clear(); setScreen('session');
  };
  const rate = (rating: Rating) => {
    const exercise = items[index];
    const old = stats[exercise.id] || { repetition: 0, nextReviewDate: Date.now() };
    const repetition = rating === 0 ? 0 : Math.min(5, old.repetition + 1);
    const days = rating === 0 ? 0.25 : rating === 1 ? 1 : repetition <= 1 ? 3 : Math.min(30, repetition * 4);
    const updated = { ...stats, [exercise.id]: { repetition, nextReviewDate: Date.now() + days * 86400000 } };
    setStats(updated); localStorage.setItem('korean_jamo_stats', JSON.stringify(updated));
    setRatings((previous) => [...previous, rating]);
    if (index + 1 >= items.length) setScreen('summary');
    else { setIndex((value) => value + 1); setRevealed(false); setShowOverlay(true); clear(); }
  };

  if (screen === 'setup') return (
    <div className="w-full max-w-5xl mx-auto bg-white border-[3px] border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] p-5 sm:p-8">
      <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-600">Hangul Lab</p><h2 className="text-3xl sm:text-4xl font-black mt-1">Build syllable blocks</h2></div><button onClick={onExit} className="min-h-11 px-4 flex items-center gap-2 border-2 border-black bg-white font-black text-xs"><ArrowLeft className="w-4 h-4" />Learn</button></div>
      <p className="text-slate-500 font-semibold mt-3 mb-7">Study the supplied Jamo, assemble them in the correct block, then reveal and compare.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {(Object.keys(levelLabels) as (JamoLevel | 'mixed')[]).map((value) => <button key={value} onClick={() => setLevel(value)} className={`min-h-24 p-4 text-left border-[3px] border-black ${level === value ? 'bg-indigo-600 text-white shadow-none translate-x-1 translate-y-1' : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}><strong className="block text-lg">{levelLabels[value]}</strong><span className={`text-xs font-bold ${level === value ? 'text-indigo-100' : 'text-slate-500'}`}>{value === 'mixed' ? `${JAMO_EXERCISES.length} blocks · all six layouts` : `${JAMO_EXERCISES.filter((item) => item.level === value).length} practice blocks`}</span></button>)}
      </div>
      <div className="mt-7 p-5 bg-slate-50 border-2 border-slate-200"><span className="block text-xs font-black uppercase tracking-wider mb-3">Session length</span><div className="grid grid-cols-3 gap-2 max-w-lg">{[5, 10, 20].map((value) => <button key={value} onClick={() => setSessionLength(value)} className={`min-h-12 border-2 border-black font-black ${sessionLength === value ? 'bg-black text-white' : 'bg-white'}`}>{value}</button>)}</div></div>
      <button onClick={start} className="w-full min-h-16 mt-5 bg-indigo-600 text-white border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] font-black text-xl">Start random practice</button>
    </div>
  );

  if (screen === 'summary') return (
    <div className="w-full max-w-3xl mx-auto min-h-[620px] bg-white border-[3px] border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] p-6 flex flex-col items-center justify-center text-center"><Award className="w-20 h-20 text-amber-500 mb-5" /><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-600">Block session complete</p><h2 className="text-5xl font-black mt-2">잘했어요!</h2><p className="text-slate-500 font-bold mt-3">You assembled {ratings.length} Hangul blocks.</p><div className="grid grid-cols-3 gap-3 w-full max-w-xl my-9"><Result value={ratings.filter((x) => x === 0).length} label="Again" color="bg-rose-100" /><Result value={ratings.filter((x) => x === 1).length} label="Close" color="bg-amber-100" /><Result value={ratings.filter((x) => x === 2).length} label="Correct" color="bg-emerald-100" /></div><div className="grid sm:grid-cols-2 gap-3 w-full max-w-xl"><button onClick={start} className="min-h-14 bg-indigo-600 text-white border-[3px] border-black font-black text-lg">Practise again</button><button onClick={() => setScreen('setup')} className="min-h-14 bg-white border-[3px] border-black font-black text-lg">Change practice</button></div></div>
  );

  const exercise = items[index];
  return (
    <div className="w-full h-[100dvh] bg-white flex flex-col overflow-hidden select-none">
      <header className="flex items-center gap-3 px-2 py-2 border-b border-slate-200"><button onClick={() => setScreen('setup')} className="w-10 h-10 shrink-0 grid place-items-center border-2 border-black" aria-label="Exit block session"><X className="w-4 h-4" /></button><div className="flex-1 h-2 bg-slate-200 overflow-hidden"><div className="h-full bg-indigo-600" style={{ width: `${((index + 1) / items.length) * 100}%` }} /></div><strong className="text-xs tabular-nums">{index + 1}/{items.length}</strong></header>
      <main className="flex-1 min-h-0 grid grid-rows-[auto_1fr] md:grid-rows-1 md:grid-cols-[minmax(230px,32%)_1fr] gap-2 p-2 sm:p-3">
        <section className="border-[3px] border-black bg-amber-100 p-4 flex md:flex-col items-center justify-between md:justify-center text-center gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-amber-800">Assemble these Jamo</p><div className="flex items-center justify-center gap-3 mt-2 text-5xl sm:text-6xl font-black"><span>{exercise.initial}</span><span className="text-2xl text-slate-400">+</span><span>{exercise.medial}</span>{exercise.final && <><span className="text-2xl text-slate-400">+</span><span>{exercise.final}</span></>}</div></div>
          <div className="md:mt-8"><span className="inline-block px-3 py-1 bg-white border-2 border-black text-[10px] font-black uppercase tracking-wider">{layoutName(exercise.layout)}</span>{revealed && <div className="mt-3"><strong className="block text-4xl">{exercise.syllable}</strong><span className="font-black text-indigo-700">{exercise.romanization}</span><p className="text-xs font-bold text-slate-600">{exercise.soundHint}</p></div>}</div>
        </section>
        <section ref={canvasBoxRef} className="relative min-h-0 border-[3px] border-black bg-white overflow-hidden">
          <BlockTemplate layout={exercise.layout} />
          {revealed && showOverlay && <div className="absolute inset-0 z-[5] grid place-items-center pointer-events-none"><span className="text-[clamp(9rem,35vw,24rem)] leading-none font-black text-indigo-200/65">{exercise.syllable}</span></div>}
          <canvas ref={canvasRef} onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={end} className="absolute inset-0 z-10 w-full h-full touch-none cursor-crosshair" />
          <div className="absolute z-20 top-3 right-3 flex flex-wrap justify-end gap-2">
            {!revealed ? <button onClick={() => setRevealed(true)} className="h-12 min-w-40 px-5 bg-indigo-600 text-white border-2 border-black font-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">Reveal answer</button> : <button onClick={() => setShowOverlay((value) => !value)} className="h-12 px-4 bg-indigo-100 border-2 border-black font-black flex items-center gap-2">{showOverlay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}{showOverlay ? 'Hide guide' : 'Show guide'}</button>}
            <button onClick={undo} className="h-12 px-3 bg-white border-2 border-black flex items-center gap-2 font-black text-xs"><RotateCcw className="w-4 h-4" />Undo</button><button onClick={clear} className="h-12 px-3 bg-white border-2 border-black flex items-center gap-2 font-black text-xs"><Eraser className="w-4 h-4" />Clear</button>
          </div>
          {revealed && <div className="absolute z-20 inset-x-3 bottom-3 grid grid-cols-3 gap-2"><Rate label="Again" hint="Try soon" color="bg-rose-100" onClick={() => rate(0)} /><Rate label="Close" hint="Almost" color="bg-amber-100" onClick={() => rate(1)} /><Rate label="Correct" hint="Got it" color="bg-emerald-100" onClick={() => rate(2)} /></div>}
        </section>
      </main>
    </div>
  );
}

function layoutName(layout: JamoLayout) {
  const [structure, orientation] = layout.split('-');
  return `${structure.toUpperCase()} · ${orientation}`;
}

function BlockTemplate({ layout }: { layout: JamoLayout }) {
  const final = layout.startsWith('cvc');
  const kind = layout.split('-')[1];
  return <div className="absolute inset-0 z-0 p-[12%] pointer-events-none text-slate-300"><div className={`w-full h-full grid gap-2 ${final ? 'grid-rows-[2fr_1fr]' : ''}`}><div className={`grid gap-2 ${kind === 'vertical' ? 'grid-cols-2' : kind === 'horizontal' ? 'grid-rows-2' : 'grid-cols-[1fr_1.25fr] grid-rows-2'}`}>
    <Slot label="C" />
    {kind === 'compound' ? <><Slot label="V" className="row-span-2" /><Slot label="V" /></> : <Slot label="V" />}
  </div>{final && <Slot label="C" />}</div></div>;
}
function Slot({ label, className = '' }: { label: string; className?: string }) { return <div className={`border-2 border-dashed border-slate-300 grid place-items-center ${className}`}><span className="text-2xl sm:text-4xl font-black text-slate-200">{label}</span></div>; }
function Rate({ label, hint, color, onClick }: { label: string; hint: string; color: string; onClick: () => void }) { return <button onClick={onClick} className={`min-h-16 ${color} border-[3px] border-black font-black`}><span className="block text-sm sm:text-lg">{label}</span><small>{hint}</small></button>; }
function Result({ value, label, color }: { value: number; label: string; color: string }) { return <div className={`p-5 ${color} border-2 border-black`}><strong className="text-3xl block">{value}</strong><span className="text-xs font-black">{label}</span></div>; }
