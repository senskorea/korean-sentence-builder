import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowLeft, ArrowUpDown, Award, BookOpen, Brain, Check, Clock3, Eraser, EyeOff, Grid2X2, PenTool, RotateCcw, Search, Sparkles, StickyNote, Tag, X } from 'lucide-react';
import { motion } from 'motion/react';
import { getStroke } from 'perfect-freehand';
import { SavedSentence, Word } from '../types';
import { PERSONAL_VOCABULARY, type PersonalVocabItem } from '../data/personalLearning';

interface Props {
  vocab: { subjects: Word[]; objects: Word[]; verbs: Word[] };
  savedPhrases?: SavedSentence[];
  onExit?: () => void;
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

interface PersonalMasteryState {
  activeIds: string[];
  goodStreaks: Record<string, number>;
  learnedIds: string[];
}

type LearnType = 'words' | 'sentences' | 'personal';
type PracticeMode = 'cards' | 'write' | 'mixed';
type Rating = 0 | 1 | 2;
type StudyItem = Word | SavedSentence | PersonalVocabItem;
export type VocabSortOption = 'newest' | 'oldest' | 'alphabetical' | 'random';

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

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function LearnMode({ vocab, savedPhrases = [], onExit }: Props) {
  const words = [...vocab.subjects, ...vocab.objects, ...vocab.verbs];
  const sentences = savedPhrases;
  const [screen, setScreen] = useState<'vocabulary' | 'session' | 'summary'>('vocabulary');
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
  const [selectedTag, setSelectedTag] = useState<string | null>('latest');
  const [vocabSort, setVocabSort] = useState<VocabSortOption>(() => {
    try {
      const saved = localStorage.getItem('korean_vocab_sort') as VocabSortOption;
      return ['newest', 'oldest', 'alphabetical', 'random'].includes(saved) ? saved : 'newest';
    } catch {
      return 'newest';
    }
  });

  const handleSortChange = (option: VocabSortOption) => {
    setVocabSort(option);
    try {
      localStorage.setItem('korean_vocab_sort', option);
    } catch (e) {
      console.error(e);
    }
  };
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
  const [showSensitive, setShowSensitive] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem('korean_flashcard_notes') || '{}'); } catch { return {}; }
  });
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [personalMastery, setPersonalMastery] = useState<PersonalMasteryState>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('korean_personal_mastery') || '{}');
      return { activeIds: saved.activeIds || [], goodStreaks: saved.goodStreaks || {}, learnedIds: saved.learnedIds || [] };
    } catch {
      return { activeIds: [], goodStreaks: {}, learnedIds: [] };
    }
  });
  const [sessionBatchSize, setSessionBatchSize] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBoxRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const renderFrame = useRef<number | null>(null);
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

  useEffect(() => {
    if (screen !== 'session') return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') setElapsedSeconds((value) => value + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [screen]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { desynchronized: true });
    if (!canvas || !context) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(canvas.width / rect.width, canvas.height / rect.height);
    context.fillStyle = '#4f46e5';

    const visibleLines = currentLine.current?.length ? [...lines.current, currentLine.current] : lines.current;
    visibleLines.forEach((line) => {
      if (!line.length) return;
      // Dot and micro-tap detection for short Korean vowel marks (ㅏ, ㅓ, ㅗ, ㅜ)
      if (line.length === 1 || (line.length === 2 && Math.hypot(line[0][0] - line[1][0], line[0][1] - line[1][1]) < 2.5)) {
        const [x, y] = line[0];
        const pressure = line[0][2] || 0.5;
        const radius = Math.max(4, pressure * 7);
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        return;
      }

      const stroke = getStroke(line, {
        size: 11,
        thinning: 0.25,
        smoothing: 0.35,
        streamline: 0.10,
        simulatePressure: false,
        start: { cap: true, taper: 0 },
        end: { cap: true, taper: 0 },
      });

      if (stroke.length) {
        context.fill(new Path2D(pathFromStroke(stroke)));
      } else {
        const [x, y] = line[0];
        context.beginPath();
        context.arc(x, y, 4.5, 0, Math.PI * 2);
        context.fill();
      }
    });
  }, []);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const box = canvasBoxRef.current;
    if (!canvas || !box || drawing.current) return;
    const rect = box.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 3);
    const width = Math.round(rect.width * ratio);
    const height = Math.round(rect.height * ratio);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    renderCanvas();
  }, [renderCanvas]);

  const requestCanvasRender = useCallback(() => {
    if (renderFrame.current !== null) return;
    renderFrame.current = window.requestAnimationFrame(() => {
      renderFrame.current = null;
      renderCanvas();
    });
  }, [renderCanvas]);

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
    const box = canvasBoxRef.current;
    const observer = new ResizeObserver(syncCanvasSize);
    if (box) observer.observe(box);
    const viewport = window.visualViewport;
    const frame = window.requestAnimationFrame(syncCanvasSize);
    window.addEventListener('resize', syncCanvasSize);
    viewport?.addEventListener('resize', syncCanvasSize);
    viewport?.addEventListener('scroll', syncCanvasSize);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', syncCanvasSize);
      viewport?.removeEventListener('resize', syncCanvasSize);
      viewport?.removeEventListener('scroll', syncCanvasSize);
    };
  }, [screen, writingCard, index, syncCanvasSize]);

  const appendPointerSamples = useCallback((event: PointerEvent, includeEndpoint = true) => {
    if (!currentLine.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const coalesced = event.getCoalescedEvents?.() || [];
    const samples = includeEndpoint ? [...coalesced, event] : coalesced;

    samples.forEach((sample) => {
      const previous = currentLine.current?.[currentLine.current.length - 1];
      const pressure = sample.pointerType === 'pen' && sample.pressure > 0 ? sample.pressure : 0.5;
      const next = [sample.clientX - rect.left, sample.clientY - rect.top, pressure];

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

      const steps = Math.max(1, Math.ceil(distance / 3));
      for (let step = 1; step <= steps; step += 1) {
        const amount = step / steps;
        currentLine.current?.push([
          previous[0] + dx * amount,
          previous[1] + dy * amount,
          previous[2] + (next[2] - previous[2]) * amount,
        ]);
      }
    });
  }, []);

  const beginStroke = useCallback((event: PointerEvent) => {
    if (stylusOnly && event.pointerType === 'touch') {
      return;
    }

    // PALM REJECTION & PEN PREEMPTION:
    // If a touch was active (resting palm), but now Apple Pencil touches down,
    // Apple Pencil takes absolute priority and overrides the palm touch!
    if (event.pointerType === 'pen' && activePointerType.current === 'touch') {
      currentLine.current = null;
      activePointerId.current = null;
      activePointerType.current = null;
    }

    if (activePointerId.current !== null && activePointerId.current !== event.pointerId) {
      return;
    }

    // Reject broad palm contacts in hybrid mode
    if (event.pointerType === 'touch' && (event.width > 24 || event.height > 24)) {
      return;
    }

    event.preventDefault();
    activePointerId.current = event.pointerId;
    activePointerType.current = event.pointerType as 'pen' | 'touch' | 'mouse';

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pressure = event.pointerType === 'pen' && event.pressure > 0 ? event.pressure : 0.5;

    currentLine.current = [[event.clientX - rect.left, event.clientY - rect.top, pressure]];
    drawing.current = true;
    requestCanvasRender();
  }, [stylusOnly, requestCanvasRender]);

  const continueStroke = useCallback((event: PointerEvent) => {
    if (!drawing.current || !currentLine.current || activePointerId.current !== event.pointerId) {
      return;
    }
    event.preventDefault();
    appendPointerSamples(event);
    requestCanvasRender();
  }, [appendPointerSamples, requestCanvasRender]);

  const endStroke = useCallback((event: PointerEvent) => {
    if (!drawing.current || activePointerId.current !== event.pointerId) {
      return;
    }
    event.preventDefault();
    appendPointerSamples(event, event.type !== 'pointercancel');

    drawing.current = false;
    activePointerId.current = null;
    activePointerType.current = null;

    if (currentLine.current?.length) {
      lines.current.push([...currentLine.current]);
    }
    currentLine.current = null;

    if (renderFrame.current !== null) {
      window.cancelAnimationFrame(renderFrame.current);
      renderFrame.current = null;
    }
    renderCanvas();
  }, [appendPointerSamples, renderCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !writingCard || screen !== 'session') return;

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
  }, [writingCard, screen, beginStroke, continueStroke, endStroke]);

  const due = (pool: { id: string }[], stats: Record<string, Stats>) =>
    pool.filter((item) => !stats[item.id] || stats[item.id].nextReviewDate <= Date.now()).length;
  const mastered = (pool: { id: string }[], stats: Record<string, Stats>) =>
    pool.filter((item) => (stats[item.id]?.repetition || 0) >= 5).length;

  const savePersonalMastery = (next: PersonalMasteryState) => {
    setPersonalMastery(next);
    localStorage.setItem('korean_personal_mastery', JSON.stringify(next));
  };

  const latestDate = useMemo(() => {
    const dates = PERSONAL_VOCABULARY.map((i) => i.dateAdded).filter(Boolean) as string[];
    if (!dates.length) return null;
    return [...dates].sort().reverse()[0];
  }, []);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PERSONAL_VOCABULARY.forEach((item) => {
      if (!showSensitive && item.sensitive) return;
      item.tags.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [showSensitive]);

  const availableTags = useMemo(() => {
    const priority = ['classwork', 'sogang1a', 'place', 'counter', 'number', 'stationery', 'item', 'beverage', 'clothing', 'country', 'occupation', 'expression', 'foundation'];
    return Object.keys(tagCounts).sort((a, b) => {
      const aPri = priority.indexOf(a);
      const bPri = priority.indexOf(b);
      if (aPri !== -1 && bPri !== -1) return aPri - bPri;
      if (aPri !== -1) return -1;
      if (bPri !== -1) return 1;
      return tagCounts[b] - tagCounts[a];
    });
  }, [tagCounts]);

  const latestCount = useMemo(() => {
    if (!latestDate) return 0;
    return PERSONAL_VOCABULARY.filter((i) => i.dateAdded === latestDate && (showSensitive || !i.sensitive)).length;
  }, [latestDate, showSensitive]);

  const totalVocabCount = useMemo(() => {
    return PERSONAL_VOCABULARY.filter((i) => showSensitive || !i.sensitive).length;
  }, [showSensitive]);

  const visibleVocabulary = useMemo(() => {
    const query = search.trim().toLowerCase();
    return PERSONAL_VOCABULARY.filter((item) => {
      if (!showSensitive && item.sensitive) return false;
      if (selectedTag) {
        if (selectedTag === "latest") {
          if (item.dateAdded !== latestDate) return false;
        } else if (!item.tags.includes(selectedTag)) {
          return false;
        }
      }
      if (query) {
        const clean = query.replace(/^#/, "");
        const matchesKorean = item.korean.includes(query);
        const matchesEnglish = item.english.toLowerCase().includes(query);
        const matchesTag = item.tags.some((t) => t.toLowerCase().includes(clean));
        const matchesDate = item.dateAdded ? item.dateAdded.includes(query) : false;
        return matchesKorean || matchesEnglish || matchesTag || matchesDate;
      }
      return true;
    });
  }, [search, showSensitive, selectedTag, latestDate]);

  const sortedVocabulary = useMemo(() => {
    const list = [...visibleVocabulary];
    if (vocabSort === "newest") {
      return list.sort((a, b) => {
        const dateDiff = (b.dateAdded || "").localeCompare(a.dateAdded || "");
        if (dateDiff !== 0) return dateDiff;
        return a.korean.localeCompare(b.korean, "ko");
      });
    }
    if (vocabSort === "oldest") {
      return list.sort((a, b) => {
        const dateDiff = (a.dateAdded || "").localeCompare(b.dateAdded || "");
        if (dateDiff !== 0) return dateDiff;
        return a.korean.localeCompare(b.korean, "ko");
      });
    }
    if (vocabSort === "alphabetical") {
      return list.sort((a, b) => a.korean.localeCompare(b.korean, "ko"));
    }
    return list;
  }, [visibleVocabulary, vocabSort]);

  const isFiltered = Boolean(selectedTag || search.trim());

  const startFilteredSession = (filteredPool: PersonalVocabItem[]) => {
    if (!filteredPool.length) return;
    let ordered: PersonalVocabItem[];
    if (vocabSort === 'newest') {
      ordered = [...filteredPool].sort((a, b) => {
        const dateCmp = (b.dateAdded || '').localeCompare(a.dateAdded || '');
        if (dateCmp !== 0) return dateCmp;
        return a.korean.localeCompare(b.korean, 'ko');
      });
    } else if (vocabSort === 'oldest') {
      ordered = [...filteredPool].sort((a, b) => {
        const dateCmp = (a.dateAdded || '').localeCompare(b.dateAdded || '');
        if (dateCmp !== 0) return dateCmp;
        return a.korean.localeCompare(b.korean, 'ko');
      });
    } else if (vocabSort === 'alphabetical') {
      ordered = [...filteredPool].sort((a, b) => a.korean.localeCompare(b.korean, 'ko'));
    } else {
      ordered = [...filteredPool].sort(() => Math.random() - 0.5);
    }
    setLearnType('personal');
    setItems(ordered.slice(0, Math.min(sessionLength, ordered.length)));
    setSessionBatchSize(0);
    setElapsedSeconds(0);
    setIndex(0);
    setRatings([]);
    setRevealed(false);
    setNoteOpen(false);
    clearCanvas();
    setScreen('session');
  };

  const startSession = (type: LearnType) => {
    const pool: StudyItem[] = type === 'words' ? words : type === 'sentences' ? sentences : PERSONAL_VOCABULARY.filter((item) => showSensitive || !item.sensitive);
    const stats = type === 'sentences' ? sentenceStats : wordStats;
    if (type === 'personal') {
      const personalPool = pool as PersonalVocabItem[];
      const availableIds = new Set(personalPool.map((item) => item.id));
      const learnedIds = personalMastery.learnedIds.filter((id) => availableIds.has(id));
      let activeIds = personalMastery.activeIds.filter((id) => availableIds.has(id) && !learnedIds.includes(id));
      if (!activeIds.length) {
        const prioritized = [...personalPool].sort((a, b) => {
          if (vocabSort === 'newest') {
            const dateCmp = (b.dateAdded || '').localeCompare(a.dateAdded || '');
            if (dateCmp !== 0) return dateCmp;
            return a.korean.localeCompare(b.korean, 'ko');
          }
          if (vocabSort === 'oldest') {
            const dateCmp = (a.dateAdded || '').localeCompare(b.dateAdded || '');
            if (dateCmp !== 0) return dateCmp;
            return a.korean.localeCompare(b.korean, 'ko');
          }
          if (vocabSort === 'alphabetical') {
            return a.korean.localeCompare(b.korean, 'ko');
          }
          return Math.random() - 0.5;
        });
        activeIds = prioritized.filter((item) => !learnedIds.includes(item.id)).slice(0, sessionLength).map((item) => item.id);
      }
      const nextMastery = { ...personalMastery, activeIds, learnedIds };
      savePersonalMastery(nextMastery);
      const dueReviews = personalPool
        .filter((item) => learnedIds.includes(item.id) && (!stats[item.id] || stats[item.id].nextReviewDate <= Date.now()))
        .sort((a, b) => (stats[a.id]?.nextReviewDate || 0) - (stats[b.id]?.nextReviewDate || 0));
      const activeCards = activeIds
        .filter((id) => (nextMastery.goodStreaks[id] || 0) < 2)
        .map((id) => personalPool.find((item) => item.id === id))
        .filter((item): item is PersonalVocabItem => Boolean(item))
        .sort((a, b) => {
          if (vocabSort === 'newest') {
            return (b.dateAdded || '').localeCompare(a.dateAdded || '');
          }
          if (vocabSort === 'oldest') {
            return (a.dateAdded || '').localeCompare(b.dateAdded || '');
          }
          if (vocabSort === 'alphabetical') {
            return a.korean.localeCompare(b.korean, 'ko');
          }
          return 0;
        });
      const masteryQueue = [...dueReviews, ...activeCards];
      if (!masteryQueue.length) return;
      setLearnType(type);
      setItems(masteryQueue);
      setSessionBatchSize(activeIds.length);
      setElapsedSeconds(0);
      setIndex(0);
      setRatings([]);
      setRevealed(false);
      setNoteOpen(false);
      clearCanvas();
      setScreen('session');
      return;
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const ordered = [
      ...shuffled.filter((item) => !stats[item.id] || stats[item.id].nextReviewDate <= Date.now()),
      ...shuffled.filter((item) => stats[item.id] && stats[item.id].nextReviewDate > Date.now()),
    ];
    if (!ordered.length) return;
    setLearnType(type);
    setItems(ordered.slice(0, Math.min(sessionLength, ordered.length)));
    setSessionBatchSize(0);
    setElapsedSeconds(0);
    setIndex(0);
    setRatings([]);
    setRevealed(false);
    setNoteOpen(false);
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
    let updated = { ...stats, [item.id]: { id: item.id, repetition, interval, easeFactor, nextReviewDate: Date.now() + interval * 86400000 } };
    let nextItems = [...items];
    if (learnType === 'personal') {
      const isActiveCard = personalMastery.activeIds.includes(item.id) && !personalMastery.learnedIds.includes(item.id);
      let nextMastery: PersonalMasteryState = { ...personalMastery, goodStreaks: { ...personalMastery.goodStreaks }, learnedIds: [...personalMastery.learnedIds] };
      let retryAfter: number | null = null;
      if (isActiveCard) {
        if (rating === 2) {
          const streak = (nextMastery.goodStreaks[item.id] || 0) + 1;
          nextMastery.goodStreaks[item.id] = streak;
          if (streak >= 2) {
            nextMastery.learnedIds = [...new Set([...nextMastery.learnedIds, item.id])];
            updated = { ...stats, [item.id]: { id: item.id, repetition: 1, interval: 1, easeFactor: 2.5, nextReviewDate: Date.now() + 86400000 } };
          } else retryAfter = 5;
        } else {
          if (rating === 0) nextMastery.goodStreaks[item.id] = 0;
          retryAfter = rating === 0 ? 2 : 4;
          updated = stats;
        }
        const batchComplete = nextMastery.activeIds.every((id) => nextMastery.learnedIds.includes(id));
        if (batchComplete) nextMastery = { ...nextMastery, activeIds: [] };
      } else if (rating !== 2) {
        retryAfter = rating === 0 ? 2 : 4;
      }
      if (retryAfter !== null) {
        const insertAt = Math.min(index + 1 + retryAfter, nextItems.length);
        nextItems.splice(insertAt, 0, item);
      }
      savePersonalMastery(nextMastery);
      setItems(nextItems);
    }
    if (learnType !== 'sentences') {
      setWordStats(updated);
      localStorage.setItem('korean_learn_stats', JSON.stringify(updated));
    } else {
      setSentenceStats(updated);
      localStorage.setItem('korean_learn_sentence_stats', JSON.stringify(updated));
    }
    setRatings((previous) => [...previous, rating]);
    setNoteOpen(false);
    if (index + 1 === nextItems.length) setScreen('summary');
    else {
      setIndex((value) => value + 1);
      setRevealed(false);
      clearCanvas();
    }
  };


  if (screen === 'vocabulary') {
    return (
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-slate-950 border-[3px] border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-indigo-600">My vocabulary</p>
            <h2 className="text-3xl sm:text-4xl font-black">{PERSONAL_VOCABULARY.length} words and expressions</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border-2 border-black text-xs font-bold">
              <span className="text-slate-500">Mastered: </span>
              <span className="font-black text-emerald-600">{personalMastery.learnedIds.length}</span>
              <span className="text-slate-400"> / {PERSONAL_VOCABULARY.length}</span>
            </div>
          </div>
        </div>

        {/* Search & Actions Toolbar */}
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 mt-6 mb-3">
          <label className="min-h-12 px-4 flex items-center gap-3 border-2 border-black">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Korean, English, date, or #tag"
              className="w-full bg-transparent outline-none font-bold"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs font-black text-slate-400 hover:text-black dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </label>
          <button
            onClick={() => setShowSensitive((value) => !value)}
            className={`min-h-12 px-4 border-2 border-black font-black text-sm flex items-center justify-center gap-2 ${showSensitive ? 'bg-rose-100 dark:bg-rose-950/60 dark:text-rose-200' : 'bg-slate-100 dark:bg-slate-900'}`}
          >
            <EyeOff className="w-4 h-4" />Sensitive {showSensitive ? 'shown' : 'hidden'}
          </button>
          <button
            onClick={() => {
              if (isFiltered || vocabSort === 'newest') {
                startFilteredSession(sortedVocabulary);
              } else {
                startSession('personal');
              }
            }}
            className="min-h-12 px-5 bg-indigo-600 text-white border-2 border-black font-black hover:bg-indigo-700 active:translate-y-0.5 transition-all"
          >
            {isFiltered ? `Practise filtered (${sortedVocabulary.length})` : 'Practise deck'}
          </button>
        </div>

        {/* Sort Order Selector */}
        <div className="p-3 mb-3 bg-slate-50 dark:bg-slate-900 border-2 border-black flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Sort order:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSortChange('newest')}
              className={`px-2.5 py-1 text-xs font-black border-2 border-black rounded transition-all flex items-center gap-1 ${
                vocabSort === 'newest'
                  ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>⚡ Newest first (Default)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('oldest')}
              className={`px-2.5 py-1 text-xs font-bold border-2 border-black rounded transition-all ${
                vocabSort === 'oldest'
                  ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Oldest first
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('alphabetical')}
              className={`px-2.5 py-1 text-xs font-bold border-2 border-black rounded transition-all ${
                vocabSort === 'alphabetical'
                  ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              가나다 Alphabetical
            </button>
            <button
              type="button"
              onClick={() => handleSortChange('random')}
              className={`px-2.5 py-1 text-xs font-bold border-2 border-black rounded transition-all ${
                vocabSort === 'random'
                  ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Random shuffle
            </button>
          </div>
        </div>

        {/* Permanent Clickable Tags Toolbar */}
        <div className="p-3 mb-4 bg-slate-50 dark:bg-slate-900 border-2 border-black">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Filter by tag or date
              </span>
            </div>
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-[10px] font-black underline text-slate-500 hover:text-black dark:hover:text-white"
              >
                Reset tag filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 max-h-36 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`px-2.5 py-1 text-xs font-black border-2 border-black transition-all ${
                selectedTag === null
                  ? 'bg-black text-white dark:bg-indigo-600 dark:text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All ({totalVocabCount})
            </button>

            {latestDate && (
              <button
                type="button"
                onClick={() => setSelectedTag(selectedTag === 'latest' ? null : 'latest')}
                className={`px-2.5 py-1 text-xs font-black border-2 border-black transition-all flex items-center gap-1 ${
                  selectedTag === 'latest'
                    ? 'bg-emerald-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                    : 'bg-emerald-100 text-emerald-950 dark:bg-emerald-950/70 dark:text-emerald-200 hover:bg-emerald-200 dark:hover:bg-emerald-900'
                }`}
              >
                <span>⚡ Latest {latestDate}</span>
                <span className="text-[10px] opacity-80 font-bold">({latestCount})</span>
              </button>
            )}

            {availableTags.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-2 py-1 text-xs font-bold border-2 border-black transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500 shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>#{tag}</span>
                  <span className="ml-1 text-[10px] opacity-70">({tagCounts[tag]})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results summary / Active filter banner */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-sm font-bold text-slate-500">
            Showing {sortedVocabulary.length} of {totalVocabCount} dictionary forms and expressions
            {selectedTag ? ` in ${selectedTag === 'latest' ? `Latest (${latestDate})` : `#${selectedTag}`}` : ''}
            {` • Sorted by ${vocabSort === 'newest' ? 'Newest first' : vocabSort === 'oldest' ? 'Oldest first' : vocabSort === 'alphabetical' ? '가나다 Alphabetical' : 'Random'}`}.
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={() => { setSelectedTag(null); setSearch(''); }}
              className="text-xs font-black underline text-indigo-600 hover:text-indigo-800"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Vocabulary Items Grid */}
        <div className="grid sm:grid-cols-2 gap-3 max-h-[58vh] overflow-y-auto pr-1">
          {sortedVocabulary.map((item) => (
            <div key={item.id} className="p-4 border-2 border-black bg-slate-50 dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <strong className="text-xl">{item.korean}</strong>
                    {item.dateAdded && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-black tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-1.5 py-0.5 border border-indigo-300 dark:border-indigo-800 rounded">
                          {item.dateAdded}
                        </span>
                        {item.dateAdded === latestDate && (
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-1 py-0.5 border border-emerald-400 dark:border-emerald-700 rounded">
                            NEW
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <TagList
                    tags={item.tags}
                    selectedTag={selectedTag}
                    onSelectTag={(tag) => setSelectedTag(selectedTag === tag ? null : tag)}
                  />
                </div>
                <p className="mt-2 font-semibold text-slate-600 dark:text-slate-300">{item.english}</p>
              </div>
              {item.sensitive && <p className="mt-2 text-xs font-black text-rose-600">Strong profanity</p>}
            </div>
          ))}
          {!sortedVocabulary.length && (
            <div className="sm:col-span-2 p-8 text-center border-2 border-dashed border-slate-300">
              <p className="font-bold text-slate-500">No matching entries found.</p>
              <button
                type="button"
                onClick={() => { setSelectedTag(null); setSearch(''); }}
                className="mt-2 text-xs font-black underline text-indigo-600"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'summary') {
    const visiblePersonalCount = PERSONAL_VOCABULARY.filter((item) => showSensitive || !item.sensitive).length;
    const personalDeckComplete = personalMastery.learnedIds.filter((id) => PERSONAL_VOCABULARY.some((item) => item.id === id && (showSensitive || !item.sensitive))).length >= visiblePersonalCount;
    return (
      <div className="w-full max-w-3xl mx-auto min-h-[620px] bg-white dark:bg-slate-950 border-[3px] border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] p-6 flex flex-col items-center justify-center text-center">
        <Award className="w-20 h-20 text-amber-500 mb-5" /><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-600">Session complete</p><h2 className="text-5xl font-black mt-2">Nice work.</h2>
        <p className="text-slate-500 font-bold mt-3">{learnType === 'personal' && sessionBatchSize ? `You mastered this batch of ${sessionBatchSize} cards.` : `You reviewed ${ratings.length} ${learnType}.`} Session time: {formatDuration(elapsedSeconds)}.</p>
        <div className="grid grid-cols-3 gap-3 w-full max-w-xl my-9">
          <Result value={ratings.filter((x) => x === 0).length} label="Again" color="bg-rose-100" /><Result value={ratings.filter((x) => x === 1).length} label="Hard" color="bg-amber-100" /><Result value={ratings.filter((x) => x === 2).length} label="Good" color="bg-emerald-100" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 w-full max-w-xl"><button onClick={() => learnType === 'personal' && personalDeckComplete ? setScreen('vocabulary') : startSession(learnType)} className="min-h-14 bg-indigo-600 text-white border-[3px] border-black font-black text-lg">{learnType === 'personal' ? (personalDeckComplete ? 'Back to Learn' : 'Start next batch') : 'Continue'}</button><button onClick={() => setScreen('vocabulary')} className="min-h-14 bg-white dark:bg-slate-900 border-[3px] border-black font-black text-lg">Finish</button></div>
      </div>
    );
  }

  const item = items[index];
  if (!item) {
    return (
      <div className="w-full max-w-xl mx-auto p-8 text-center bg-white dark:bg-slate-950 border-[3px] border-black">
        <p className="font-bold text-slate-500 mb-4">No cards in this session.</p>
        <button
          onClick={() => setScreen('vocabulary')}
          className="min-h-12 px-5 bg-indigo-600 text-white border-2 border-black font-black"
        >
          Return to Vocabulary
        </button>
      </div>
    );
  }
  const isWord = 'type' in item;
  const isPersonal = 'tags' in item;
  const korean = item.korean;
  const english = item.english;
  const emoji = isWord ? (item as Word).emoji : isPersonal ? '✍️' : (item as SavedSentence).emojis;
  return (
    <div className="w-full h-[calc(100dvh-5.5rem)] max-h-[calc(100dvh-5.5rem)] md:h-[calc(100dvh-6.5rem)] md:max-h-[calc(100dvh-6.5rem)] bg-white flex flex-col overflow-hidden select-none">
      <header className="flex items-center gap-3 px-2 py-1.5 border-b border-slate-200"><button onClick={() => setScreen('vocabulary')} className="w-9 h-9 shrink-0 grid place-items-center border-2 border-black" aria-label="Exit session"><X className="w-4 h-4" /></button><div className="flex-1 h-2 bg-slate-200 overflow-hidden"><div className="h-full bg-indigo-600" style={{ width: `${((index + 1) / items.length) * 100}%` }} /></div><div className="flex items-center gap-2 shrink-0 text-xs font-black tabular-nums"><strong>{index + 1}/{items.length}</strong><span className="h-5 border-l border-slate-300" /><span className="flex items-center gap-1 text-slate-500" aria-label={`Session time ${formatDuration(elapsedSeconds)}`}><Clock3 className="w-3.5 h-3.5" />{formatDuration(elapsedSeconds)}</span></div></header>
      <main className="flex-1 min-h-0 max-h-[90dvh] flex flex-col p-1.5 sm:p-2 gap-1.5 sm:gap-2 max-w-5xl mx-auto w-full overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-1"><span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-600">{writingCard ? (revealed ? 'Trace the answer' : 'Write in Korean') : 'Recall the Korean'}</span><div className="min-w-0 text-right"><h2 className={`${learnType === 'sentences' ? 'text-lg sm:text-2xl' : 'text-2xl sm:text-3xl'} font-black truncate`}>{english}</h2>{isPersonal && <TagList tags={(item as PersonalVocabItem).tags} align="right" />}</div></div>
        {writingCard ? (
          <div ref={canvasBoxRef} className="relative flex-1 min-h-0 bg-white border-[3px] border-black overflow-hidden">
            <div className="absolute inset-0 grid place-items-center pointer-events-none text-slate-200 dark:text-slate-800"><PenTool className="w-24 h-24" /></div>
            {revealed && <Answer korean={korean} emoji={emoji} sentence={learnType === 'sentences'} overlay />}
            <canvas ref={canvasRef} className="absolute inset-0 z-10 w-full h-full touch-none cursor-crosshair" />
            <div className="absolute z-20 top-3 right-3 flex flex-wrap justify-end gap-2 pl-3">
              {!revealed && <button onClick={() => setRevealed(true)} className="h-12 min-w-36 px-5 bg-indigo-600 text-white border-2 border-black font-black text-sm shadow-[3px_3px_0_0_rgba(0,0,0,1)]">Reveal answer</button>}
              <button
                type="button"
                onClick={toggleStylusOnly}
                className={`h-12 px-3 border-2 border-black flex items-center gap-1.5 font-black text-xs transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                  stylusOnly
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                }`}
                title={stylusOnly ? 'Stylus only mode is ON. Resting palms and touch inputs are completely ignored.' : 'Stylus only mode is OFF. Both touch and stylus inputs are accepted.'}
              >
                <PenTool className="w-4 h-4" />
                <span>{stylusOnly ? 'Stylus only: ON' : 'Stylus only: OFF'}</span>
              </button>
              <button onClick={undoStroke} className="h-12 px-3 bg-white dark:bg-slate-950 border-2 border-black flex items-center gap-2 font-black text-xs"><RotateCcw className="w-4 h-4" />Undo</button>
              <button onClick={clearCanvas} className="h-12 px-3 bg-white dark:bg-slate-950 border-2 border-black flex items-center gap-2 font-black text-xs"><Eraser className="w-4 h-4" />Clear</button>
              <button onClick={() => { setNoteDraft(notes[item.id] || ''); setNoteOpen(true); }} className={`h-12 px-3 border-2 border-black flex items-center gap-2 font-black text-xs ${notes[item.id] ? 'bg-amber-200 text-black' : 'bg-white dark:bg-slate-950'}`}><StickyNote className="w-4 h-4" />Note</button>
            </div>
            {noteOpen && <div className="absolute inset-0 z-30 bg-slate-900/45 p-3 grid place-items-center" onPointerDown={(event) => event.stopPropagation()}><div className="w-full max-w-lg bg-white text-black border-[3px] border-black p-4 shadow-[5px_5px_0_0_rgba(0,0,0,1)]"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-wider text-amber-700">Flashcard note</p><h3 className="text-xl font-black">{korean}</h3></div><button onClick={() => setNoteOpen(false)} className="w-10 h-10 grid place-items-center border-2 border-black" aria-label="Close note"><X className="w-4 h-4" /></button></div><textarea autoFocus value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="What should you remember about this card?" className="w-full min-h-32 mt-4 p-3 border-2 border-black resize-y outline-none focus:ring-2 focus:ring-amber-400 font-semibold" /><div className="grid grid-cols-2 gap-2 mt-3"><button onClick={() => setNoteOpen(false)} className="h-12 border-2 border-black font-black">Cancel</button><button onClick={() => { const next = { ...notes }; const value = noteDraft.trim(); if (value) next[item.id] = value; else delete next[item.id]; setNotes(next); localStorage.setItem('korean_flashcard_notes', JSON.stringify(next)); setNoteOpen(false); }} className="h-12 bg-amber-300 border-2 border-black font-black">Save note</button></div></div></div>}
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
function RatingButton({ label, hint, color, onClick }: { label: string; hint: string; color: string; onClick: () => void }) { return <button onClick={onClick} className={`min-h-11 sm:min-h-12 py-1 px-1.5 ${color} text-black border-[3px] border-black font-black flex flex-col justify-center items-center leading-tight`}><span className="block text-sm sm:text-lg">{label}</span><small className="text-[9px] sm:text-xs">{hint}</small></button>; }
function TagList({
  tags,
  align = 'left',
  selectedTag,
  onSelectTag,
}: {
  tags: string[];
  align?: 'left' | 'right';
  selectedTag?: string | null;
  onSelectTag?: (tag: string) => void;
}) {
  return (
    <div className={`flex flex-wrap gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
      {tags.map((tag) => {
        const isSelected = selectedTag === tag;
        if (onSelectTag) {
          return (
            <button
              key={tag}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectTag(tag);
              }}
              className={`text-[9px] leading-3 font-bold tracking-wide px-1.5 py-0.5 border transition-all ${
                isSelected
                  ? 'bg-black text-white dark:bg-indigo-500 dark:text-white border-black font-black'
                  : 'bg-white/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-black dark:hover:border-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              #{tag}
            </button>
          );
        }
        return (
          <span key={tag} className="text-[9px] leading-3 font-bold tracking-wide text-slate-400 dark:text-slate-500">
            #{tag}
          </span>
        );
      })}
    </div>
  );
}
