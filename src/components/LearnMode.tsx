import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, Award, BookOpen, Brain, Check, Eraser, EyeOff, Grid2X2, PenTool, RotateCcw, Search, Sparkles, X } from 'lucide-react';
import { motion } from 'motion/react';
import { getStroke } from 'perfect-freehand';
import { SavedSentence, Word } from '../types';
import JamoPractice from './JamoPractice';
import { MISTAKE_PATTERNS, PERSONAL_VOCABULARY, WEEKLY_PRACTICE, type PersonalVocabItem } from '../data/personalLearning';

interface Props {
  vocab: { subjects: Word[]; objects: Word[]; verbs: Word[] };
  savedPhrases?: SavedSentence[];
  onExit: () => void;
}

interface Stats {
  id: string;
  repetition: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: number;
  score?: number;
  lastReviewed?: number;
}

type LearnType = 'words' | 'sentences' | 'personal';
type PracticeMode = 'cards' | 'write' | 'mixed';
type Rating = 0 | 1 | 2;
type StudyItem = Word | SavedSentence | PersonalVocabItem;

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

function migrate(raw: Record<string, Stats>) {
  const result: Record<string, Stats> = {};
  Object.entries(raw).forEach(([key, stat]) => {
    result[key] = stat.score !== undefined && stat.repetition === undefined
      ? { id: stat.id, repetition: stat.score >= 2 ? 3 : stat.score === 1 ? 1 : 0, interval: stat.score >= 2 ? 3 : 1, easeFactor: 2.5, nextReviewDate: stat.lastReviewed || Date.now() }
      : stat;
  });
  return result;
}

