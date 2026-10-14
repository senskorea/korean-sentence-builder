import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Trophy, RotateCcw, Flame, CheckCircle2, XCircle } from 'lucide-react';

interface VocabQuestion {
  word: string;
  english: string;
  pron?: string;
  hasBatchim: boolean;
  batchimLetter?: string;
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

export default function BatchimGame() {
  const [mode, setMode] = useState<ParticleMode>('subject');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('korean_batchim_highscore') || '0');
    } catch {
      return 0;
    }
  });
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    word: string;
    chosen: string;
    expected: string;
    explanation: string;
  } | null>(null);
  const [timer, setTimer] = useState(30);

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

  const handleChoice = useCallback((chosen: string) => {
    const isCorrect = currentWord.hasBatchim
      ? chosen === activePair.consonant
      : chosen === activePair.vowel;

    const expected = currentWord.hasBatchim ? activePair.consonant : activePair.vowel;

    let explanation = '';
    if (currentWord.hasBatchim) {
      explanation = `"${currentWord.word}" ends with 받침 [${currentWord.batchimLetter}], so it takes "${activePair.consonant}".`;
      if (currentWord.pron && activePairKey === 'subject') {
        explanation += ` Pronounced [${currentWord.pron}].`;
      }
    } else {
      explanation = `"${currentWord.word}" ends in an open vowel, so it takes "${activePair.vowel}".`;
    }

    if (isCorrect) {
      const addedPoints = 10 * Math.min(streak + 1, 5);
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
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }

    setLastResult({
      correct: isCorrect,
      word: currentWord.word,
      chosen,
      expected,
      explanation,
    });

    setCurrentIdx((i) => i + 1);
    setTimer(30);
  }, [activePair, activePairKey, currentWord, highScore, streak]);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          // Timeout counts as incorrect
          setStreak(0);
          setLastResult({
            correct: false,
            word: currentWord.word,
            chosen: 'Timeout',
            expected: currentWord.hasBatchim ? activePair.consonant : activePair.vowel,
            explanation: `Time expired! "${currentWord.word}" takes "${currentWord.hasBatchim ? activePair.consonant : activePair.vowel}".`,
          });
          setCurrentIdx((i) => i + 1);
          return 30;
        }
        return t - 1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activePair, currentWord]);

  const resetGame = () => {
    setScore(0);
    setStreak(0);
    setCurrentIdx(0);
    setLastResult(null);
    setTimer(30);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 select-none">
      {/* Header bar with controls and stats */}
      <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black">받침 Ending Reflex Trainer</h2>
            <span className="text-[10px] font-black uppercase bg-cyan-100 text-cyan-800 border border-black px-2 py-0.5">
              Zero Audio • Pure Visual
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Train instant automatic selection of consonant vs vowel particles
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex flex-wrap gap-1.5">
          {(['subject', 'copula', 'topic', 'object', 'mixed'] as ParticleMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); resetGame(); }}
              className={`px-2.5 py-1 text-xs font-black border-2 border-black transition-transform active:translate-y-0.5 ${
                mode === m
                  ? 'bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {m === 'subject' && '이 / 가'}
              {m === 'copula' && '이에요 / 예요'}
              {m === 'topic' && '은 / 는'}
              {m === 'object' && '을 / 를'}
              {m === 'mixed' && '⚡ Mixed'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-amber-400 border-2 border-black grid place-items-center">
            <Trophy className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500">Score</span>
            <div className="text-2xl font-black">{score}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-3">
          <div className={`w-10 h-10 rounded-none border-2 border-black grid place-items-center ${
            streak >= 3 ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
          }`}>
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500">Streak</span>
            <div className="text-2xl font-black">{streak} <span className="text-xs font-bold text-slate-400">({Math.min(streak + 1, 5)}x)</span></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-3 shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-indigo-500 text-white border-2 border-black grid place-items-center font-black">
            🏆
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-500">Best</span>
            <div className="text-2xl font-black">{highScore}</div>
          </div>
        </div>
      </div>

      {/* Main Flashcard Arena */}
      <div className="bg-white dark:bg-slate-900 border-[4px] border-black p-6 sm:p-10 shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Rapid Timer Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full transition-all duration-100 ${
              timer < 10 ? 'bg-rose-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${(timer / 30) * 100}%` }}
          />
        </div>

        <div className="mb-2">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 border border-black">
            Target Pattern: {activePair.name}
          </span>
        </div>

        {/* Word Display */}
        <div className="my-6">
          <div className="text-6xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white">
            {currentWord.word}
          </div>
          <div className="text-xl font-bold text-slate-500 dark:text-slate-400 mt-2">
            {currentWord.english}
          </div>
        </div>

        {/* Two Choice Rapid Buttons */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-4">
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
            className={`w-full max-w-lg mt-6 p-3 border-2 border-black flex items-start gap-3 text-left ${
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
                {lastResult.correct ? 'Correct!' : `Mistake: expected "${lastResult.expected}"`}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {lastResult.explanation}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom quick rules cheat sheet */}
      <div className="bg-slate-50 dark:bg-slate-900/60 border-2 border-black p-4 text-xs">
        <h4 className="font-black mb-2 uppercase tracking-wide">Particle Rule Quick Memory</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
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
