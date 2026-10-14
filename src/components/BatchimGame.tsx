import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Sparkles, Trophy, RotateCcw, Flame, CheckCircle2, XCircle, Clock, Play, Pause, AlertCircle, Award } from 'lucide-react';

interface VocabQuestion {
  word: string;
  english: string;
  pron?: string;
  hasBatchim: boolean;
  batchimLetter?: string;
}

interface AttemptRecord {
  id: number;
  word: string;
  english: string;
  hasBatchim: boolean;
  batchimLetter?: string;
  chosen: string;
  expected: string;
  isCorrect: boolean;
  ruleName: string;
  explanation: string;
}

const DRILL_WORDS: VocabQuestion[] = [
  { word: '책', english: 'Book', pron: '채기', hasBatchim: true, batchimLetter: 'ㄱ' },
  { word: '바지', english: 'Pants', hasBatchim: false },
  { word: '가방', english: 'Bag', pron: '가방이', hasBatchim: true, batchimLetter: 'ㅇ' },
  { word: '모자', english: 'Hat', hasBatchim: false },
  { word: '지갑', english: 'Wallet', pron: '지가비', hasBatchim: true, batchimLetter: 'ㅂ' },
  { word: '구두', english: 'Shoes', hasBatchim: false },
  { word: '선생님', english: 'Teacher', pron: '선생님이', hasBatchim: true, batchimLetter: 'ㅁ' },
  { word: '학생', english: 'Student', pron: '학생이', hasBatchim: true, batchimLetter: 'ㅇ' },
  { word: '시계', english: 'Clock / Watch', hasBatchim: false },
  { word: '안경', english: 'Glasses', pron: '안경이', hasBatchim: true, batchimLetter: 'ㅇ' },
  { word: '식당', english: 'Restaurant', pron: '식당이', hasBatchim: true, batchimLetter: 'ㅇ' },
  { word: '영화관', english: 'Cinema', pron: '영화과니', hasBatchim: true, batchimLetter: 'ㄴ' },
  { word: '학교', english: 'School', hasBatchim: false },
  { word: '도서관', english: 'Library', pron: '도서과니', hasBatchim: true, batchimLetter: 'ㄴ' },
  { word: '친구', english: 'Friend', hasBatchim: false },
  { word: '의자', english: 'Chair', hasBatchim: false },
  { word: '책상', english: 'Desk', pron: '책상이', hasBatchim: true, batchimLetter: 'ㅇ' },
  { word: '문구점', english: 'Stationery Store', pron: '문구저미', hasBatchim: true, batchimLetter: 'ㅁ' },
  { word: '화장실', english: 'Restroom', pron: '화장시리', hasBatchim: true, batchimLetter: 'ㄹ' },
  { word: '컴퓨터', english: 'Computer', hasBatchim: false },
  { word: '은행원', english: 'Bank Teller', pron: '은행워니', hasBatchim: true, batchimLetter: 'ㄴ' },
  { word: '사전', english: 'Dictionary', pron: '사저니', hasBatchim: true, batchimLetter: 'ㄴ' },
  { word: '공책', english: 'Notebook', pron: '공채기', hasBatchim: true, batchimLetter: 'ㄱ' },
  { word: '연필', english: 'Pencil', pron: '연피리', hasBatchim: true, batchimLetter: 'ㄹ' },
  { word: '우산', english: 'Umbrella', pron: '우사니', hasBatchim: true, batchimLetter: 'ㄴ' },
  { word: '사과', english: 'Apple', hasBatchim: false },
  { word: '커피', english: 'Coffee', hasBatchim: false },
  { word: '물', english: 'Water', pron: '무리', hasBatchim: true, batchimLetter: 'ㄹ' },
  { word: '밥', english: 'Meal / Rice', pron: '바비', hasBatchim: true, batchimLetter: 'ㅂ' },
  { word: '집', english: 'House / Home', pron: '지비', hasBatchim: true, batchimLetter: 'ㅂ' },
];