export default function LearnMode({ vocab, savedPhrases = [], onExit }: Props) {
  const words = [...vocab.subjects, ...vocab.objects, ...vocab.verbs];
  const sentences = savedPhrases;
  const [screen, setScreen] = useState<'home' | 'session' | 'summary' | 'jamo' | 'vocabulary' | 'mistakes' | 'lesson'>('home');
  const [learnType, setLearnType] = useState<LearnType>('words');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('write');
  const [sessionLength, setSessionLength] = useState(10);
  const [items, setItems] = useState<StudyItem[]>([]);
  const [index, setIndex] = useState(0);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [wordStats, setWordStats] = useState<Record<string, Stats>>({});
  const [sentenceStats, setSentenceStats] = useState<Record<string, Stats>>({});
  const [search, setSearch] = useState('');
  const [showSensitive, setShowSensitive] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [revealedExercises, setRevealedExercises] = useState<Record<string, boolean>>({});
  const [weeklyProgress, setWeeklyProgress] = useState<boolean[]>(() => {
    try { return JSON.parse(localStorage.getItem('korean_weekly_practice') || '[]'); } catch { return []; }
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBoxRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const lines = useRef<number[][][]>([]);
  const currentLine = useRef<number[][] | null>(null);

  useEffect(() => {
    try {
      const savedWords = localStorage.getItem('korean_learn_stats');
      const savedSentences = localStorage.getItem('korean_learn_sentence_stats');
      if (savedWords) setWordStats(migrate(JSON.parse(savedWords)));
      if (savedSentences) setSentenceStats(migrate(JSON.parse(savedSentences)));
    } catch (error) {
      console.error('Failed to load learning progress', error);
    }
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
    const visibleLines = currentLine.current?.length ? [...lines.current, currentLine.current] : lines.current;
    visibleLines.forEach((line) => {
      const stroke = getStroke(line, { size: 13, thinning: 0.6, smoothing: 0.5, streamline: 0.5, simulatePressure: false });
      if (stroke.length) context.fill(new Path2D(pathFromStroke(stroke)));
    });
  }, []);

  const clearCanvas = useCallback(() => {
    lines.current = [];
    currentLine.current = null;
    renderCanvas();
  }, [renderCanvas]);

  const undoStroke = () => {
    lines.current = lines.current.slice(0, -1);
    renderCanvas();
  };

  const writingCard = practiceMode === 'write' || (practiceMode === 'mixed' && index % 2 === 1);

  useEffect(() => {
    if (screen !== 'session' || !writingCard) return;
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
  }, [screen, writingCard, index, renderCanvas]);

  const beginStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    currentLine.current = [[event.clientX - rect.left, event.clientY - rect.top, event.pressure || 0.5]];
    drawing.current = true;
    renderCanvas();
  };
  const continueStroke = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !currentLine.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    currentLine.current.push([event.clientX - rect.left, event.clientY - rect.top, event.pressure || 0.5]);
    renderCanvas();
  };
  const endStroke = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentLine.current?.length) lines.current.push([...currentLine.current]);
    currentLine.current = null;
    renderCanvas();
  };

  const due = (pool: { id: string }[], stats: Record<string, Stats>) =>
    pool.filter((item) => !stats[item.id] || stats[item.id].nextReviewDate <= Date.now()).length;
  const mastered = (pool: { id: string }[], stats: Record<string, Stats>) =>
    pool.filter((item) => (stats[item.id]?.repetition || 0) >= 5).length;

  const startSession = (type: LearnType) => {
    const pool: StudyItem[] = type === 'words' ? words : type === 'sentences' ? sentences : PERSONAL_VOCABULARY.filter((item) => showSensitive || !item.sensitive);
    const stats = type === 'sentences' ? sentenceStats : wordStats;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const ordered = [
      ...shuffled.filter((item) => !stats[item.id] || stats[item.id].nextReviewDate <= Date.now()),
      ...shuffled.filter((item) => stats[item.id] && stats[item.id].nextReviewDate > Date.now()),
    ];
    if (!ordered.length) return;
    setLearnType(type);
    setItems(ordered.slice(0, Math.min(sessionLength, ordered.length)));
    setIndex(0);
    setRatings([]);
    setRevealed(false);
    clearCanvas();
    setScreen('session');
  };

  const rate = (rating: Rating) => {
    const item = items[index];
    const stats = learnType === 'sentences' ? sentenceStats : wordStats;
    const old = stats[item.id] || { id: item.id, repetition: 0, interval: 1, easeFactor: 2.5, nextReviewDate: Date.now() };
    const quality = rating === 0 ? 0 : rating === 1 ? 3 : 5;
    let repetition = old.repetition || 0;
    let interval = old.interval || 1;
    let easeFactor = old.easeFactor || 2.5;
    if (quality < 3) {
      repetition = 0;
      interval = 0.25;
    } else {
      interval = repetition === 0 ? 1 : repetition === 1 ? 6 : Math.round(interval * easeFactor);
      repetition = Math.min(5, repetition + 1);
    }
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    const updated = { ...stats, [item.id]: { id: item.id, repetition, interval, easeFactor, nextReviewDate: Date.now() + interval * 86400000 } };
    if (learnType !== 'sentences') {
      setWordStats(updated);
      localStorage.setItem('korean_learn_stats', JSON.stringify(updated));
    } else {
      setSentenceStats(updated);
      localStorage.setItem('korean_learn_sentence_stats', JSON.stringify(updated));
    }
    setRatings((previous) => [...previous, rating]);
    if (index + 1 === items.length) setScreen('summary');
    else {
      setIndex((value) => value + 1);
      setRevealed(false);
      clearCanvas();
    }
  };

  if (screen === 'jamo') return <JamoPractice onExit={() => setScreen('home')} />;

  if (screen === 'vocabulary') {
    const query = search.trim().toLowerCase();
    const visibleVocabulary = PERSONAL_VOCABULARY.filter((item) =>
      (showSensitive || !item.sensitive) && (!query || item.korean.includes(query) || item.english.toLowerCase().includes(query) || item.kind.includes(query))
    );
    return (
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-slate-950 border-[3px] border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-600">My vocabulary</p><h2 className="text-3xl sm:text-4xl font-black">100 words and phrases</h2></div><button onClick={() => setScreen('home')} className="min-h-11 px-4 flex items-center gap-2 border-2 border-black font-black text-xs"><ArrowLeft className="w-4 h-4" />Learn</button></div>
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 my-6">
          <label className="min-h-12 px-4 flex items-center gap-3 border-2 border-black"><Search className="w-5 h-5" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Korean, English, or type" className="w-full bg-transparent outline-none font-bold" /></label>
          <button onClick={() => setShowSensitive((value) => !value)} className={`min-h-12 px-4 border-2 border-black font-black text-sm flex items-center justify-center gap-2 ${showSensitive ? 'bg-rose-100' : 'bg-slate-100'}`}><EyeOff className="w-4 h-4" />Sensitive {showSensitive ? 'shown' : 'hidden'}</button>
          <button onClick={() => startSession('personal')} className="min-h-12 px-5 bg-indigo-600 text-white border-2 border-black font-black">Practise deck</button>
        </div>
        <p className="mb-3 text-sm font-bold text-slate-500">Showing {visibleVocabulary.length} entries. Labels distinguish complete sentences from phrases and fragments.</p>
        <div className="grid sm:grid-cols-2 gap-3 max-h-[62vh] overflow-y-auto pr-1">
          {visibleVocabulary.map((item) => <div key={item.id} className="p-4 border-2 border-black bg-slate-50 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><strong className="text-xl">{item.korean}</strong><span className="px-2 py-1 bg-indigo-100 text-indigo-900 text-[10px] uppercase font-black">{item.kind}</span></div><p className="mt-2 font-semibold text-slate-600 dark:text-slate-300">{item.english}</p>{item.sensitive && <p className="mt-2 text-xs font-black text-rose-600">Strong profanity</p>}</div>)}
          {!visibleVocabulary.length && <p className="sm:col-span-2 p-8 text-center font-bold text-slate-500 border-2 border-dashed border-slate-300">No matching entries.</p>}
        </div>
      </div>
    );
  }

  if (screen === 'mistakes') {
    const completed = weeklyProgress.filter(Boolean).length;
    return (
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-slate-950 border-[3px] border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-violet-600">Mistake Coach</p><h2 className="text-3xl sm:text-4xl font-black">Turn patterns into progress</h2></div><button onClick={() => setScreen('home')} className="min-h-11 px-4 flex items-center gap-2 border-2 border-black font-black text-xs"><ArrowLeft className="w-4 h-4" />Learn</button></div>
        <p className="mt-3 mb-6 font-semibold text-slate-500">Work on the recurring cause instead of memorizing each correction separately.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {MISTAKE_PATTERNS.map((pattern, index) => <button key={pattern.id} onClick={() => { setSelectedPattern(index); setScreen('lesson'); }} className="text-left p-5 border-[3px] border-black bg-violet-50 hover:-translate-y-0.5 transition-transform"><span className="text-xs font-black text-violet-600">PATTERN {index + 1}</span><strong className="block text-xl mt-1">{pattern.title}</strong><span className="block mt-2 text-sm font-semibold text-slate-600">{pattern.summary}</span></button>)}
        </div>
        <div className="mt-7 p-5 border-[3px] border-black bg-amber-50 text-black"><div className="flex justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider">Weekly plan</p><h3 className="text-2xl font-black">{completed}/7 complete</h3></div><button onClick={() => { setWeeklyProgress([]); localStorage.removeItem('korean_weekly_practice'); }} className="text-xs font-black underline">Reset week</button></div><div className="grid md:grid-cols-2 gap-2 mt-4">{WEEKLY_PRACTICE.map((task, index) => <button key={task} onClick={() => { const next = WEEKLY_PRACTICE.map((_, itemIndex) => itemIndex === index ? !weeklyProgress[itemIndex] : Boolean(weeklyProgress[itemIndex])); setWeeklyProgress(next); localStorage.setItem('korean_weekly_practice', JSON.stringify(next)); }} className={`text-left p-3 border-2 border-black font-bold text-sm flex gap-3 ${weeklyProgress[index] ? 'bg-emerald-200' : 'bg-white'}`}><span className="w-6 h-6 shrink-0 border-2 border-black grid place-items-center">{weeklyProgress[index] && <Check className="w-4 h-4" />}</span><span><small className="block font-black">DAY {index + 1}</small>{task}</span></button>)}</div></div>
      </div>
    );
  }

  if (screen === 'lesson') {
    const pattern = MISTAKE_PATTERNS[selectedPattern];
    return (
      <div className="w-full max-w-3xl mx-auto bg-white dark:bg-slate-950 border-[3px] border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] p-5 sm:p-8">
        <button onClick={() => setScreen('mistakes')} className="min-h-11 px-4 flex items-center gap-2 border-2 border-black font-black text-xs mb-6"><ArrowLeft className="w-4 h-4" />All patterns</button>
        <p className="text-xs font-black uppercase tracking-[.2em] text-violet-600">Pattern {selectedPattern + 1} of {MISTAKE_PATTERNS.length}</p><h2 className="text-4xl font-black mt-1">{pattern.title}</h2><p className="mt-4 text-lg font-semibold text-slate-600 dark:text-slate-300">{pattern.summary}</p>
        <div className="my-6 p-5 bg-violet-50 text-black border-2 border-black"><h3 className="font-black uppercase text-xs tracking-wider mb-3">Notice</h3>{pattern.examples.map((example) => <p key={example} className="font-bold mt-2">• {example}</p>)}</div>
        <div className="p-5 bg-emerald-100 text-black border-2 border-black"><h3 className="font-black uppercase text-xs tracking-wider">Practice method</h3><p className="font-bold mt-2">{pattern.practice}</p></div>
        <h3 className="text-2xl font-black mt-8 mb-3">Quick check</h3><div className="space-y-3">{pattern.exercises.map((exercise, index) => { const key = `${pattern.id}-${index}`; return <div key={key} className="p-4 border-2 border-black"><strong>{exercise.prompt}</strong><p className="text-sm text-slate-500 font-semibold mt-1">{exercise.hint}</p>{revealedExercises[key] ? <p className="mt-3 p-3 bg-emerald-100 text-black font-black">{exercise.answer}</p> : <button onClick={() => setRevealedExercises((value) => ({ ...value, [key]: true }))} className="mt-3 min-h-10 px-4 bg-black text-white font-black text-sm">Reveal answer</button>}</div>; })}</div>
        <div className="grid grid-cols-2 gap-3 mt-7"><button disabled={selectedPattern === 0} onClick={() => setSelectedPattern((value) => value - 1)} className="min-h-12 border-2 border-black font-black disabled:opacity-30">Previous</button><button disabled={selectedPattern === MISTAKE_PATTERNS.length - 1} onClick={() => setSelectedPattern((value) => value + 1)} className="min-h-12 bg-violet-600 text-white border-2 border-black font-black disabled:opacity-30">Next pattern</button></div>
      </div>
    );
  }

  if (screen === 'home') {
    const visiblePersonal = PERSONAL_VOCABULARY.filter((item) => showSensitive || !item.sensitive);
    const allItems = words.length + sentences.length + visiblePersonal.length;
    const allMastered = mastered(words, wordStats) + mastered(sentences, sentenceStats) + mastered(visiblePersonal, wordStats);
    return (
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-slate-950 border-[3px] border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4 mb-2"><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-600">Learn</p><button onClick={onExit} className="min-h-11 px-4 flex items-center gap-2 border-2 border-black bg-white font-black text-xs"><ArrowLeft className="w-4 h-4" />Builder</button></div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight">What do you want to practise?</h2>
        <p className="text-slate-500 font-semibold mt-2 mb-7">Write each answer with your stylus, then check it and rate your recall.</p>
        <div className="grid md:grid-cols-2 gap-4 mb-7">
          <button onClick={() => startSession('words')} className="min-h-44 text-left p-6 bg-indigo-600 text-white border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
            <PenTool className="w-9 h-9 mb-5" /><strong className="block text-2xl">Write words</strong><span className="block mt-2 font-bold text-indigo-100">{words.length} words · {due(words, wordStats)} due</span>
          </button>
          <button disabled={!sentences.length} onClick={() => startSession('sentences')} className="min-h-44 text-left p-6 bg-amber-300 disabled:bg-slate-200 disabled:text-slate-400 border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] disabled:shadow-none hover:enabled:-translate-y-1 transition-transform">
            <Sparkles className="w-9 h-9 mb-5" /><strong className="block text-2xl">Write sentences</strong><span className="block mt-2 font-bold">{sentences.length ? `${sentences.length} saved · ${due(sentences, sentenceStats)} due` : 'Save a sentence in Build mode first'}</span>
          </button>
          <button onClick={() => setScreen('vocabulary')} className="min-h-44 text-left p-6 bg-sky-200 text-black border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
            <BookOpen className="w-9 h-9 mb-5" /><strong className="block text-2xl">My vocabulary</strong><span className="block mt-2 font-bold text-sky-950">100 personal entries · browse or practise</span>
          </button>
          <button onClick={() => setScreen('mistakes')} className="min-h-44 text-left p-6 bg-violet-200 text-black border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
            <Brain className="w-9 h-9 mb-5" /><strong className="block text-2xl">Mistake Coach</strong><span className="block mt-2 font-bold text-violet-950">8 patterns · exercises · weekly plan</span>
          </button>
          <button onClick={() => setScreen('jamo')} className="md:col-span-2 min-h-40 text-left p-6 bg-emerald-200 border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
            <Grid2X2 className="w-9 h-9 mb-4" /><strong className="block text-2xl">Build Hangul blocks</strong><span className="block mt-2 font-bold text-emerald-900">24 practice blocks · all six layouts · stylus ready</span>
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 p-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800">
          <OptionGroup label="Practice style" values={[['write', 'Stylus'], ['mixed', 'Mixed'], ['cards', 'Flashcards']]} selected={practiceMode} onSelect={(value) => setPracticeMode(value as PracticeMode)} />
          <OptionGroup label="Session length" values={[[5, '5'], [10, '10'], [15, '15']]} selected={sessionLength} onSelect={(value) => setSessionLength(Number(value))} />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-5 text-center">
          <Stat value={due(words, wordStats) + due(sentences, sentenceStats) + due(visiblePersonal, wordStats)} label="Due now" />
          <Stat value={allItems - allMastered} label="Learning" />
          <Stat value={allMastered} label="Mastered" />
        </div>
      </div>
    );
  }

  if (screen === 'summary') {
    return (
      <div className="w-full max-w-3xl mx-auto min-h-[620px] bg-white dark:bg-slate-950 border-[3px] border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] p-6 flex flex-col items-center justify-center text-center">
        <Award className="w-20 h-20 text-amber-500 mb-5" /><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-600">Session complete</p><h2 className="text-5xl font-black mt-2">Nice work.</h2>
        <p className="text-slate-500 font-bold mt-3">You reviewed {ratings.length} {learnType}.</p>
        <div className="grid grid-cols-3 gap-3 w-full max-w-xl my-9">
          <Result value={ratings.filter((x) => x === 0).length} label="Again" color="bg-rose-100" /><Result value={ratings.filter((x) => x === 1).length} label="Hard" color="bg-amber-100" /><Result value={ratings.filter((x) => x === 2).length} label="Good" color="bg-emerald-100" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 w-full max-w-xl"><button onClick={() => startSession(learnType)} className="min-h-14 bg-indigo-600 text-white border-[3px] border-black font-black text-lg">Continue</button><button onClick={() => setScreen('home')} className="min-h-14 bg-white dark:bg-slate-900 border-[3px] border-black font-black text-lg">Finish</button></div>
      </div>
    );
  }

  const item = items[index];
  const isWord = 'type' in item;
  const isPersonal = 'kind' in item;
  const korean = item.korean;
  const english = item.english;
  const emoji = isWord ? (item as Word).emoji : isPersonal ? '✍️' : (item as SavedSentence).emojis;
  return (
    <div className="w-full min-h-[100dvh] h-[100dvh] bg-white flex flex-col overflow-hidden select-none">
      <header className="flex items-center gap-3 px-2 py-2 border-b border-slate-200"><button onClick={() => setScreen('home')} className="w-10 h-10 shrink-0 grid place-items-center border-2 border-black" aria-label="Exit session"><X className="w-4 h-4" /></button><div className="flex-1 h-2 bg-slate-200 overflow-hidden"><div className="h-full bg-indigo-600" style={{ width: `${((index + 1) / items.length) * 100}%` }} /></div><strong className="text-xs tabular-nums">{index + 1}/{items.length}</strong></header>
      <main className="flex-1 min-h-0 flex flex-col p-2 sm:p-3 gap-2">
        <div className="flex items-center justify-between gap-3 px-1"><span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-600">{writingCard ? (revealed ? 'Trace the answer' : 'Write in Korean') : 'Recall the Korean'}</span><h2 className={`${learnType === 'sentences' ? 'text-lg sm:text-2xl' : 'text-2xl sm:text-3xl'} font-black text-right truncate`}>{english}</h2></div>
        {writingCard ? (
          <div ref={canvasBoxRef} className="relative flex-1 min-h-0 bg-white border-[3px] border-black overflow-hidden">
            <div className="absolute inset-0 grid place-items-center pointer-events-none text-slate-200 dark:text-slate-800"><PenTool className="w-24 h-24" /></div>
            {revealed && <Answer korean={korean} emoji={emoji} sentence={learnType === 'sentences'} overlay />}
            <canvas ref={canvasRef} onPointerDown={beginStroke} onPointerMove={continueStroke} onPointerUp={endStroke} onPointerCancel={endStroke} className="absolute inset-0 z-10 w-full h-full touch-none cursor-crosshair" />
            <div className="absolute z-20 top-3 right-3 flex gap-2">
              {!revealed && <button onClick={() => setRevealed(true)} className="h-12 min-w-36 px-5 bg-indigo-600 text-white border-2 border-black font-black text-sm shadow-[3px_3px_0_0_rgba(0,0,0,1)]">Reveal answer</button>}
              <button onClick={undoStroke} className="h-12 px-3 bg-white dark:bg-slate-950 border-2 border-black flex items-center gap-2 font-black text-xs"><RotateCcw className="w-4 h-4" />Undo</button>
              <button onClick={clearCanvas} className="h-12 px-3 bg-white dark:bg-slate-950 border-2 border-black flex items-center gap-2 font-black text-xs"><Eraser className="w-4 h-4" />Clear</button>
            </div>
          </div>
        ) : <div className="flex-1 min-h-64 grid place-items-center bg-slate-50 dark:bg-slate-900 border-[3px] border-black p-6 text-center">{revealed ? <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}><Answer korean={korean} emoji={emoji} sentence={learnType === 'sentences'} /></motion.div> : <span className="text-slate-400 font-bold">Think of the answer, then reveal it.</span>}</div>}
        {!revealed ? (!writingCard && <button onClick={() => setRevealed(true)} className="w-full min-h-14 bg-indigo-600 text-white border-[3px] border-black font-black text-lg">Reveal answer</button>) : <div className="grid grid-cols-3 gap-2"><RatingButton label="Again" hint="Later today" color="bg-rose-100" onClick={() => rate(0)} /><RatingButton label="Hard" hint="Tomorrow" color="bg-amber-100" onClick={() => rate(1)} /><RatingButton label="Good" hint="Several days" color="bg-emerald-100" onClick={() => rate(2)} /></div>}
      </main>
    </div>
  );
}

