import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Zap, BookOpen, RotateCcw, Trophy, Flame, CheckCircle2, XCircle, ArrowRight, Target, Clock, ShieldAlert, Sparkles, Layers } from 'lucide-react';

// ==========================================
// TRACK 1 DATA: PHONETIC RAPID REFLEX (받침)
// ==========================================
interface RapidReflexItem {
  prompt: string;
  english: string;
  pairKey: 'topic' | 'subject' | 'object' | 'copula' | 'connective';
  leftOption: string;
  rightOption: string;
  correctOption: string;
  hasBatchim: boolean;
  batchimLetter?: string;
  lastSyllable: string;
  explanation: string;
}

const RAPID_ITEMS: RapidReflexItem[] = [
  // 은 / 는 (Topic)
  { prompt: '책', english: 'Book', pairKey: 'topic', leftOption: '은', rightOption: '는', correctOption: '은', hasBatchim: true, batchimLetter: 'ㄱ', lastSyllable: '책', explanation: '책 ends in 받침 ㄱ → takes 은' },
  { prompt: '바지', english: 'Pants', pairKey: 'topic', leftOption: '은', rightOption: '는', correctOption: '는', hasBatchim: false, lastSyllable: '지', explanation: '지 ends in vowel ㅣ → takes 는' },
  { prompt: '선생님', english: 'Teacher', pairKey: 'topic', leftOption: '은', rightOption: '는', correctOption: '은', hasBatchim: true, batchimLetter: 'ㅁ', lastSyllable: '님', explanation: '님 ends in 받침 ㅁ → takes 은' },
  { prompt: '친구', english: 'Friend', pairKey: 'topic', leftOption: '은', rightOption: '는', correctOption: '는', hasBatchim: false, lastSyllable: '구', explanation: '구 ends in vowel ㅜ → takes 는' },
  { prompt: '가방', english: 'Bag', pairKey: 'topic', leftOption: '은', rightOption: '는', correctOption: '은', hasBatchim: true, batchimLetter: 'ㅇ', lastSyllable: '방', explanation: '방 ends in 받침 ㅇ → takes 은' },
  { prompt: '모자', english: 'Hat', pairKey: 'topic', leftOption: '은', rightOption: '는', correctOption: '는', hasBatchim: false, lastSyllable: '자', explanation: '자 ends in vowel ㅏ → takes 는' },
  
  // 이 / 가 (Subject)
  { prompt: '지갑', english: 'Wallet', pairKey: 'subject', leftOption: '이', rightOption: '가', correctOption: '이', hasBatchim: true, batchimLetter: 'ㅂ', lastSyllable: '갑', explanation: '갑 ends in 받침 ㅂ → takes 이' },
  { prompt: '시계', english: 'Watch', pairKey: 'subject', leftOption: '이', rightOption: '가', correctOption: '가', hasBatchim: false, lastSyllable: '계', explanation: '계 ends in vowel ㅖ → takes 가' },
  { prompt: '안경', english: 'Glasses', pairKey: 'subject', leftOption: '이', rightOption: '가', correctOption: '이', hasBatchim: true, batchimLetter: 'ㅇ', lastSyllable: '경', explanation: '경 ends in 받침 ㅇ → takes 이' },
  { prompt: '구두', english: 'Dress Shoes', pairKey: 'subject', leftOption: '이', rightOption: '가', correctOption: '가', hasBatchim: false, lastSyllable: '두', explanation: '두 ends in vowel ㅜ → takes 가' },
  { prompt: '화장실', english: 'Restroom', pairKey: 'subject', leftOption: '이', rightOption: '가', correctOption: '이', hasBatchim: true, batchimLetter: 'ㄹ', lastSyllable: '실', explanation: '실 ends in 받침 ㄹ → takes 이' },
  { prompt: '학교', english: 'School', pairKey: 'subject', leftOption: '이', rightOption: '가', correctOption: '가', hasBatchim: false, lastSyllable: '교', explanation: '교 ends in vowel ㅛ → takes 가' },
  { prompt: '연필', english: 'Pencil', pairKey: 'subject', leftOption: '이', rightOption: '가', correctOption: '이', hasBatchim: true, batchimLetter: 'ㄹ', lastSyllable: '필', explanation: '필 ends in 받침 ㄹ → takes 이' },
  { prompt: '주스', english: 'Juice', pairKey: 'subject', leftOption: '이', rightOption: '가', correctOption: '가', hasBatchim: false, lastSyllable: '스', explanation: '스 ends in vowel ㅡ → takes 가' },

  // 을 / 를 (Object)
  { prompt: '물', english: 'Water (drink)', pairKey: 'object', leftOption: '을', rightOption: '를', correctOption: '을', hasBatchim: true, batchimLetter: 'ㄹ', lastSyllable: '물', explanation: '물 ends in 받침 ㄹ → takes 을' },
  { prompt: '커피', english: 'Coffee (drink)', pairKey: 'object', leftOption: '을', rightOption: '를', correctOption: '를', hasBatchim: false, lastSyllable: '피', explanation: '피 ends in vowel ㅣ → takes 를' },
  { prompt: '밥', english: 'Meal / Rice (eat)', pairKey: 'object', leftOption: '을', rightOption: '를', correctOption: '을', hasBatchim: true, batchimLetter: 'ㅂ', lastSyllable: '밥', explanation: '밥 ends in 받침 ㅂ → takes 을' },
  { prompt: '사과', english: 'Apple (buy)', pairKey: 'object', leftOption: '을', rightOption: '를', correctOption: '를', hasBatchim: false, lastSyllable: '과', explanation: '과 ends in vowel ㅘ → takes 를' },
  { prompt: '신문', english: 'Newspaper (read)', pairKey: 'object', leftOption: '을', rightOption: '를', correctOption: '을', hasBatchim: true, batchimLetter: 'ㄴ', lastSyllable: '문', explanation: '문 ends in 받침 ㄴ → takes 을' },
  { prompt: '영화', english: 'Movie (watch)', pairKey: 'object', leftOption: '을', rightOption: '를', correctOption: '를', hasBatchim: false, lastSyllable: '화', explanation: '화 ends in vowel ㅘ → takes 를' },

  // 이에요 / 예요 (Copula)
  { prompt: '학생', english: 'Student', pairKey: 'copula', leftOption: '이에요', rightOption: '예요', correctOption: '이에요', hasBatchim: true, batchimLetter: 'ㅇ', lastSyllable: '생', explanation: '생 ends in 받침 ㅇ → takes 이에요' },
  { prompt: '의사', english: 'Doctor', pairKey: 'copula', leftOption: '이에요', rightOption: '예요', correctOption: '예요', hasBatchim: false, lastSyllable: '사', explanation: '사 ends in vowel ㅏ → takes 예요' },
  { prompt: '폴', english: 'Paul', pairKey: 'copula', leftOption: '이에요', rightOption: '예요', correctOption: '이에요', hasBatchim: true, batchimLetter: 'ㄹ', lastSyllable: '폴', explanation: '폴 ends in 받침 ㄹ → takes 이에요' },
  { prompt: '앤디', english: 'Andy', pairKey: 'copula', leftOption: '이에요', rightOption: '예요', correctOption: '예요', hasBatchim: false, lastSyllable: '디', explanation: '디 ends in vowel ㅣ → takes 예요' },
  { prompt: '러시아 사람', english: 'Russian person', pairKey: 'copula', leftOption: '이에요', rightOption: '예요', correctOption: '이에요', hasBatchim: true, batchimLetter: 'ㅁ', lastSyllable: '람', explanation: '람 ends in 받침 ㅁ → takes 이에요' },

  // 과 / 와 (Connective / With)
  { prompt: '책상', english: 'Desk (and chair)', pairKey: 'connective', leftOption: '과', rightOption: '와', correctOption: '과', hasBatchim: true, batchimLetter: 'ㅇ', lastSyllable: '상', explanation: '상 ends in 받침 ㅇ → takes 과' },
  { prompt: '의자', english: 'Chair (and desk)', pairKey: 'connective', leftOption: '과', rightOption: '와', correctOption: '와', hasBatchim: false, lastSyllable: '자', explanation: '자 ends in vowel ㅏ → takes 와' },
];