type ParticleMode = 'subject' | 'copula' | 'topic' | 'object' | 'mixed';

const PARTICLE_PAIRS: Record<string, { consonant: string; vowel: string; name: string }> = {
  subject: { consonant: '이', vowel: '가', name: 'Subject (이 / 가)' },
  copula: { consonant: '이에요', vowel: '예요', name: 'Copula (이에요 / 예요)' },
  topic: { consonant: '은', vowel: '는', name: 'Topic (은 / 는)' },
  object: { consonant: '을', vowel: '를', name: 'Object (을 / 를)' },
};

const TOTAL_SESSION_SECONDS = 300; // 5 minutes

export default function BatchimGame() {
  const [mode, setMode] = useState<ParticleMode>('subject');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('korean_batchim_highscore') || '0');
    } catch {
      return 0;
    }
  });

  // 5 Minute Session State
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(TOTAL_SESSION_SECONDS);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [attemptHistory, setAttemptHistory] = useState<AttemptRecord[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('wrong');

  // Red Screen Flash State
  const [isFlashingRed, setIsFlashingRed] = useState(false);
  const flashTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Per question rapid timer (3 seconds)
  const [questionTimer, setQuestionTimer] = useState(30);

  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    word: string;
    chosen: string;
    expected: string;
    explanation: string;
  } | null>(null);

  // Shuffle order on start
  const shuffledWords = useMemo(() => {
    return [...DRILL_WORDS].sort(() => Math.random() - 0.5);
  }, []);

  const currentWord = shuffledWords[currentIdx % shuffledWords.length];

  // Resolve current active pair
  const activePairKey = mode === 'mixed'
    ? (['subject', 'copula', 'topic', 'object'] as const)[currentIdx % 4]
    : mode;
  const activePair = PARTICLE_PAIRS[activePairKey];

  // 5 Minute Master Countdown Timer
  useEffect(() => {
    if (!isSessionActive || isSessionFinished) return;

    const interval = setInterval(() => {
      setSessionSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSessionActive(false);
          setIsSessionFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSessionActive, isSessionFinished]);

  // Per question rapid 3 second timer
  useEffect(() => {
    if (!isSessionActive || isSessionFinished) return;

    const interval = setInterval(() => {
      setQuestionTimer((t) => {
        if (t <= 1) {
          // Timeout counts as an unattempted mistake
          handleChoice('');
          return 30;
        }
        return t - 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isSessionActive, isSessionFinished, currentIdx]);

  const triggerRedFlash = useCallback(() => {
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
    }
    setIsFlashingRed(true);
    flashTimerRef.current = setTimeout(() => {
      setIsFlashingRed(false);
    }, 250);
  }, []);

  const handleChoice = useCallback((chosen: string) => {
    if (isSessionFinished) return;

    const expected = currentWord.hasBatchim ? activePair.consonant : activePair.vowel;
    const isCorrect = chosen !== '' && (currentWord.hasBatchim
      ? chosen === activePair.consonant
      : chosen === activePair.vowel);

    let explanation = '';
    if (currentWord.hasBatchim) {
      explanation = `"${currentWord.word}" ends with 받침 [${currentWord.batchimLetter}], so it takes "${activePair.consonant}".`;
      if (currentWord.pron && activePairKey === 'subject') {
        explanation += ` Pronounced [${currentWord.pron}].`;
      }
    } else {
      explanation = `"${currentWord.word}" ends in an open vowel, so it takes "${activePair.vowel}".`;
    }

    // Record into attempt history
    const record: AttemptRecord = {
      id: Date.now() + Math.random(),
      word: currentWord.word,
      english: currentWord.english,
      hasBatchim: currentWord.hasBatchim,
      batchimLetter: currentWord.batchimLetter,
      chosen: chosen || '(Time Out)',
      expected,
      isCorrect,
      ruleName: activePair.name,
      explanation,
    };
    setAttemptHistory((prev) => [record, ...prev]);

    if (isCorrect) {
      // User rule requirement: Flash screen red whenever answer is correct
      triggerRedFlash();

      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) {
        setMaxStreak(nextStreak);
      }

      const addedPoints = 10 * Math.min(nextStreak, 5);
      setScore((s) => {
        const next = s + addedPoints;
        if (next > highScore) {
          setHighScore(next);
          try {
            localStorage.setItem('korean_batchim_highscore', String(next));
          } catch (e) {
            console.error(e);
          }
        }
        return next;
      });
    } else {
      setStreak(0);
    }

    setLastResult({
      correct: isCorrect,
      word: currentWord.word,
      chosen: chosen || '(Time Out)',
      expected,
      explanation,
    });

    setQuestionTimer(30);
    setCurrentIdx((idx) => idx + 1);
  }, [currentWord, activePair, activePairKey, streak, maxStreak, highScore, isSessionFinished, triggerRedFlash]);

  const resetGame = () => {
    setCurrentIdx(0);
    setStreak(0);
    setScore(0);
    setLastResult(null);
    setQuestionTimer(30);
    setSessionSecondsLeft(TOTAL_SESSION_SECONDS);
    setIsSessionActive(true);
    setIsSessionFinished(false);
    setAttemptHistory([]);
    setIsFlashingRed(false);
  };

  const minutesLeft = Math.floor(sessionSecondsLeft / 60);
  const secondsLeft = sessionSecondsLeft % 60;
  const formattedTime = `${minutesLeft}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;

  const correctAttempts = attemptHistory.filter((a) => a.isCorrect);
  const wrongAttempts = attemptHistory.filter((a) => !a.isCorrect);
  const accuracy = attemptHistory.length > 0
    ? Math.round((correctAttempts.length / attemptHistory.length) * 100)
    : 0;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Full screen red flash overlay on correct answer */}
      {isFlashingRed && (
        <div
          className="fixed inset-0 pointer-events-none z-50 bg-red-600/35 border-[14px] border-red-600 transition-opacity duration-75"
          aria-hidden="true"
        />
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border-[3px] border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              받침 Particle Speed Trainer
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-rose-500 text-white border border-black">
              5 Min Sprint
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-0.5">
            Automatic consonant vs vowel particle reflexes. Screen flashes red on correct answers.
          </p>
        </div>

        {/* 5 Min Timer and Controls */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 border-[3px] border-black font-black text-sm sm:text-base flex items-center gap-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
            sessionSecondsLeft <= 30
              ? 'bg-rose-500 text-white animate-pulse'
              : sessionSecondsLeft <= 60
              ? 'bg-amber-300 text-black'
              : 'bg-black text-white'
          }`}>
            <Clock className="w-4 h-4" />
            <span className="tabular-nums tracking-wider">{formattedTime}</span>
          </div>

          <button
            onClick={() => setIsSessionActive((a) => !a)}
            className="p-2 bg-white dark:bg-slate-800 border-2 border-black font-black hover:bg-slate-100 dark:hover:bg-slate-700 shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-0.5"
            title={isSessionActive ? 'Pause Session' : 'Resume Session'}
          >
            {isSessionActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={resetGame}
            className="p-2 bg-white dark:bg-slate-800 border-2 border-black font-black hover:bg-slate-100 dark:hover:bg-slate-700 shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-0.5"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white dark:bg-slate-900 border-[3px] border-black p-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
        <span className="text-xs font-black uppercase tracking-wider text-slate-500">
          Target Mode:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(['subject', 'copula', 'topic', 'object', 'mixed'] as ParticleMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); resetGame(); }}
              className={`px-3 py-1 text-xs font-black border-2 border-black transition-transform active:translate-y-0.5 ${
                mode === m
                  ? 'bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {m === 'subject' && '이 / 가 (Subject)'}
              {m === 'copula' && '이에요 / 예요 (Copula)'}
              {m === 'topic' && '은 / 는 (Topic)'}
              {m === 'object' && '을 / 를 (Object)'}
              {m === 'mixed' && '⚡ Mixed Random'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-2.5 sm:p-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-2.5">
          <div className="w-9 h-9 bg-amber-400 border-2 border-black grid place-items-center shrink-0 font-black">
            <Trophy className="w-4 h-4 text-black" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500">Score</span>
            <div className="text-xl sm:text-2xl font-black">{score}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-2.5 sm:p-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-2.5">
          <div className={`w-9 h-9 border-2 border-black grid place-items-center shrink-0 ${
            streak >= 3 ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
          }`}>
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500">Streak</span>
            <div className="text-xl sm:text-2xl font-black">
              {streak} <span className="text-xs font-bold text-slate-400">({Math.min(streak + 1, 5)}x)</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-2.5 sm:p-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-400 text-black border-2 border-black grid place-items-center shrink-0 font-black">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500">Accuracy</span>
            <div className="text-xl sm:text-2xl font-black">
              {attemptHistory.length > 0 ? `${accuracy}%` : '0%'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-2.5 sm:p-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-2.5">
          <div className="w-9 h-9 bg-indigo-500 text-white border-2 border-black grid place-items-center shrink-0 font-black">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500">Questions</span>
            <div className="text-xl sm:text-2xl font-black">{attemptHistory.length}</div>
          </div>
        </div>
      </div>

      {/* Main Flashcard Arena OR 5 Min Completion Screen */}
      {!isSessionFinished ? (
        <div className={`bg-white dark:bg-slate-900 border-[4px] border-black p-5 sm:p-8 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col items-center text-center relative overflow-hidden transition-colors ${
          isFlashingRed ? 'ring-8 ring-red-500 bg-red-50 dark:bg-red-950/20' : ''
        }`}>
          {/* Rapid Timer Line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full transition-all duration-100 ${
                questionTimer < 10 ? 'bg-rose-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${(questionTimer / 30) * 100}%` }}
            />
          </div>

          <div className="mb-2">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 border border-black">
              Target Pattern: {activePair.name}
            </span>
          </div>

          {/* Word Display */}
          <div className="my-5">
            <div className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
              {currentWord.word}
            </div>
            <div className="text-lg sm:text-xl font-bold text-slate-500 dark:text-slate-400 mt-2">
              {currentWord.english}
            </div>
          </div>

          {/* Two Choice Rapid Buttons */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-3">
            {/* Consonant Particle Button */}
            <button
              onClick={() => handleChoice(activePair.consonant)}
              className="group min-h-20 p-4 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-transform flex flex-col items-center justify-center"
            >
              <span className="text-3xl sm:text-4xl font-black text-sky-800 dark:text-sky-200">
                {activePair.consonant}
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 mt-1">
                Consonant Ending (받침 O)
              </span>
            </button>

            {/* Vowel Particle Button */}
            <button
              onClick={() => handleChoice(activePair.vowel)}
              className="group min-h-20 p-4 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-transform flex flex-col items-center justify-center"
            >
              <span className="text-3xl sm:text-4xl font-black text-amber-800 dark:text-amber-200">
                {activePair.vowel}
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mt-1">
                Vowel Ending (받침 X)
              </span>
            </button>
          </div>

          {/* Feedback explanation from previous move */}
          {lastResult && (
            <div
              className={`w-full max-w-lg mt-5 p-3 border-2 border-black flex items-start gap-3 text-left ${
                lastResult.correct
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-950'
                  : 'bg-rose-50 dark:bg-rose-950/50 border-rose-950'
              }`}
            >
              {lastResult.correct ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-black">
                  {lastResult.correct ? 'Correct! (Screen Flashed Red)' : `Mistake: expected "${lastResult.expected}"`}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {lastResult.explanation}
                </div>
              </div>
            </div>
          )}

          {/* Quick finish button */}
          <div className="mt-5">
            <button
              onClick={() => {
                setIsSessionActive(false);
                setIsSessionFinished(true);
              }}
              className="px-4 py-1.5 text-xs font-black border-2 border-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Finish & Review 5 Min Results
            </button>
          </div>
        </div>
      ) : (
        /* 5 MIN RESULTS DEBRIEF SCREEN */
        <div className="bg-white dark:bg-slate-900 border-[4px] border-black p-6 sm:p-8 shadow-[6px_6px_0_0_rgba(0,0,0,1)] space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-block px-3 py-1 bg-black text-white font-black text-xs uppercase tracking-widest">
              Session Debrief
            </div>
            <h3 className="text-3xl sm:text-4xl font-black">
              5 Minute Sprint Completed!
            </h3>
            <p className="text-sm font-bold text-slate-500">
              Here is the full breakdown of what you got right and wrong.
            </p>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-black text-center">
              <span className="text-[10px] font-black uppercase text-slate-500">Total Drilled</span>
              <div className="text-2xl font-black mt-1">{attemptHistory.length}</div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-black text-center">
              <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">Got Right</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {correctAttempts.length}
              </div>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-2 border-black text-center">
              <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-300">Mistakes</span>
              <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
                {wrongAttempts.length}
              </div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-2 border-black text-center">
              <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">Accuracy</span>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                {accuracy}%
              </div>
            </div>
          </div>

          {/* Restart Button */}
          <div className="flex justify-center">
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start New 5 Min Sprint</span>
            </button>
          </div>

          {/* Filter Tabs for Review List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h4 className="font-black text-sm uppercase tracking-wider">
                Question Review ({attemptHistory.length})
              </h4>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setReviewFilter('wrong')}
                  className={`px-2.5 py-1 text-xs font-black border border-black ${
                    reviewFilter === 'wrong'
                      ? 'bg-rose-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Mistakes ({wrongAttempts.length})
                </button>
                <button
                  onClick={() => setReviewFilter('correct')}
                  className={`px-2.5 py-1 text-xs font-black border border-black ${
                    reviewFilter === 'correct'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Right ({correctAttempts.length})
                </button>
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-2.5 py-1 text-xs font-black border border-black ${
                    reviewFilter === 'all'
                      ? 'bg-black text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  All ({attemptHistory.length})
                </button>
              </div>
            </div>

            {/* List of answers */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {attemptHistory
                .filter((item) => {
                  if (reviewFilter === 'wrong') return !item.isCorrect;
                  if (reviewFilter === 'correct') return item.isCorrect;
                  return true;
                })
                .map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      item.isCorrect
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                        : 'bg-rose-50/80 dark:bg-rose-950/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            {item.word}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            ({item.english})
                          </span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 border border-black bg-white dark:bg-slate-800">
                            {item.ruleName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          {item.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-black">
                      <span className="text-slate-500">Picked:</span>
                      <span className={`px-2 py-0.5 border border-black ${
                        item.isCorrect ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                      }`}>
                        {item.chosen}
                      </span>
                      {!item.isCorrect && (
                        <>
                          <span className="text-slate-400">→ Expected:</span>
                          <span className="px-2 py-0.5 border border-black bg-emerald-300 text-emerald-950">
                            {item.expected}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}

              {attemptHistory.length === 0 && (
                <div className="text-center py-6 text-sm text-slate-500">
                  No questions attempted yet in this session.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom quick rules cheat sheet */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border-2 border-black p-3.5 text-xs">
        <h4 className="font-black mb-1.5 uppercase tracking-wide">Particle Rule Quick Memory</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
          <div className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <strong>Subject:</strong> 받침 → <strong>이</strong> | Vowel → <strong>가</strong>
          </div>
          <div className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <strong>Copula:</strong> 받침 → <strong>이에요</strong> | Vowel → <strong>예요</strong>
          </div>
          <div className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <strong>Topic:</strong> 받침 → <strong>은</strong> | Vowel → <strong>는</strong>
          </div>
          <div className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            <strong>Object:</strong> 받침 → <strong>을</strong> | Vowel → <strong>를</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