function OptionGroup({ label, values, selected, onSelect }: { label: string; values: readonly (readonly [string | number, string])[]; selected: string | number; onSelect: (value: string | number) => void }) {
  return <div><span className="block text-xs font-black uppercase tracking-wider mb-3">{label}</span><div className="grid grid-cols-3 gap-2">{values.map(([value, text]) => <button key={value} onClick={() => onSelect(value)} className={`min-h-12 px-2 border-2 border-black font-black text-xs ${selected === value ? 'bg-black text-white' : 'bg-white dark:bg-slate-950'}`}>{text}</button>)}</div></div>;
}
function Stat({ value, label }: { value: number; label: string }) { return <div className="p-3"><strong className="block text-2xl">{value}</strong><span className="text-xs font-bold text-slate-500">{label}</span></div>; }
function Result({ value, label, color }: { value: number; label: string; color: string }) { return <div className={`p-5 ${color} text-black border-2 border-black`}><strong className="text-3xl block">{value}</strong><span className="text-xs font-black">{label}</span></div>; }
function Answer({ korean, emoji, sentence, overlay = false }: { korean: string; emoji: string; sentence: boolean; overlay?: boolean }) { return <div className={`${overlay ? 'absolute inset-0 z-0 pointer-events-none bg-white/95 text-slate-300 dark:bg-slate-950/95 dark:text-slate-700' : ''} grid place-items-center p-6 text-center`}><div><div className={`${sentence ? 'text-4xl sm:text-6xl' : 'text-7xl sm:text-9xl'} font-black break-words`}>{korean}</div><div className={`text-4xl mt-5 ${overlay ? 'opacity-45' : ''}`}>{emoji}</div></div></div>; }
function RatingButton({ label, hint, color, onClick }: { label: string; hint: string; color: string; onClick: () => void }) { return <button onClick={onClick} className={`min-h-16 p-1.5 ${color} text-black border-[3px] border-black font-black`}><span className="block text-sm sm:text-lg">{label}</span><small className="text-[9px] sm:text-xs">{hint}</small></button>; }