// ==========================================
// TRACK 2 DATA: CONTEXTUAL FLOW DUEL (SEMANTIC)
// ==========================================
interface ContextFlowItem {
  id: number;
  before: string;
  after: string;
  english: string;
  category: 'location' | 'topic_vs_subject' | 'marker_vs_also';
  categoryLabel: string;
  leftOption: string;
  rightOption: string;
  correctOption: string;
  targetVerbOrKeyword: string;
  explanation: string;
  ruleAnchor: string;
}

const CONTEXT_ITEMS: ContextFlowItem[] = [
  // 에 vs 에서 (Location: Destination vs Action)
  {
    id: 1,
    before: '저는 오늘 학교',
    after: '가요.',
    english: 'I go to school today.',
    category: 'location',
    categoryLabel: '에 vs 에서 (장소 목적 vs 행동)',
    leftOption: '에',
    rightOption: '에서',
    correctOption: '에',
    targetVerbOrKeyword: '가요 (to go)',
    explanation: '가요 is a movement verb indicating direction or destination. Destinations take 에 (학교에 가요).',
    ruleAnchor: '도착점/방향 → 에 | 가다, 오다, 다니다'
  },
  {
    id: 2,
    before: '학생들이 도서관',
    after: '공부해요.',
    english: 'Students study at the library.',
    category: 'location',
    categoryLabel: '에 vs 에서 (장소 목적 vs 행동)',
    leftOption: '에',
    rightOption: '에서',
    correctOption: '에서',
    targetVerbOrKeyword: '공부해요 (to study)',
    explanation: '공부해요 is a dynamic action verb taking place inside a venue. Active locations take 에서 (도서관에서 공부해요).',
    ruleAnchor: '행동이 일어나는 장소 → 에서 | 공부하다, 먹다, 일하다'
  },
  {
    id: 3,
    before: '친구를 식당',
    after: '만나요.',
    english: 'I meet my friend at the restaurant.',
    category: 'location',
    categoryLabel: '에 vs 에서 (장소 목적 vs 행동)',
    leftOption: '에',
    rightOption: '에서',
    correctOption: '에서',
    targetVerbOrKeyword: '만나요 (to meet)',
    explanation: 'Meeting someone is an active event happening at a location. Use 에서 (식당에서 만나요).',
    ruleAnchor: '활동/만남의 장소 → 에서'
  },
  {
    id: 4,
    before: '지금 집',
    after: '있어요.',
    english: 'I am at home right now.',
    category: 'location',
    categoryLabel: '에 vs 에서 (장소 목적 vs 행동)',
    leftOption: '에',
    rightOption: '에서',
    correctOption: '에',
    targetVerbOrKeyword: '있어요 (to exist / be)',
    explanation: 'Static existence or location of state takes 에 있어요 (집에 있어요).',
    ruleAnchor: '정적 위치/존재 → 에 있어요 / 없어요'
  },
  {
    id: 5,
    before: '백화점',
    after: '옷을 사요.',
    english: 'I buy clothes at the department store.',
    category: 'location',
    categoryLabel: '에 vs 에서 (장소 목적 vs 행동)',
    leftOption: '에',
    rightOption: '에서',
    correctOption: '에서',
    targetVerbOrKeyword: '사요 (to buy)',
    explanation: 'Buying is an active commercial action occurring inside the store. Use 에서 (백화점에서 사요).',
    ruleAnchor: '상업/구매 행동 장소 → 에서'
  },
  {
    id: 6,
    before: '어제 극장',
    after: '영화를 봤어요.',
    english: 'I watched a movie at the theater yesterday.',
    category: 'location',
    categoryLabel: '에 vs 에서 (장소 목적 vs 행동)',
    leftOption: '에',
    rightOption: '에서',
    correctOption: '에서',
    targetVerbOrKeyword: '봤어요 (watched)',
    explanation: 'Watching a movie is an active activity performed inside the cinema. Use 에서 (극장에서 봤어요).',
    ruleAnchor: '경험/관람 활동 장소 → 에서'
  },
  {
    id: 7,
    before: '내일 서울역',
    after: '도착해요.',
    english: 'I arrive at Seoul Station tomorrow.',
    category: 'location',
    categoryLabel: '에 vs 에서 (장소 목적 vs 행동)',
    leftOption: '에',
    rightOption: '에서',
    correctOption: '에',
    targetVerbOrKeyword: '도착해요 (to arrive)',
    explanation: 'Arrival specifies the endpoint or destination. Use 에 (서울역에 도착해요).',
    ruleAnchor: '도착 목표 지점 → 에 도착하다'
  },

  // 은/는 vs 이/가 (Topic/Contrast vs Subject/Focus)
  {
    id: 8,
    before: '이름이 뭐예요? 저',
    after: '폴이에요.',
    english: 'What is your name? As for me, I am Paul.',
    category: 'topic_vs_subject',
    categoryLabel: '은/는 vs 이/가 (화제 vs 주어)',
    leftOption: '는',
    rightOption: '가',
    correctOption: '는',
    targetVerbOrKeyword: '저 (Me / Self Introduction)',
    explanation: 'In general self introductions (introducing the topic of conversation), use the topic marker 는 (저는 폴이에요).',
    ruleAnchor: '자기소개/대화 화제 설정 → 저는 / 이름은'
  },
  {
    id: 9,
    before: '누가 커피를 마셔요? 민수',
    after: '마셔요.',
    english: 'Who drinks coffee? Minsu is the one who drinks it.',
    category: 'topic_vs_subject',
    categoryLabel: '은/는 vs 이/가 (화제 vs 주어)',
    leftOption: '는',
    rightOption: '가',
    correctOption: '가',
    targetVerbOrKeyword: '누가 (Who - Question answered)',
    explanation: 'When answering who (누가), you identify the specific subject performing the action. Use the subject marker 가 (민수가 마셔요).',
    ruleAnchor: '누가 질문에 대한 주어 식별 → 이/가'
  },
  {
    id: 10,
    before: '이 사과는 맛있어요. 하지만 저 사과',
    after: '맛없어요.',
    english: 'This apple is delicious. But that apple is not delicious.',
    category: 'topic_vs_subject',
    categoryLabel: '은/는 vs 이/가 (화제 vs 주어)',
    leftOption: '는',
    rightOption: '가',
    correctOption: '는',
    targetVerbOrKeyword: '하지만 (Contrast / But)',
    explanation: 'When drawing a contrast between two distinct items (A is X, but B is Y), Korean uses the contrast marker 은/는 (저 사과는).',
    ruleAnchor: '대조 및 비교 (하지만) → 은/는'
  },

  // 에 vs 도 (Marker vs Also)
  {
    id: 11,
    before: '교실에 책상이 있어요. 의자',
    after: '있어요.',
    english: 'There is a desk in the classroom. There is also a chair.',
    category: 'marker_vs_also',
    categoryLabel: '에 vs 도 (기본 조사 vs 또한/역시)',
    leftOption: '가',
    rightOption: '도',
    correctOption: '도',
    targetVerbOrKeyword: '의자 (Also a chair)',
    explanation: 'When adding another item to an existing list (X exists, and Y also exists), replace the subject marker with 도 (의자도 있어요).',
    ruleAnchor: '추가/포함 (또한, 역시) → 도'
  },
  {
    id: 12,
    before: '민수 씨는 학생이에요. 수잔 씨',
    after: '학생이에요.',
    english: 'Minsu is a student. Susan is also a student.',
    category: 'marker_vs_also',
    categoryLabel: '에 vs 도 (기본 조사 vs 또한/역시)',
    leftOption: '는',
    rightOption: '도',
    correctOption: '도',
    targetVerbOrKeyword: '수잔 씨 (Susan also)',
    explanation: 'Susan shares the same condition as Minsu. Use the additive particle 도 (수잔 씨도 학생이에요).',
    ruleAnchor: '동일 속성 부가 → 도'
  }
];

