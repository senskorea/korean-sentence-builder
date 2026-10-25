import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Eye, 
  Check, 
  X, 
  Settings, 
  Shuffle, 
  RotateCcw, 
  Sliders, 
  Volume2, 
  Sparkles, 
  Smartphone
} from 'lucide-react';
import { PERSONAL_VOCABULARY } from '../data/personalLearning';
import { SUBJECTS, OBJECTS, VERBS } from '../data';
import { Word } from '../types';

export interface StudyWord {
  id: string;
  korean: string;
  english: string;
  tags: string[];
  dateAdded?: string;
  source: 'personal' | 'core';
}

const OPACITY_STEPS = [
  { level: 0, label: '0%', description: 'Strict Recall (Completely hidden)' },
  { level: 25, label: '25%', description: 'Heavy Mask (Fine sliced fragments + blur)' },
  { level: 50, label: '50%', description: 'Half Mask (Balanced chopped silhouette)' },
  { level: 75, label: '75%', description: 'Soft Mask (Gentle stencil guide)' },
  { level: 100, label: '100%', description: 'Solid (Full reading practice)' },
];

/**
 * Computes the unified hybrid visual style:
 * Combines opacity reduction, Gaussian blur, and a repeating slotted stencil mask
 * so the characters appear physically fragmented and cannot be read passively.
 */
function getHangulMaskStyle(level: number, revealed: boolean): React.CSSProperties {
  if (revealed || level >= 100) {
    return {
      opacity: 1,
      filter: 'none',
      maskImage: 'none',
      WebkitMaskImage: 'none',
      transition: 'all 0.25s ease-in-out',
    };
  }
  if (level <= 0) {
    return {
      opacity: 0,
      filter: 'none',
      maskImage: 'none',
      WebkitMaskImage: 'none',
      transition: 'all 0.25s ease-in-out',
    };
  }
  if (level <= 25) {
    // Heavy fragmentation: thin 1.5px slices, 4.5px transparent gaps, high blur, low opacity
    return {
      opacity: 0.4,
      filter: 'blur(1.6px)',
      maskImage: 'repeating-linear-gradient(0deg, black 0px, black 1.5px, transparent 1.5px, transparent 6px)',
      WebkitMaskImage: 'repeating-linear-gradient(0deg, black 0px, black 1.5px, transparent 1.5px, transparent 6px)',
      transition: 'all 0.25s ease-in-out',
    };
  }
  if (level <= 50) {
    // Balanced fragmentation: 2.5px slices, 3.5px transparent gaps, medium blur, medium opacity
    return {
      opacity: 0.65,
      filter: 'blur(1.0px)',
      maskImage: 'repeating-linear-gradient(0deg, black 0px, black 2.5px, transparent 2.5px, transparent 6px)',
      WebkitMaskImage: 'repeating-linear-gradient(0deg, black 0px, black 2.5px, transparent 2.5px, transparent 6px)',
      transition: 'all 0.25s ease-in-out',
    };
  }
  // Soft fragmentation: 4px slices, 2px gaps, subtle blur
  return {
    opacity: 0.85,
    filter: 'blur(0.5px)',
    maskImage: 'repeating-linear-gradient(0deg, black 0px, black 4px, transparent 4px, transparent 6px)',
    WebkitMaskImage: 'repeating-linear-gradient(0deg, black 0px, black 4px, transparent 4px, transparent 6px)',
    transition: 'all 0.25s ease-in-out',
  };
}