export default function ParticleTrainer() {
  const [activeTrack, setActiveTrack] = useState<'reflex' | 'context'>('reflex');

  // ===============================
  // TRACK 1 STATE (RAPID REFLEX)
  // ===============================
  const [reflexFilter, setReflexFilter] = useState<'all' | 'topic' | 'subject' | 'object' | 'copula' | 'connective'>('all');
  const [reflexMode, setReflexMode] = useState<'sprint' | 'survival'>('sprint');
  const [reflexIdx, setReflexIdx] = useState(0);
  const [reflexScore, setReflexScore] = useState(0);
  const [reflexStreak, setReflexStreak] = useState(0);
  const [reflexMaxStreak, setReflexMaxStreak] = useState(0);
  const [sprintTimer, setSprintTimer] = useState(30);
  const [isSprintRunning, setIsSprintRunning] = useState(false);
  const [isSprintFinished, setIsSprintFinished] = useState(false);
  const [reflexFeedback, setReflexFeedback] = useState<{
    status: 'idle' | 'correct' | 'wrong';
    item: RapidReflexItem | null;
    chosen: string;
  }>({ status: 'idle', item: null, chosen: '' });

  const filteredReflexList = useMemo(() => {
    if (reflexFilter === 'all') return RAPID_ITEMS;
    return RAPID_ITEMS.filter((i) => i.pairKey === reflexFilter);
  }, [reflexFilter]);

  const currentReflex = filteredReflexList[reflexIdx % filteredReflexList.length];

  // 30s Sprint Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSprintRunning && sprintTimer > 0) {
      interval = setInterval(() => {
        setSprintTimer((prev) => {
          if (prev <= 1) {
            setIsSprintRunning(false);
            setIsSprintFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSprintRunning, sprintTimer]);

  const startSprint = () => {
    setSprintTimer(30);
    setReflexScore(0);
    setReflexStreak(0);
    setIsSprintRunning(true);
    setIsSprintFinished(false);
    setReflexIdx(Math.floor(Math.random() * filteredReflexList.length));
  };

  const handleReflexTap = useCallback((chosen: string) => {
    if (reflexMode === 'sprint' && !isSprintRunning) return;
    const isCorrect = chosen === currentReflex.correctOption;

    if (isCorrect) {
      setReflexScore((s) => s + 10 + reflexStreak * 2);
      setReflexStreak((st) => {
        const next = st + 1;
        setReflexMaxStreak((m) => Math.max(m, next));
        return next;
      });
      setReflexFeedback({ status: 'correct', item: currentReflex, chosen });
      setTimeout(() => {
        setReflexIdx((idx) => idx + 1);
        setReflexFeedback({ status: 'idle', item: null, chosen: '' });
      }, 350);
    } else {
      setReflexStreak(0);
      setReflexFeedback({ status: 'wrong', item: currentReflex, chosen });
      setTimeout(() => {
        setReflexIdx((idx) => idx + 1);
        setReflexFeedback({ status: 'idle', item: null, chosen: '' });
      }, 1200);
    }
  }, [currentReflex, isSprintRunning, reflexMode, reflexStreak]);

  // ===============================
  // TRACK 2 STATE (CONTEXT FLOW)
  // ===============================
  const [contextFilter, setContextFilter] = useState<'all' | 'location' | 'topic_vs_subject' | 'marker_vs_also'>('all');
  const [contextIdx, setContextIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [contextHistory, setContextHistory] = useState<{ id: number; correct: boolean }[]>([]);

  const filteredContextList = useMemo(() => {
    if (contextFilter === 'all') return CONTEXT_ITEMS;
    return CONTEXT_ITEMS.filter((i) => i.category === contextFilter);
  }, [contextFilter]);

  const currentContext = filteredContextList[contextIdx % filteredContextList.length];

  const handleContextChoose = (choice: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choice);
    const isCorrect = choice === currentContext.correctOption;
    setContextHistory((prev) => [...prev, { id: currentContext.id, correct: isCorrect }]);
  };

  const nextContextQuestion = () => {
    setSelectedAnswer(null);
    setContextIdx((prev) => prev + 1);
  };

  // Keyboard navigation support (A / Left Arrow, D / Right Arrow, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTrack === 'reflex') {
        if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
          handleReflexTap(currentReflex.leftOption);
        } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
          handleReflexTap(currentReflex.rightOption);
        }
      } else if (activeTrack === 'context') {
        if (selectedAnswer === null) {
          if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
            handleContextChoose(currentContext.leftOption);
          } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
            handleContextChoose(currentContext.rightOption);
          }
        } else if (e.key === ' ' || e.key === 'Enter') {
          nextContextQuestion();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTrack, currentReflex, currentContext, handleReflexTap, selectedAnswer]);

  return (
    <div className="w-full flex flex-col gap-3 max-w-5xl mx-auto pb-6 select-none">
      {/* Top Level Hybrid Track Navigator */}
      <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-2.5 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-black text-white font-black text-xs border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            조사
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-black tracking-tight leading-none">
              Particle Selection Binary Duel
            </h2>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
              Interactive two choice decision trainer for iPad landscape and rapid reflex
            </p>
          </div>
        </div>

        {/* Track Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 border-2 border-black">
          <button
            onClick={() => setActiveTrack('reflex')}
            className={`px-3 py-1.5 font-black text-xs flex items-center gap-1.5 transition-all ${
              activeTrack === 'reflex'
                ? 'bg-rose-500 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] border border-black'
                : 'text-slate-700 dark:text-slate-300 hover:text-black'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Track 1: 속도 반사 Rapid Reflex</span>
          </button>
          <button
            onClick={() => setActiveTrack('context')}
            className={`px-3 py-1.5 font-black text-xs flex items-center gap-1.5 transition-all ${
              activeTrack === 'context'
                ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)] border border-black'
                : 'text-slate-700 dark:text-slate-300 hover:text-black'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Track 2: 문맥 문장 Context Duel</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TRACK 1 VIEW: RAPID REFLEX SPLIT TAP                     */}
      {/* ========================================================= */}
      {activeTrack === 'reflex' && (
        <div className="flex flex-col gap-3">
          {/* Controls & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border-2 border-black p-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Particle Pair Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: 'all', label: '전체 믹스' },
                { key: 'topic', label: '은 / 는' },
                { key: 'subject', label: '이 / 가' },
                { key: 'object', label: '을 / 를' },
                { key: 'copula', label: '이에요 / 예요' },
                { key: 'connective', label: '과 / 와' },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => {
                    setReflexFilter(btn.key as any);
                    setReflexIdx(0);
                  }}
                  className={`px-2 py-1 border border-black font-bold whitespace-nowrap ${
                    reflexFilter === btn.key
                      ? 'bg-black text-white'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Mode & Stats */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-950 border border-black font-black text-amber-900 dark:text-amber-200">
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>Streak: {reflexStreak}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-100 dark:bg-indigo-950 border border-black font-black text-indigo-900 dark:text-indigo-200">
                <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                <span>Score: {reflexScore}</span>
              </div>
              {reflexMode === 'sprint' && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-100 dark:bg-rose-950 border border-black font-black text-rose-900 dark:text-rose-200">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>{sprintTimer}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Rapid Sprint Start Overlay if in sprint mode and not active */}
          {reflexMode === 'sprint' && !isSprintRunning && !isSprintFinished && (
            <div className="bg-amber-50 dark:bg-slate-900 border-[3px] border-black p-6 text-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-3">
              <Zap className="w-10 h-10 text-amber-500 fill-amber-400" />
              <h3 className="text-xl font-black">30 Second Rapid Reflex Sprint</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md">
                Tap the correct particle on Left or Right as fast as possible. Tests instant muscle memory for consonant (받침) vs vowel endings without audio.
              </p>
              <button
                onClick={startSprint}
                className="px-6 py-2.5 bg-black text-white font-black text-sm border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:bg-slate-800 active:translate-y-0.5"
              >
                START 30s SPRINT (시작)
              </button>
            </div>
          )}

          {/* Finished Sprint Results Card */}
          {reflexMode === 'sprint' && isSprintFinished && (
            <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-6 text-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col items-center justify-center gap-3">
              <Trophy className="w-12 h-12 text-indigo-600" />
              <h3 className="text-2xl font-black">Sprint Finished!</h3>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                Final Score: <span className="text-black dark:text-white font-black">{reflexScore}</span> | Max Streak: <span className="text-amber-500 font-black">{reflexMaxStreak}</span>
              </p>
              <button
                onClick={startSprint}
                className="px-5 py-2 bg-indigo-600 text-white font-black text-sm border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-indigo-700"
              >
                PLAY AGAIN (다시 하기)
              </button>
            </div>
          )}

          {/* Active Split Screen Arena */}
          {(!reflexMode || reflexMode === 'survival' || isSprintRunning) && currentReflex && (
            <div className="relative grid grid-cols-1 md:grid-cols-12 gap-3 min-h-[300px] sm:min-h-[340px]">
              {/* LEFT MASSIVE TOUCH TARGET */}
              <button
                onClick={() => handleReflexTap(currentReflex.leftOption)}
                className={`md:col-span-3 min-h-[120px] md:min-h-full border-[3px] border-black font-black text-4xl sm:text-5xl flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer ${
                  reflexFeedback.status === 'correct' && reflexFeedback.chosen === currentReflex.leftOption
                    ? 'bg-emerald-500 text-white border-black shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]'
                    : reflexFeedback.status === 'wrong' && reflexFeedback.chosen === currentReflex.leftOption
                    ? 'bg-rose-500 text-white border-black animate-shake'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{currentReflex.leftOption}</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Left (A / ←)
                </span>
              </button>

              {/* CENTER PROMPT CARD */}
              <div
                className={`md:col-span-6 bg-white dark:bg-slate-900 border-[3px] border-black p-4 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)] flex flex-col items-center justify-between text-center relative transition-colors ${
                  reflexFeedback.status === 'correct'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : reflexFeedback.status === 'wrong'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                    : ''
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-black font-black text-[11px] uppercase tracking-wider">
                    {currentReflex.pairKey.toUpperCase()} DECISION
                  </span>
                  {currentReflex.hasBatchim ? (
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 border border-black font-black text-[10px]">
                      받침 있음 ({currentReflex.batchimLetter})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 border border-black font-black text-[10px]">
                      받침 없음 (모음)
                    </span>
                  )}
                </div>

                {/* Prompt Core */}
                <div className="my-4 sm:my-6 flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
                      {currentReflex.prompt}
                    </span>
                    <span className="w-12 h-12 sm:w-16 sm:h-16 border-[3px] border-dashed border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-black text-2xl sm:text-3xl grid place-items-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                      {reflexFeedback.status === 'correct'
                        ? currentReflex.correctOption
                        : reflexFeedback.status === 'wrong'
                        ? '✕'
                        : '?'}
                    </span>
                  </div>
                  <span className="text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400">
                    {currentReflex.english}
                  </span>
                </div>

                {/* Bottom Visual Rule Hint on Mistake */}
                {reflexFeedback.status === 'wrong' ? (
                  <div className="w-full bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-600 p-2 text-rose-950 dark:text-rose-200 text-xs font-bold">
                    {currentReflex.explanation}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-bold">
                    Tap Left or Right target • Instant visual recall
                  </p>
                )}
              </div>

              {/* RIGHT MASSIVE TOUCH TARGET */}
              <button
                onClick={() => handleReflexTap(currentReflex.rightOption)}
                className={`md:col-span-3 min-h-[120px] md:min-h-full border-[3px] border-black font-black text-4xl sm:text-5xl flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.98] cursor-pointer ${
                  reflexFeedback.status === 'correct' && reflexFeedback.chosen === currentReflex.rightOption
                    ? 'bg-emerald-500 text-white border-black shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]'
                    : reflexFeedback.status === 'wrong' && reflexFeedback.chosen === currentReflex.rightOption
                    ? 'bg-rose-500 text-white border-black animate-shake'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{currentReflex.rightOption}</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                  Right (D / →)
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TRACK 2 VIEW: CONTEXTUAL FLOW DUEL (SEMANTIC / ROLE)      */}
      {/* ========================================================= */}
      {activeTrack === 'context' && currentContext && (
        <div className="flex flex-col gap-3">
          {/* Category Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border-2 border-black p-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: 'all', label: '전체 문맥 (All Contexts)' },
                { key: 'location', label: '에 vs 에서 (장소/행동)' },
                { key: 'topic_vs_subject', label: '은/는 vs 이/가 (화제/주어)' },
                { key: 'marker_vs_also', label: '조사 vs 도 (또한)' },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => {
                    setContextFilter(btn.key as any);
                    setContextIdx(0);
                    setSelectedAnswer(null);
                  }}
                  className={`px-2.5 py-1 border border-black font-bold whitespace-nowrap ${
                    contextFilter === btn.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <span className="font-bold text-slate-500 text-[11px]">
              Question {contextIdx + 1} of {filteredContextList.length}
            </span>
          </div>

          {/* Context Sentence Card */}
          <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-5 sm:p-7 shadow-[5px_5px_0_0_rgba(0,0,0,1)] flex flex-col gap-5">
            <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-2.5">
              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200 border border-black font-black text-xs">
                {currentContext.categoryLabel}
              </span>
              <span className="text-xs font-bold text-slate-400">
                Key Focus: <span className="text-black dark:text-white font-black">{currentContext.targetVerbOrKeyword}</span>
              </span>
            </div>

            {/* Sentence with Blank Slot */}
            <div className="my-2 flex flex-col items-center text-center gap-3">
              <div className="text-2xl sm:text-4xl font-black leading-relaxed flex items-center justify-center flex-wrap gap-2 text-slate-900 dark:text-white">
                <span>{currentContext.before}</span>
                <span
                  className={`px-3 py-0.5 min-w-[50px] border-2 border-dashed border-black font-black inline-block text-center ${
                    selectedAnswer === null
                      ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'
                      : selectedAnswer === currentContext.correctOption
                      ? 'bg-emerald-500 text-white border-solid'
                      : 'bg-rose-500 text-white border-solid'
                  }`}
                >
                  {selectedAnswer || '?'}
                </span>
                <span>{currentContext.after}</span>
              </div>

              <p className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300">
                "{currentContext.english}"
              </p>
            </div>

            {/* Binary Choice Touch Targets */}
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
              {[currentContext.leftOption, currentContext.rightOption].map((option, idx) => {
                const isChosen = selectedAnswer === option;
                const isCorrect = option === currentContext.correctOption;

                let btnClass = 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700';
                if (selectedAnswer !== null) {
                  if (isCorrect) {
                    btnClass = 'bg-emerald-500 text-white border-black';
                  } else if (isChosen) {
                    btnClass = 'bg-rose-500 text-white border-black';
                  } else {
                    btnClass = 'opacity-40 bg-slate-200 dark:bg-slate-800 text-slate-500';
                  }
                }

                return (
                  <button
                    key={option}
                    disabled={selectedAnswer !== null}
                    onClick={() => handleContextChoose(option)}
                    className={`py-3.5 px-4 border-[3px] border-black font-black text-2xl sm:text-3xl shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer transition-all flex flex-col items-center justify-center ${btnClass}`}
                  >
                    <span>{option}</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                      {idx === 0 ? 'Option 1 (A)' : 'Option 2 (D)'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Anatomical Grammar Explanation Box (Reveals After Choice) */}
            {selectedAnswer !== null && (
              <div
                className={`p-4 border-2 border-black flex flex-col gap-2 mt-2 transition-all ${
                  selectedAnswer === currentContext.correctOption
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-600'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-black text-sm">
                    {selectedAnswer === currentContext.correctOption ? (
                      <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> 정답! (Correct)
                      </span>
                    ) : (
                      <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> 오답 (Incorrect)
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black bg-black text-white px-2 py-0.5">
                    {currentContext.ruleAnchor}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                  {currentContext.explanation}
                </p>

                <div className="flex justify-end mt-2">
                  <button
                    onClick={nextContextQuestion}
                    className="px-5 py-2 bg-black text-white font-black text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-slate-800 flex items-center gap-1.5 active:translate-y-0.5"
                  >
                    <span>NEXT SENTENCE (다음 문장)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