export default function SmartphoneMode() {
  // Load settings from localStorage with defaults: level = 0%, tag = 'latest'
  const [hangulOpacity, setHangulOpacity] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('korean_smartphone_opacity_v2');
      return saved !== null ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [selectedTag, setSelectedTag] = useState<string>(() => {
    try {
      return localStorage.getItem('korean_smartphone_tag_v2') || 'latest';
    } catch {
      return 'latest';
    }
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [knownCount, setKnownCount] = useState<number>(0);
  const [unknownCount, setUnknownCount] = useState<number>(0);

  // Compile unified vocabulary pool without duplicating data
  const masterPool = useMemo<StudyWord[]>(() => {
    const list: StudyWord[] = [];

    // 1. Personal Vocabulary
    PERSONAL_VOCABULARY.forEach((item) => {
      list.push({
        id: item.id,
        korean: item.korean,
        english: item.english,
        tags: item.tags || [],
        dateAdded: item.dateAdded,
        source: 'personal'
      });
    });

    // 2. Core Vocabulary (Subjects, Objects, Verbs)
    const addCore = (words: Word[], type: string) => {
      words.forEach((w) => {
        if (!list.some((existing) => existing.korean === w.korean)) {
          list.push({
            id: w.id,
            korean: w.korean,
            english: w.english,
            tags: ['core', type],
            source: 'core'
          });
        }
      });
    };

    addCore(SUBJECTS, 'subject');
    addCore(OBJECTS, 'object');
    addCore(VERBS, 'verb');

    return list;
  }, []);

  // Compute all available tags
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    masterPool.forEach((item) => {
      item.tags.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [masterPool]);

  // Filter pool based on selectedTag
  const filteredDeck = useMemo(() => {
    let result = masterPool;
    if (selectedTag === 'all') {
      result = masterPool;
    } else if (selectedTag === 'latest') {
      const dates = masterPool.map((i) => i.dateAdded).filter(Boolean) as string[];
      const latest = dates.sort().reverse()[0];
      result = masterPool.filter((i) => i.dateAdded === latest);
    } else {
      result = masterPool.filter((item) => item.tags.includes(selectedTag));
    }
    return result;
  }, [masterPool, selectedTag]);

  // Card Order setting: 'newest' | 'random' | 'alphabetical'
  const [cardOrder, setCardOrder] = useState<'newest' | 'random' | 'alphabetical'>(() => {
    try {
      return (localStorage.getItem('korean_smartphone_order_v2') as any) || 'newest';
    } catch {
      return 'newest';
    }
  });

  const sortCards = useCallback((cards: StudyWord[], order: 'newest' | 'random' | 'alphabetical') => {
    const list = [...cards];
    if (order === 'newest') {
      return list.sort((a, b) => {
        const dateCmp = (b.dateAdded || '').localeCompare(a.dateAdded || '');
        if (dateCmp !== 0) return dateCmp;
        return a.korean.localeCompare(b.korean, 'ko');
      });
    }
    if (order === 'alphabetical') {
      return list.sort((a, b) => a.korean.localeCompare(b.korean, 'ko'));
    }
    return list.sort(() => Math.random() - 0.5);
  }, []);

  const handleOrderChange = (order: 'newest' | 'random' | 'alphabetical') => {
    setCardOrder(order);
    try {
      localStorage.setItem('korean_smartphone_order_v2', order);
    } catch (e) {
      console.error(e);
    }
  };

  // Active review queue state
  const [queue, setQueue] = useState<StudyWord[]>(() => {
    return sortCards(filteredDeck, cardOrder);
  });

  // When filteredDeck or cardOrder changes, reset queue
  useEffect(() => {
    setQueue(sortCards(filteredDeck, cardOrder));
    setCurrentIndex(0);
    setIsRevealed(false);
    setKnownCount(0);
    setUnknownCount(0);
  }, [filteredDeck, cardOrder, sortCards]);

  // Persist settings
  const handleOpacityChange = (val: number) => {
    setHangulOpacity(val);
    try {
      localStorage.setItem('korean_smartphone_opacity_v2', String(val));
    } catch (e) {
      console.error(e);
    }
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    try {
      localStorage.setItem('korean_smartphone_tag_v2', tag);
    } catch (e) {
      console.error(e);
    }
  };

  const currentWord: StudyWord | undefined = queue[currentIndex];

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const handleKnown = useCallback(() => {
    setKnownCount((prev) => prev + 1);
    setIsRevealed(false);
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(queue.length);
    }
  }, [currentIndex, queue.length]);

  const handleUnknown = useCallback(() => {
    if (!currentWord) return;
    setUnknownCount((prev) => prev + 1);
    setIsRevealed(false);
    setQueue((prev) => [...prev, currentWord]);
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, currentWord]);

  const handleShuffle = () => {
    setQueue([...filteredDeck].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsRevealed(false);
  };

  const handleResetSession = () => {
    handleShuffle();
    setKnownCount(0);
    setUnknownCount(0);
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleReveal();
      } else if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleUnknown();
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleKnown();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings, handleReveal, handleKnown, handleUnknown]);

  const isCompleted = currentIndex >= queue.length && queue.length > 0;

  return (
    <div className="w-full flex justify-center py-2 sm:py-6 px-2">
      {/* Smartphone Portrait Container */}
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border-[3px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] rounded-3xl flex flex-col min-h-[580px] sm:min-h-[640px] overflow-hidden relative select-none">
        
        {/* Top Header Bar */}
        <div className="bg-slate-50 dark:bg-slate-800 border-b-2 border-black px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center border border-black shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
              폰
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-slate-900 dark:text-white">Smartphone</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-black rounded">
                  {selectedTag === 'all' ? 'All' : selectedTag === 'latest' ? 'Latest Class' : selectedTag}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                Card {Math.min(currentIndex + 1, queue.length)} / {queue.length}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShuffle}
              title="Shuffle Cards"
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border-2 border-black flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-transform active:translate-y-0.5"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              title="Settings and Masking"
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border-2 border-black flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-transform active:translate-y-0.5"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Score Ticker */}
        <div className="grid grid-cols-2 border-b-2 border-black text-xs font-black divide-x-2 divide-black bg-slate-100 dark:bg-slate-800">
          <div className="py-1.5 px-3 flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span>모름 Unknown</span>
            <span className="bg-rose-100 dark:bg-rose-950 px-2 py-0.5 border border-black rounded">{unknownCount}</span>
          </div>
          <div className="py-1.5 px-3 flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span>알림 Known</span>
            <span className="bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 border border-black rounded">{knownCount}</span>
          </div>
        </div>

        {/* Main Card Viewport */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 py-6 text-center relative overflow-hidden">
          {isCompleted ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 border-[3px] border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Deck Finished!</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6">
                Reviewed {queue.length} items. Known: {knownCount} | Needs review: {unknownCount}
              </p>
              <button
                onClick={handleResetSession}
                className="px-5 py-2.5 bg-indigo-600 text-white font-black text-sm border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-indigo-700 transition-transform active:translate-y-0.5 flex items-center gap-2 rounded-xl"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Again</span>
              </button>
            </div>
          ) : currentWord ? (
            <div className="w-full flex flex-col items-center justify-center space-y-6">
              
              {/* Top: English Prompt */}
              <div className="w-full">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  English Prompt
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight px-2">
                  {currentWord.english}
                </h2>
              </div>

              {/* Decorative Divider */}
              <div className="w-16 h-1 bg-black dark:bg-slate-700 rounded-full my-1" />

              {/* Underneath: Korean Hangul with Dynamic Chopped Stencil Mask and Blur */}
              <div className="w-full min-h-[110px] flex flex-col items-center justify-center relative">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  한국어 Hangul
                </span>
                
                {/* The Hangul Word */}
                <div className="flex items-center justify-center gap-2">
                  <div
                    style={getHangulMaskStyle(hangulOpacity, isRevealed)}
                    className={`text-4xl sm:text-5xl font-black tracking-wide ${
                      isRevealed 
                        ? 'text-indigo-600 dark:text-indigo-400 scale-105' 
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {hangulOpacity === 0 && !isRevealed ? (
                      <span className="text-slate-300 dark:text-slate-700 font-mono tracking-widest text-3xl">
                        ••••
                      </span>
                    ) : (
                      currentWord.korean
                    )}
                  </div>

                  {isRevealed && (
                    <button
                      onClick={() => handleSpeak(currentWord.korean)}
                      title="Pronounce"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Volume2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    </button>
                  )}
                </div>

                {/* Subtitle / Metadata when revealed */}
                {isRevealed && (
                  <div className="flex items-center justify-center flex-wrap gap-1.5 mt-3">
                    {currentWord.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-full"
                      >
                        #{t}
                      </span>
                    ))}
                    {currentWord.dateAdded && (
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        {currentWord.dateAdded}
                      </span>
                    )}
                  </div>
                )}

                {/* Mask Guide Pill when unrevealed */}
                {!isRevealed && hangulOpacity > 0 && hangulOpacity < 100 && (
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2">
                    Chopped mask level: {hangulOpacity}%
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-slate-500 font-bold text-sm">
              No cards found for tag "{selectedTag}".
            </div>
          )}
        </div>

        {/* Bottom Action Deck */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 border-t-2 border-black flex flex-col gap-2.5">
          
          {/* Top Tier: Full Width Reveal Button */}
          <button
            onClick={handleReveal}
            disabled={isCompleted || !currentWord}
            className={`w-full py-3.5 px-4 rounded-xl border-[3px] border-black font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-transform active:translate-y-0.5 shadow-[3px_3px_0_0_rgba(0,0,0,1)] ${
              isRevealed
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-default'
                : 'bg-amber-400 hover:bg-amber-500 text-black'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>{isRevealed ? 'Revealed / 정답 공개됨' : 'Reveal Answer / 정답 보기'}</span>
          </button>

          {/* Lower Tier: Big Fat Unknown and Known Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Unknown Button (Red) */}
            <button
              onClick={handleUnknown}
              disabled={isCompleted || !currentWord}
              className="flex-1 h-14 sm:h-16 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-sm sm:text-base border-[3px] border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-2 transition-transform active:translate-y-0.5"
            >
              <X className="w-5 h-5 stroke-[3]" />
              <span>모름 Unknown</span>
            </button>

            {/* Known Button (Green) */}
            <button
              onClick={handleKnown}
              disabled={isCompleted || !currentWord}
              className="flex-1 h-14 sm:h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm sm:text-base border-[3px] border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-2 transition-transform active:translate-y-0.5"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>알림 Known</span>
            </button>
          </div>

          {/* Keyboard tip */}
          <div className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 hidden sm:block">
            Hotkeys: [Space] Reveal • [1] Unknown • [2] Known
          </div>
        </div>

        {/* Settings Modal Drawer */}
        {showSettings && (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col justify-end p-2 sm:p-4">
            <div className="w-full bg-white dark:bg-slate-900 border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-2xl p-4 sm:p-5 flex flex-col max-h-[90%] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-purple-600" />
                  <h3 className="font-black text-base text-slate-900 dark:text-white">Smartphone Settings</h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border-2 border-black flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Hangul Masking & Scaffolding Level */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-black text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">
                    Hangul Masking & Scaffolding
                  </label>
                  <span className="text-xs font-black px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-black rounded">
                    {hangulOpacity}%
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-3">
                  Controls the chopped stroke stencil and blur level. Low percentages heavily fragment the word to enforce active recall; 100% renders solid text for reading practice.
                </p>

                {/* Universal Metric Selector (0%, 25%, 50%, 75%, 100%) */}
                <div className="grid grid-cols-5 gap-1.5 mb-3">
                  {OPACITY_STEPS.map((step) => (
                    <button
                      key={step.level}
                      onClick={() => handleOpacityChange(step.level)}
                      className={`py-2 px-1 text-center border-2 border-black rounded-lg font-black text-xs transition-transform active:translate-y-0.5 ${
                        hangulOpacity === step.level
                          ? 'bg-purple-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>

                {/* Live Chopped Mask Preview Box */}
                <div className="p-3 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Live Chopped Preview:</span>
                  <div
                    style={getHangulMaskStyle(hangulOpacity, false)}
                    className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-wide"
                  >
                    {hangulOpacity === 0 ? '•••• (Hidden)' : '한국어 연습'}
                  </div>
                </div>
              </div>

              {/* 2. Word Filter / Category */}
              <div className="mb-5">
                <label className="font-black text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300 block mb-1.5">
                  Word Set / Category Filter
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  <button
                    onClick={() => handleTagChange('latest')}
                    className={`px-2.5 py-1 text-xs font-black border-2 border-black rounded-lg transition-transform active:translate-y-0.5 ${
                      selectedTag === 'latest'
                        ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Latest Class Additions
                  </button>
                  <button
                    onClick={() => handleTagChange('all')}
                    className={`px-2.5 py-1 text-xs font-black border-2 border-black rounded-lg transition-transform active:translate-y-0.5 ${
                      selectedTag === 'all'
                        ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    All Words ({masterPool.length})
                  </button>
                  {availableTags.map((tag) => {
                    const count = masterPool.filter((i) => i.tags.includes(tag)).length;
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagChange(tag)}
                        className={`px-2 py-1 text-xs font-bold border-2 border-black rounded-lg transition-transform active:translate-y-0.5 ${
                          selectedTag === tag
                            ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        #{tag} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Card Order */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-black text-xs uppercase tracking-wide text-slate-700 dark:text-slate-300">
                    Card Order
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">
                    Default: Newest First
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleOrderChange('newest')}
                    className={`py-2 px-2 text-center border-2 border-black rounded-lg font-black text-xs transition-transform active:translate-y-0.5 ${
                      cardOrder === 'newest'
                        ? 'bg-purple-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    ⚡ Newest
                  </button>
                  <button
                    onClick={() => handleOrderChange('random')}
                    className={`py-2 px-2 text-center border-2 border-black rounded-lg font-black text-xs transition-transform active:translate-y-0.5 ${
                      cardOrder === 'random'
                        ? 'bg-purple-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Shuffle
                  </button>
                  <button
                    onClick={() => handleOrderChange('alphabetical')}
                    className={`py-2 px-2 text-center border-2 border-black rounded-lg font-black text-xs transition-transform active:translate-y-0.5 ${
                      cardOrder === 'alphabetical'
                        ? 'bg-purple-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    가나다
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-2.5 bg-black text-white font-black text-sm rounded-xl border-2 border-black hover:bg-slate-800 transition-colors shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-0.5"
              >
                Apply and Return to Practice
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
