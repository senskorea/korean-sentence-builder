import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Hash, Phone, Building2, ShoppingBag, Calendar, Clock, Eye, EyeOff, Shuffle, Check, X, Sparkles, RotateCcw, Eraser, PenTool } from 'lucide-react';
import { getStroke } from 'perfect-freehand';

type SubTab = 'high_numbers' | 'phone' | 'floors' | 'prices' | 'calendar' | 'time' | 'hangul_decoder';

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

interface PracticeStats {
  right: number;
  wrong: number;
  streak: number;
}

const hourData: Record<number, { word: string; note: string; trap?: boolean }> = {
  1: { word: '한 시', note: 'Trap: 하나 → 한', trap: true },
  2: { word: '두 시', note: 'Trap: 둘 → 두', trap: true },
  3: { word: '세 시', note: 'Trap: 셋 → 세', trap: true },
  4: { word: '네 시', note: 'Trap: 넷 → 네', trap: true },
  5: { word: '다섯 시', note: 'Regular' },
  6: { word: '여섯 시', note: 'Regular' },
  7: { word: '일곱 시', note: 'Regular' },
  8: { word: '여덟 시', note: 'Pronounced [여덜 시]' },
  9: { word: '아홉 시', note: 'Regular' },
  10: { word: '열 시', note: 'Regular' },
  11: { word: '열한 시', note: 'Trap: 열하나 → 열한', trap: true },
  12: { word: '열두 시', note: 'Trap: 열둘 → 열두', trap: true },
};

function formatMinuteSino(m: number): string {
  if (m === 0) return '';
  return numberToSinoKoreanSub10k(m) + ' 분';
}

function getPhoneticTime(period: string, h: number, m: number): { fullSpoken: string; altSpoken?: string; pronunciation: string } {
  const hWord = hourData[h]?.word || `${h}시`;
  const pWord = period ? period + ' ' : '';
  
  if (m === 0) {
    const full = `${pWord}${hWord}예요`;
    const pron = `[${pWord}${hWord}예요]`;
    return { fullSpoken: full, pronunciation: pron };
  }
  
  const mWord = formatMinuteSino(m);
  const full = `${pWord}${hWord} ${mWord}이에요`;
  
  let mPron = mWord;
  if (m === 15) mPron = '시보 분';
  else if (m === 30) mPron = '삼십 뿐';
  else if (m === 50) mPron = '오십 뿐';
  
  const pron = `[${pWord}${hWord} ${mPron}이에요]`.replace('분이에요', '부니에요');
  
  if (m === 30) {
    const alt = `${pWord}${hWord} 반이에요`;
    const altPron = `[${pWord}${hWord} 바니에요]`;
    return { fullSpoken: full, altSpoken: alt, pronunciation: `${pron} 또는 ${altPron}` };
  }
  
  return { fullSpoken: full, pronunciation: pron };
}

// Number to Sino Korean converter helper
function numberToSinoKorean(n: number): string {
  if (n === 0) return '영';
  if (n < 0) return '';

  if (n === 100000000) return '일억';
  
  let result = '';
  const eok = Math.floor(n / 100000000);
  const remEok = n % 100000000;
  const man = Math.floor(remEok / 10000);
  const remMan = remEok % 10000;

  if (eok > 0) {
    result += (eok === 1 ? '' : numberToSinoKoreanSub10k(eok)) + '억 ';
  }
  if (man > 0) {
    result += (man === 1 ? '' : numberToSinoKoreanSub10k(man)) + '만 ';
  }
  if (remMan > 0 || (!eok && !man)) {
    result += numberToSinoKoreanSub10k(remMan);
  }

  return result.trim();
}

function numberToSinoKoreanSub10k(n: number): string {
  const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  const thousands = Math.floor(n / 1000);
  const hundreds = Math.floor((n % 1000) / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;

  let str = '';
  if (thousands > 0) {
    str += (thousands === 1 ? '' : digits[thousands]) + '천 ';
  }
  if (hundreds > 0) {
    str += (hundreds === 1 ? '' : digits[hundreds]) + '백 ';
  }
  if (tens > 0) {
    str += (tens === 1 ? '' : digits[tens]) + '십 ';
  }
  if (ones > 0) {
    str += digits[ones];
  }
  return str.trim();
}

function generateRandomHighNumber(): number {
  const poolType = Math.floor(Math.random() * 6);
  if (poolType === 0) {
    return (Math.floor(Math.random() * 9) + 1) * 1000;
  } else if (poolType === 1) {
    const th = (Math.floor(Math.random() * 9) + 1) * 1000;
    const h = (Math.floor(Math.random() * 9) + 1) * 100;
    return th + h;
  } else if (poolType === 2) {
    return (Math.floor(Math.random() * 9) + 1) * 10000;
  } else if (poolType === 3) {
    const man = (Math.floor(Math.random() * 9) + 1) * 10000;
    const th = (Math.floor(Math.random() * 9) + 1) * 1000;
    const h = Math.random() > 0.5 ? 500 : 0;
    return man + th + h;
  } else if (poolType === 4) {
    return (Math.floor(Math.random() * 18) + 2) * 50000;
  } else {
    const traps = [100, 1000, 10000, 100000, 1000000, 10500, 20400, 50000, 102000, 305000, 1150000];
    return traps[Math.floor(Math.random() * traps.length)];
  }
}

function usePracticeStats(key: string) {
  const [stats, setStats] = useState<PracticeStats>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : { right: 0, wrong: 0, streak: 0 };
    } catch {
      return { right: 0, wrong: 0, streak: 0 };
    }
  });

  const saveStats = (next: PracticeStats) => {
    setStats(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  const markRight = (onNext: () => void) => {
    saveStats({
      right: stats.right + 1,
      wrong: stats.wrong,
      streak: stats.streak + 1,
    });
    onNext();
  };

  const markWrong = (onReveal: () => void) => {
    saveStats({
      right: stats.right,
      wrong: stats.wrong + 1,
      streak: 0,
    });
    onReveal();
  };

  const resetStats = () => {
    saveStats({ right: 0, wrong: 0, streak: 0 });
  };

  return { stats, markRight, markWrong, resetStats };
}

function ScoreHeaderBar({
  title,
  stats,
  onReset,
}: {
  title: string;
  stats: PracticeStats;
  onReset: () => void;
}) {
  return (
    <div className="w-full flex items-center justify-between text-xs font-black pb-2 mb-2 border-b border-slate-200 dark:border-slate-700">
      <span className="uppercase text-slate-400">{title}</span>
      <div className="flex items-center gap-2">
        <span className="text-emerald-600 dark:text-emerald-400">Right: {stats.right}</span>
        <span className="text-slate-300 dark:text-slate-600">•</span>
        <span className="text-rose-600 dark:text-rose-400">Wrong: {stats.wrong}</span>
        {stats.streak > 1 && (
          <>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-amber-500 font-bold">🔥 {stats.streak} streak</span>
          </>
        )}
        {(stats.right > 0 || stats.wrong > 0) && (
          <button
            type="button"
            onClick={onReset}
            className="ml-1 text-[10px] text-slate-400 hover:text-black dark:hover:text-white underline font-bold"
            title="Reset practice score"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

function PracticeActionBar({
  randomLabel,
  revealed,
  onRandom,
  onToggleReveal,
  onWrong,
  onRight,
}: {
  randomLabel: string;
  revealed: boolean;
  onRandom: () => void;
  onToggleReveal: () => void;
  onWrong: () => void;
  onRight: () => void;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={onRandom}
        className="h-11 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-1.5"
        title="Generate random item to practice"
      >
        <Shuffle className="w-4 h-4" />
        <span>{randomLabel}</span>
      </button>

      <button
        type="button"
        onClick={onToggleReveal}
        className="h-11 px-4 bg-black hover:bg-slate-800 text-white font-black text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-1.5"
      >
        {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        <span>{revealed ? 'Hide Result' : 'Check Result'}</span>
      </button>

      <button
        type="button"
        onClick={onWrong}
        className="h-11 px-3.5 bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-200 font-black text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-1.5"
        title="Mark as wrong and reveal answer"
      >
        <X className="w-4 h-4" />
        <span>Wrong</span>
      </button>

      <button
        type="button"
        onClick={onRight}
        className="h-11 px-3.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 font-black text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-1.5"
        title="Mark as right and generate next"
      >
        <Check className="w-4 h-4" />
        <span>Right</span>
      </button>
    </div>
  );
}

const floorDirectory: Record<number, { name: string; korean: string }> = {
  8: { name: 'Sky Lounge & Cafe (스카이라운지 카페)', korean: '팔 층' },
  7: { name: 'Bookstore (서점)', korean: '칠 층' },
  6: { name: 'Cinema (영화관)', korean: '육 층' },
  5: { name: 'Bag Store (가방 가게)', korean: '오 층' },
  4: { name: 'Restaurant (식당)', korean: '사 층' },
  3: { name: 'Shoe Store (신발 가게)', korean: '삼 층' },
  2: { name: 'Clothing Store (옷 가게)', korean: '이 층' },
  1: { name: 'Lobby & Boutique (로비 / 매장)', korean: '일 층' },
  [-1]: { name: 'Food Court & Supermarket (푸드코트)', korean: '지하 일 층' },
  [-2]: { name: 'Underground Parking (지하 주차장)', korean: '지하 이 층' },
};

const floorKeys = [-2, -1, 1, 2, 3, 4, 5, 6, 7, 8];

const priceItems = [
  { name: '바지 (Pants)', price: 76000, korean: '칠만 육천 원이에요', particle: '가' },
  { name: '모자 (Hat)', price: 9000, korean: '구천 원이에요', particle: '가' },
  { name: '가방 (Bag)', price: 35000, korean: '삼만 오천 원이에요', particle: '이' },
  { name: '안경 (Glasses)', price: 110000, korean: '십일만 원이에요', particle: '이' },
  { name: '구두 (Shoes)', price: 28000, korean: '이만 팔천 원이에요', particle: '가' },
  { name: '컴퓨터 (Computer)', price: 1150000, korean: '백십오만 원이에요', particle: '가' },
  { name: '책 (Book)', price: 21000, korean: '이만 천 원이에요', particle: '이' },
  { name: '지갑 (Wallet)', price: 49500, korean: '사만 구천오백 원이에요', particle: '이' },
  { name: '커피 (Coffee)', price: 4500, korean: '사천오백 원이에요', particle: '가' },
  { name: '사과 (Apple)', price: 3000, korean: '삼천 원이에요', particle: '가' },
  { name: '콜라 (Cola)', price: 2000, korean: '이천 원이에요', particle: '가' },
  { name: '맥주 (Beer)', price: 5000, korean: '오천 원이에요', particle: '가' },
  { name: '우산 (Umbrella)', price: 12000, korean: '만 이천 원이에요', particle: '이' },
  { name: '시계 (Watch)', price: 250000, korean: '이십오만 원이에요', particle: '가' },
  { name: '김밥 (Kimbap)', price: 4000, korean: '사천 원이에요', particle: '이' },
  { name: '스마트폰 (Smartphone)', price: 1350000, korean: '백삼십오만 원이에요', particle: '이' },
];

const calendarIrregulars: Record<number, { display: string; note: string; isTrap?: boolean }> = {
  1: { display: '일월 [이뤌]', note: 'Regular liaison' },
  2: { display: '이월 [이월]', note: 'Regular' },
  3: { display: '삼월 [사뭘]', note: 'Regular liaison' },
  4: { display: '사월 [사월]', note: 'Regular' },
  5: { display: '오월 [오월]', note: 'Regular' },
  6: { display: '유월 [유월] ⚠️', note: 'Phonetic Trap: drops final consonant ㄱ (never 육월!)', isTrap: true },
  7: { display: '칠월 [치뤌]', note: 'Regular liaison' },
  8: { display: '팔월 [파뤌]', note: 'Regular liaison' },
  9: { display: '구월 [구월]', note: 'Regular' },
  10: { display: '시월 [시월] ⚠️', note: 'Phonetic Trap: drops final consonant ㅂ (never 십월!)', isTrap: true },
  11: { display: '십일월 [시비뤌]', note: 'Regular liaison' },
  12: { display: '십이월 [시비월]', note: 'Regular liaison' },
};

function RatingButton({
  label,
  hint,
  color,
  onClick,
}: {
  label: string;
  hint: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-12 sm:min-h-14 py-1.5 px-2 border-[3px] border-black ${color} text-slate-900 dark:text-slate-100 font-black flex flex-col justify-center items-center leading-tight shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 transition-all`}
    >
      <span className="block text-sm sm:text-base font-black">{label}</span>
      <small className="text-[10px] sm:text-[11px] font-bold opacity-80">{hint}</small>
    </button>
  );
}

type DecoderCategory = 'all' | 'prices' | 'time' | 'calendar' | 'high_numbers' | 'floors';

interface DecoderItem {
  id: string;
  category: DecoderCategory;
  categoryLabel: string;
  hangulPrompt: string;
  subPrompt?: string;
  answerNumeral: string;
  breakdown: string;
  badgeColor: string;
}

function generateDecoderItem(category: DecoderCategory): DecoderItem {
  let chosenCategory = category;
  if (chosenCategory === 'all') {
    const categories: DecoderCategory[] = ['prices', 'time', 'calendar', 'high_numbers', 'floors'];
    chosenCategory = categories[Math.floor(Math.random() * categories.length)];
  }

  if (chosenCategory === 'prices') {
    const it = priceItems[Math.floor(Math.random() * priceItems.length)];
    return {
      id: `price_${Date.now()}_${Math.random()}`,
      category: 'prices',
      categoryLabel: 'Prices (가격)',
      hangulPrompt: `${it.name.split(' ')[0]}${it.particle} ${it.korean}`,
      subPrompt: it.name,
      answerNumeral: `${it.price.toLocaleString()}원`,
      breakdown: `${it.name}: ${numberToSinoKorean(it.price)}원 (${it.price.toLocaleString()}원)`,
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-600 dark:bg-emerald-950 dark:text-emerald-200',
    };
  }

  if (chosenCategory === 'time') {
    const period = Math.random() > 0.5 ? '오후' : '오전';
    const h = Math.floor(Math.random() * 12) + 1;
    const minutesPool = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    const m = minutesPool[Math.floor(Math.random() * minutesPool.length)];
    const timeInfo = getPhoneticTime(period, h, m);
    const promptText = (m === 30 && Math.random() > 0.5 && timeInfo.altSpoken) ? timeInfo.altSpoken : timeInfo.fullSpoken;
    const digital = `${period} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    return {
      id: `time_${Date.now()}_${Math.random()}`,
      category: 'time',
      categoryLabel: 'Clock & Time (시간)',
      hangulPrompt: promptText,
      subPrompt: '지금 몇 시예요?',
      answerNumeral: digital,
      breakdown: `${hourData[h]?.word} (Native ${h}시) + ${m > 0 ? formatMinuteSino(m) + ' (Sino ' + m + '분)' : '정각'}`,
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-600 dark:bg-indigo-950 dark:text-indigo-200',
    };
  }

  if (chosenCategory === 'calendar') {
    const m = Math.floor(Math.random() * 12) + 1;
    const info = calendarIrregulars[m];
    const rawMonth = info.display.split(' ')[0];
    return {
      id: `cal_${Date.now()}_${Math.random()}`,
      category: 'calendar',
      categoryLabel: 'Calendar (달력)',
      hangulPrompt: `${rawMonth}이에요`,
      subPrompt: '몇 월이에요?',
      answerNumeral: `${m}월`,
      breakdown: info.note,
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-600 dark:bg-rose-950 dark:text-rose-200',
    };
  }

  if (chosenCategory === 'floors') {
    const fl = floorKeys[Math.floor(Math.random() * floorKeys.length)];
    const it = floorDirectory[fl];
    const promptText = fl < 0 ? `지하 ${numberToSinoKorean(Math.abs(fl))} 층에 있어요` : `${numberToSinoKorean(fl)} 층에 있어요`;
    const numDisplay = fl < 0 ? `지하 ${Math.abs(fl)}층 (B${Math.abs(fl)})` : `${fl}층`;
    return {
      id: `floor_${Date.now()}_${Math.random()}`,
      category: 'floors',
      categoryLabel: 'Floors (층)',
      hangulPrompt: promptText,
      subPrompt: it.name,
      answerNumeral: numDisplay,
      breakdown: `${numberToSinoKorean(Math.abs(fl))}층 = ${numDisplay} (${it.name})`,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-600 dark:bg-amber-950 dark:text-amber-200',
    };
  }

  const num = generateRandomHighNumber();
  const sino = numberToSinoKorean(num);
  return {
    id: `high_${Date.now()}_${Math.random()}`,
    category: 'high_numbers',
    categoryLabel: 'High Numbers (큰 수)',
    hangulPrompt: `${sino} 원이에요`,
    subPrompt: '얼마예요?',
    answerNumeral: `${num.toLocaleString()}원`,
    breakdown: `Sino-Korean 4-digit grouping: ${sino}원 = ${num.toLocaleString()}원`,
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-600 dark:bg-purple-950 dark:text-purple-200',
  };
}

function HangulDecoderStage() {
  const [activeCategory, setActiveCategory] = useState<DecoderCategory>('all');
  const [item, setItem] = useState<DecoderItem>(() => generateDecoderItem('all'));
  const decoderStats = usePracticeStats('korean_numbers_decoder_stats');

  const [revealed, setRevealed] = useState(false);
  const [typedInput, setTypedInput] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);
  const [showFullPrompt, setShowFullPrompt] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasBoxRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const renderFrame = useRef<number | null>(null);
  const lines = useRef<number[][][]>([]);
  const currentLine = useRef<number[][] | null>(null);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { desynchronized: true });
    if (!canvas || !context) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.scale(canvas.width / rect.width, canvas.height / rect.height);

    const isDark = document.documentElement.classList.contains('dark') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    context.fillStyle = isDark ? '#a5b4fc' : '#4f46e5';

    const visibleLines = currentLine.current?.length ? [...lines.current, currentLine.current] : lines.current;
    visibleLines.forEach((line) => {
      if (!line.length) return;
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

  useEffect(() => {
    syncCanvasSize();
    window.addEventListener('resize', syncCanvasSize);
    return () => window.removeEventListener('resize', syncCanvasSize);
  }, [syncCanvasSize]);

  const nextCard = useCallback((cat: DecoderCategory) => {
    setRevealed(false);
    setTypedInput('');
    clearCanvas();
    setItem(generateDecoderItem(cat));
  }, [clearCanvas]);

  const handleCategorySelect = (cat: DecoderCategory) => {
    setActiveCategory(cat);
    nextCard(cat);
  };

  const handleRate = (rating: 0 | 1 | 2) => {
    if (rating === 0) {
      decoderStats.markWrong(() => {});
    } else {
      decoderStats.markRight(() => {});
    }
    nextCard(activeCategory);
  };

  const beginStroke = useCallback((event: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    event.preventDefault();
    canvas.setPointerCapture?.(event.pointerId);
    activePointerId.current = event.pointerId;
    const rect = canvas.getBoundingClientRect();
    const pressure = event.pointerType === 'pen' && event.pressure > 0 ? event.pressure : 0.5;
    currentLine.current = [[event.clientX - rect.left, event.clientY - rect.top, pressure]];
    drawing.current = true;
    requestCanvasRender();
  }, [requestCanvasRender]);

  const continueStroke = useCallback((event: PointerEvent) => {
    if (!drawing.current || !currentLine.current || activePointerId.current !== event.pointerId) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const pressure = event.pointerType === 'pen' && event.pressure > 0 ? event.pressure : 0.5;
    currentLine.current.push([event.clientX - rect.left, event.clientY - rect.top, pressure]);
    requestCanvasRender();
  }, [requestCanvasRender]);

  const endStroke = useCallback((event: PointerEvent) => {
    if (!drawing.current || activePointerId.current !== event.pointerId) return;
    event.preventDefault();
    drawing.current = false;
    activePointerId.current = null;
    if (currentLine.current?.length) {
      lines.current.push([...currentLine.current]);
    }
    currentLine.current = null;
    if (renderFrame.current !== null) {
      window.cancelAnimationFrame(renderFrame.current);
      renderFrame.current = null;
    }
    renderCanvas();
  }, [renderCanvas]);

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

  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setTypedInput('');
    } else if (val === 'BACK') {
      setTypedInput((prev) => prev.slice(0, -1));
    } else {
      setTypedInput((prev) => prev + val);
    }
  };

  const categoryChips: { id: DecoderCategory; label: string }[] = [
    { id: 'all', label: 'All Numbers / 종합' },
    { id: 'prices', label: 'Prices (가격)' },
    { id: 'time', label: 'Clock & Time (시간)' },
    { id: 'calendar', label: 'Calendar (달력)' },
    { id: 'high_numbers', label: 'High Numbers (큰 수)' },
    { id: 'floors', label: 'Floors (층)' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-4 sm:p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 border border-black flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Hangul Decoding Flashcard Mode
          </span>
        </div>
        <h3 className="text-2xl font-black mt-2">Hangul to Numeral Recall</h3>
        <p className="text-xs text-slate-500 mt-1">
          Read the Korean text prompt, handwrite the numeral in the canvas box, then reveal and rate your recall.
        </p>
      </div>

      {/* Category Filter Chips Toolbar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-2 border-black flex flex-col gap-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
          Filter by Number Category:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {categoryChips.map((chip) => {
            const isSelected = activeCategory === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleCategorySelect(chip.id)}
                className={`px-2.5 py-1 text-xs font-black border-2 border-black transition-all ${
                  isSelected
                    ? 'bg-black text-white dark:bg-indigo-600 dark:text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Score Header Bar */}
      <ScoreHeaderBar
        title={`Hangul Decoder • ${item.categoryLabel}`}
        stats={decoderStats.stats}
        onReset={decoderStats.resetStats}
      />

      {/* Main Flashcard Stage */}
      <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 border-[3px] border-black flex flex-col">
        {/* Flashcard Prompt Header */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-black inline-block w-fit ${item.badgeColor}`}>
              {item.categoryLabel}
            </span>
            {item.subPrompt && (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                {item.subPrompt}
              </span>
            )}
          </div>

          <div
            onClick={() => setShowFullPrompt(true)}
            className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white cursor-pointer hover:opacity-80 active:opacity-60 text-left sm:text-right transition-opacity"
            title="Tap to see full Hangul text"
          >
            {item.hangulPrompt}
          </div>
        </div>

        {/* Handwriting Canvas Box */}
        <div
          ref={canvasBoxRef}
          className="relative min-h-[260px] sm:min-h-[300px] bg-white dark:bg-slate-900 border-2 border-black overflow-hidden my-3 shadow-inner"
        >
          <div className="absolute inset-0 grid place-items-center pointer-events-none text-slate-200 dark:text-slate-800 select-none">
            <PenTool className="w-16 h-16 opacity-20" />
          </div>

          {!revealed && (
            <div className="absolute top-2 left-2 pointer-events-none text-[11px] font-black uppercase tracking-wider text-slate-300 dark:text-slate-600 select-none">
              Handwrite numeral here
            </div>
          )}

          {/* Floating Canvas Controls */}
          <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5">
            {typedInput && (
              <div className="px-2 py-0.5 bg-black text-white text-xs font-mono font-black border border-white">
                {typedInput}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowKeypad(!showKeypad)}
              className={`h-8 px-2 text-xs font-black border-2 border-black flex items-center gap-1 active:translate-y-0.5 ${
                showKeypad ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
              title="Toggle on-screen numeric keypad"
            >
              <Hash className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pad</span>
            </button>
            <button
              type="button"
              onClick={undoStroke}
              className="h-8 px-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-2 border-black text-xs font-black flex items-center gap-1 active:translate-y-0.5"
              title="Undo last stroke"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={clearCanvas}
              className="h-8 px-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-2 border-black text-xs font-black flex items-center gap-1 active:translate-y-0.5"
              title="Clear canvas"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>

          <canvas ref={canvasRef} className="absolute inset-0 z-10 w-full h-full touch-none cursor-crosshair" />

          {/* On-screen numeric keypad overlay */}
          {showKeypad && !revealed && (
            <div className="absolute bottom-2 right-2 z-30 bg-white/95 dark:bg-slate-900/95 p-2.5 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex flex-col gap-1.5">
              <div className="text-[10px] font-black uppercase text-slate-400 flex justify-between">
                <span>Keypad</span>
                <span>{typedInput || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleKeypadPress(k === 'C' ? 'CLEAR' : k === '⌫' ? 'BACK' : k)}
                    className="w-9 h-9 border border-black font-black text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:translate-y-0.5 flex items-center justify-center"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Answer revealed watermark overlay */}
          {revealed && (
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center p-4 bg-white/95 dark:bg-slate-900/95 text-center animate-in fade-in">
              <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Target Numeral</span>
              <div className="text-4xl sm:text-6xl font-black text-emerald-600 dark:text-emerald-400 font-mono my-2 drop-shadow-sm">
                {item.answerNumeral}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 max-w-md bg-emerald-50 dark:bg-emerald-950/60 p-2.5 border-2 border-emerald-600 mt-2">
                {item.breakdown}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions Area */}
        {!revealed ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="flex-1 min-h-12 sm:min-h-14 bg-indigo-600 hover:bg-indigo-700 active:translate-y-0.5 text-white border-[3px] border-black font-black text-base sm:text-lg shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              <span>Reveal Answer / 정답 보기</span>
            </button>
            <button
              type="button"
              onClick={() => nextCard(activeCategory)}
              className="h-12 sm:h-14 px-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-[3px] border-black font-black text-sm shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-1.5"
              title="Skip to next random card"
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">Skip</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-center text-xs font-black uppercase text-slate-400">
              How did you do? Rate to proceed:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <RatingButton
                label="Again"
                hint="다시 연습"
                color="bg-rose-200 dark:bg-rose-900/60 dark:text-rose-100"
                onClick={() => handleRate(0)}
              />
              <RatingButton
                label="Hard"
                hint="어려움"
                color="bg-amber-200 dark:bg-amber-900/60 dark:text-amber-100"
                onClick={() => handleRate(1)}
              />
              <RatingButton
                label="Good"
                hint="마스터"
                color="bg-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-100"
                onClick={() => handleRate(2)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Prompt Modal */}
      {showFullPrompt && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 grid place-items-center"
          onClick={() => setShowFullPrompt(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-[3px] border-black dark:border-white p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)] flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {item.categoryLabel}
              </span>
              <button
                type="button"
                onClick={() => setShowFullPrompt(false)}
                className="w-8 h-8 grid place-items-center border-2 border-black dark:border-white text-slate-900 dark:text-white font-bold"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-2xl sm:text-3xl font-black leading-snug break-words">
              {item.hangulPrompt}
            </p>
            {item.subPrompt && (
              <p className="text-sm font-bold text-slate-500">
                {item.subPrompt}
              </p>
            )}
            <button
              type="button"
              onClick={() => setShowFullPrompt(false)}
              className="w-full mt-2 py-2.5 bg-black text-white dark:bg-indigo-600 dark:text-white font-black border-2 border-black dark:border-white text-xs uppercase tracking-wider active:translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NumbersLab() {
  const [activeTab, setActiveTab] = useState<SubTab>('high_numbers');

  // Sub Module 1: High Numbers State
  const [sliderVal, setSliderVal] = useState<number>(45000);
  const [revealedHighNumber, setRevealedHighNumber] = useState(false);
  const highStats = usePracticeStats('korean_numbers_practice_stats');

  const handleRandomHighNumber = () => {
    const nextVal = generateRandomHighNumber();
    setSliderVal(nextVal);
    setRevealedHighNumber(false);
  };

  // Sub Module 2: Phone Numbers State
  const [phoneSeed, setPhoneSeed] = useState(0);
  const [revealedPhone, setRevealedPhone] = useState(false);
  const phoneStats = usePracticeStats('korean_numbers_phone_stats');

  const phoneNumbers = useMemo(() => [
    { num: '010 8113 7787', label: "Paul's Mobile", spoken: '공일공에 팔일일삼에 칠칠팔칠이에요', pron: '[공일공에 파릴이리사메 칠칠팔치리에요]' },
    { num: '010 3248 1931', label: "Irina's Mobile", spoken: '공일공에 삼이사팔에 일구삼일이에요', pron: '[공일공에 삼이사파레 일구사미리에요]' },
    { num: '02 735 9240', label: "Seoul Office Landline", spoken: '공이에 칠삼오에 구이사공이에요', pron: '[공이에 칠삼오에 구이사공이에요]' },
    { num: '031 261 8703', label: "Gyeonggi Business Line", spoken: '공삼일에 이육일에 팔칠공삼이에요', pron: '[공사미레 이유기레 팔칠공사미에요]' },
    { num: '064 628 9537', label: "Jeju Hotel Line", spoken: '공육사에 육이팔에 구오삼칠이에요', pron: '[공육사에 유기파레 구오삼치리에요]' },
    { num: '02 705 8114', label: "Sogang University (서강대학교)", spoken: '공이에 칠공오에 팔일일사에요', pron: '[공이에 칠공오에 파릴릴사예요]' },
    { num: '02 6000 0114', label: "COEX Convention Center (코엑스)", spoken: '공이에 육공공공에 공일일사에요', pron: '[공이에 육꽁꽁꽁에 공일릴사예요]' },
    { num: '032 741 0114', label: "Incheon Airport (인천공항)", spoken: '공삼일에 칠사일에 공일일사에요', pron: '[공사미에 칠사이레 공일릴사예요]' },
    { num: '051 440 2288', label: "Busan Station (부산역)", spoken: '공오일에 사사공에 이이팔팔이에요', pron: '[공오일에 사사공에 이이팔파리에요]' },
    { num: '02 548 1230', label: "Gangnam Dental Clinic (강남 치과)", spoken: '공이에 오사팔에 일이삼공이에요', pron: '[공이에 오사파레 일이삼공이에요]' },
    { num: '02 334 5092', label: "Hongdae Coffee Lab (홍대 카페)", spoken: '공이에 삼삼사에 오공구이에요', pron: '[공이에 삼삼사에 오공구이예요]' },
    { num: '02 120 0000', label: "Seoul Dasan Call Center (다산 콜센터)", spoken: '공이에 일이에 공공공공이에요', pron: '[공이에 이리에 공공공공이에요]' },
    { num: '02 1577 8080', label: "Fast Delivery Hotline (배달 전화)", spoken: '공이에 일오칠칠에 팔공팔공이에요', pron: '[공이에 일오칠치레 팔공팔공이에요]' },
    { num: '02 1588 5114', label: "Seoul Taxi Dispatch (택시 호출)", spoken: '공이에 일오팔팔에 오일일사에요', pron: '[공이에 일오팔파레 오일릴사예요]' },
  ], []);

  const currentPhone = phoneNumbers[phoneSeed % phoneNumbers.length];

  const handleRandomPhone = () => {
    setPhoneSeed((prev) => {
      let next: number;
      do {
        next = Math.floor(Math.random() * phoneNumbers.length);
      } while (next === prev && phoneNumbers.length > 1);
      return next;
    });
    setRevealedPhone(false);
  };

  // Sub Module 3: Floor Navigator State
  const [selectedFloor, setSelectedFloor] = useState<number>(4);
  const [revealedFloor, setRevealedFloor] = useState(false);
  const floorStats = usePracticeStats('korean_numbers_floors_stats');

  const handleRandomFloor = () => {
    setSelectedFloor((prev) => {
      let next: number;
      do {
        next = floorKeys[Math.floor(Math.random() * floorKeys.length)];
      } while (next === prev);
      return next;
    });
    setRevealedFloor(false);
  };

  // Sub Module 4: Price Matcher State
  const [priceItemIdx, setPriceItemIdx] = useState(0);
  const [revealedPrice, setRevealedPrice] = useState(false);
  const priceStats = usePracticeStats('korean_numbers_prices_stats');

  const currentPriceItem = priceItems[priceItemIdx % priceItems.length];

  const handleRandomPrice = () => {
    setPriceItemIdx((prev) => {
      let next: number;
      do {
        next = Math.floor(Math.random() * priceItems.length);
      } while (next === prev && priceItems.length > 1);
      return next;
    });
    setRevealedPrice(false);
  };

  // Sub Module 5: Calendar Traps
  const [selectedMonth, setSelectedMonth] = useState<number>(6);
  const [revealedMonth, setRevealedMonth] = useState(false);
  const calendarStats = usePracticeStats('korean_numbers_calendar_stats');

  const handleRandomMonth = () => {
    setSelectedMonth((prev) => {
      let next: number;
      do {
        if (Math.random() < 0.3) {
          next = Math.random() < 0.5 ? 6 : 10;
        } else {
          next = Math.floor(Math.random() * 12) + 1;
        }
      } while (next === prev);
      return next;
    });
    setRevealedMonth(false);
  };

  const handleSliderChange = (val: number) => {
    setSliderVal(val);
    setRevealedHighNumber(false);
  };

  const handleFloorSelect = (fl: number) => {
    setSelectedFloor(fl);
    setRevealedFloor(false);
  };

  const handleMonthSelect = (m: number) => {
    setSelectedMonth(m);
    setRevealedMonth(false);
  };

  // Sub Module 6: Clock & Time Drill State
  const [selectedHour, setSelectedHour] = useState<number>(2);
  const [selectedMinute, setSelectedMinute] = useState<number>(30);
  const [selectedPeriod, setSelectedPeriod] = useState<'오전' | '오후'>('오후');
  const [revealedTime, setRevealedTime] = useState<boolean>(false);
  const timeStats = usePracticeStats('korean_numbers_time_stats');

  const handleRandomTime = () => {
    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    const nextH = hours[Math.floor(Math.random() * hours.length)];
    const nextM = minutes[Math.floor(Math.random() * minutes.length)];
    const nextP: '오전' | '오후' = Math.random() > 0.4 ? '오후' : '오전';
    setSelectedHour(nextH);
    setSelectedMinute(nextM);
    setSelectedPeriod(nextP);
    setRevealedTime(false);
  };

  const handleHourSelect = (h: number) => {
    setSelectedHour(h);
    setRevealedTime(false);
  };

  const handleMinuteSelect = (m: number) => {
    setSelectedMinute(m);
    setRevealedTime(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 select-none">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black">숫자 랩 • Korean Numbers Practice Lab</h2>
            <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-black px-2 py-0.5">
              Zero Audio • Active Recall
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500 mt-0.5">
            Results stay hidden until you ask to check them. Practice recalling before revealing.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveTab('high_numbers')}
            className={`px-3 py-1 text-xs font-black border-2 border-black flex items-center gap-1.5 ${
              activeTab === 'high_numbers' ? 'bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white dark:bg-slate-800'
            }`}
          >
            <Hash className="w-3.5 h-3.5" /> High Numbers
          </button>
          <button
            onClick={() => setActiveTab('phone')}
            className={`px-3 py-1 text-xs font-black border-2 border-black flex items-center gap-1.5 ${
              activeTab === 'phone' ? 'bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white dark:bg-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> Phone Protocol
          </button>
          <button
            onClick={() => setActiveTab('floors')}
            className={`px-3 py-1 text-xs font-black border-2 border-black flex items-center gap-1.5 ${
              activeTab === 'floors' ? 'bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white dark:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Floors (층)
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`px-3 py-1 text-xs font-black border-2 border-black flex items-center gap-1.5 ${
              activeTab === 'prices' ? 'bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white dark:bg-slate-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Prices (얼마예요)
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1 text-xs font-black border-2 border-black flex items-center gap-1.5 ${
              activeTab === 'calendar' ? 'bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white dark:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Calendar Traps
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`px-3 py-1 text-xs font-black border-2 border-black flex items-center gap-1.5 ${
              activeTab === 'time' ? 'bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white dark:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Clock & Time (시·분)
          </button>
          <button
            onClick={() => setActiveTab('hangul_decoder')}
            className={`px-3 py-1 text-xs font-black border-2 border-black flex items-center gap-1.5 transition-all ${
              activeTab === 'hangul_decoder'
                ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                : 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> ⚡ Hangul Decoder
          </button>
        </div>
      </div>

      {/* SUB MODULE 1: HIGH NUMBERS */}
      {activeTab === 'high_numbers' && (
        <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-6">
          <div>
            <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 border border-black">
              Interactive 4 Digit Grouping (만 = 10,000)
            </span>
            <h3 className="text-2xl font-black mt-2">Sino Korean Number Visualizer</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select or slide a number. Say the Korean reading in your head, then check the result.
            </p>
          </div>

          {/* Value Card */}
          <div className="bg-slate-50 dark:bg-slate-800 border-2 border-black p-5 sm:p-6 text-center flex flex-col items-center">
            <ScoreHeaderBar
              title="Target Value"
              stats={highStats.stats}
              onReset={highStats.resetStats}
            />

            <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {sliderVal.toLocaleString()} 원
            </div>

            {/* Spoken Korean Answer Box */}
            {revealedHighNumber && (
              <div className="mt-4 p-4 bg-white dark:bg-slate-900 border-2 border-black w-full max-w-md">
                <span className="text-xs font-black text-slate-400 uppercase">Spoken Korean</span>
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {numberToSinoKorean(sliderVal)} 원이에요
                </div>
              </div>
            )}

            <PracticeActionBar
              randomLabel="Random Number"
              revealed={revealedHighNumber}
              onRandom={handleRandomHighNumber}
              onToggleReveal={() => setRevealedHighNumber(!revealedHighNumber)}
              onWrong={() => highStats.markWrong(() => setRevealedHighNumber(true))}
              onRight={() => highStats.markRight(handleRandomHighNumber)}
            />
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-black">
              <span>0원</span>
              <span>10,000원 (만)</span>
              <span>100,000원 (십만)</span>
              <span>1,000,000원 (백만)</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000000"
              step="500"
              value={sliderVal}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 border-2 border-black accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {[100, 1000, 4500, 10000, 45000, 76000, 110000, 1150000].map((val) => (
              <button
                key={val}
                onClick={() => handleSliderChange(val)}
                className={`px-3 py-1.5 text-xs font-black border-2 border-black ${
                  sliderVal === val ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800'
                }`}
              >
                {val.toLocaleString()}원
              </button>
            ))}
          </div>

          {/* Rule Box */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-2 border-black text-xs text-amber-950 dark:text-amber-200 flex flex-col gap-1.5">
            <strong>⚠️ Anti Trap Rule: Drop "일" on Single Base Units</strong>
            <span>100 is <strong>백</strong> (never 일백). 1,000 is <strong>천</strong> (never 일천). 10,000 is <strong>만</strong> (never 일만).</span>
          </div>
        </div>
      )}

      {/* SUB MODULE 2: PHONE NUMBERS */}
      {activeTab === 'phone' && (
        <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-6">
          <div>
            <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 border border-black">
              Spoken Phone Number Protocol
            </span>
            <h3 className="text-2xl font-black mt-2">Dashes are Spoken as "에" [에]</h3>
            <p className="text-xs text-slate-500 mt-1">
              Read the phone number block by block. Check the result when you have formulated your answer.
            </p>
          </div>

          {/* Phone Display Card */}
          <div className="bg-slate-900 text-white border-[3px] border-black p-6 flex flex-col items-center text-center">
            <ScoreHeaderBar
              title="Target Phone Number"
              stats={phoneStats.stats}
              onReset={phoneStats.resetStats}
            />

            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
              {currentPhone.label}
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-widest font-mono text-emerald-400">
              {currentPhone.num}
            </div>

            {/* Answer Box */}
            {revealedPhone && (
              <div className="mt-5 p-4 bg-slate-800 border-2 border-emerald-400 w-full max-w-lg">
                <span className="text-xs font-black uppercase text-slate-300">Spoken Reading</span>
                <div className="text-xl sm:text-2xl font-black mt-1 text-white">
                  {currentPhone.spoken}
                </div>
                <div className="text-sm font-bold text-amber-300 mt-2">
                  Phonetic Liaison: {currentPhone.pron}
                </div>
              </div>
            )}

            <PracticeActionBar
              randomLabel="Random Phone"
              revealed={revealedPhone}
              onRandom={handleRandomPhone}
              onToggleReveal={() => setRevealedPhone(!revealedPhone)}
              onWrong={() => phoneStats.markWrong(() => setRevealedPhone(true))}
              onRight={() => phoneStats.markRight(handleRandomPhone)}
            />
          </div>

          {/* Golden Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-black">
              <strong>1. Dash (-) → 에</strong>
              <p className="text-slate-600 dark:text-slate-400 mt-1">010 3248 becomes 공일공<strong>에</strong> 삼이사팔<strong>에</strong>.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-black">
              <strong>2. 0 → Always 공</strong>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Never say 영 in telephone or mobile numbers.</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-2 border-black">
              <strong>3. Ending → 이에요</strong>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Add 이에요 with batchim liaison to the final digit.</p>
            </div>
          </div>
        </div>
      )}

      {/* SUB MODULE 3: FLOORS */}
      {activeTab === 'floors' && (
        <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-6">
          <div>
            <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 border border-black">
              Building Floor Counter (층)
            </span>
            <h3 className="text-2xl font-black mt-2">식당이 어디에 있어요?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select a floor or generate a random challenge. Speak the answer aloud, then verify.
            </p>
          </div>

          {/* Interactive Building Stack */}
          <div className="flex flex-col-reverse gap-2 max-w-xl mx-auto w-full">
            {floorKeys.map((fl) => (
              <button
                key={fl}
                onClick={() => handleFloorSelect(fl)}
                className={`p-3 border-2 border-black flex items-center justify-between text-left transition-transform active:translate-x-1 ${
                  selectedFloor === fl
                    ? 'bg-amber-400 text-black font-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-8 bg-black text-white grid place-items-center font-black text-xs">
                    {fl < 0 ? `B${Math.abs(fl)}` : `${fl}F`}
                  </span>
                  <span className="text-sm font-black">{floorDirectory[fl].name}</span>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {selectedFloor === fl ? 'Selected' : 'Tap to select'}
                </span>
              </button>
            ))}
          </div>

          {/* Current Selected Floor Dialogue Box */}
          <div className="p-5 bg-sky-50 dark:bg-sky-950/40 border-[3px] border-black text-center flex flex-col items-center">
            <ScoreHeaderBar
              title="Floor Dialogue Prompt"
              stats={floorStats.stats}
              onReset={floorStats.resetStats}
            />

            <div className="text-xl font-black mt-2">
              가: {floorDirectory[selectedFloor].name.split(' ')[0]}이/가 어디에 있어요?
            </div>
            <div className="text-xs font-bold text-slate-500 mt-1">
              Target: {selectedFloor < 0 ? `B${Math.abs(selectedFloor)}` : `${selectedFloor}F`} ({floorDirectory[selectedFloor].name})
            </div>

            {/* Answer Box */}
            {revealedFloor && (
              <div className="mt-4 p-4 bg-white dark:bg-slate-900 border-2 border-black w-full max-w-md">
                <span className="text-xs font-black text-slate-400 uppercase">Answer</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  나: {selectedFloor < 0 ? `지하 ${numberToSinoKorean(Math.abs(selectedFloor))} 층` : `${numberToSinoKorean(selectedFloor)} 층`}에 있어요.
                </div>
              </div>
            )}

            <PracticeActionBar
              randomLabel="Random Floor"
              revealed={revealedFloor}
              onRandom={handleRandomFloor}
              onToggleReveal={() => setRevealedFloor(!revealedFloor)}
              onWrong={() => floorStats.markWrong(() => setRevealedFloor(true))}
              onRight={() => floorStats.markRight(handleRandomFloor)}
            />
          </div>
        </div>
      )}

      {/* SUB MODULE 4: PRICES */}
      {activeTab === 'prices' && (
        <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-6">
          <div>
            <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 border border-black">
              Commercial Price Practice
            </span>
            <h3 className="text-2xl font-black mt-2">{currentPriceItem.name} 얼마예요?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Read the price tag. State the full answer aloud, then check result.
            </p>
          </div>

          {/* Flash Price Item */}
          <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800 border-[3px] border-black text-center flex flex-col items-center">
            <ScoreHeaderBar
              title="Commercial Price Drill"
              stats={priceStats.stats}
              onReset={priceStats.resetStats}
            />

            <span className="text-xs font-black uppercase text-slate-400 mt-2">Current Item</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {currentPriceItem.name}
            </div>
            <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-4">
              {currentPriceItem.price.toLocaleString()}원
            </div>

            {revealedPrice && (
              <div className="mt-6 p-4 bg-white dark:bg-slate-900 border-2 border-black w-full max-w-md">
                <span className="text-xs font-black text-slate-400 uppercase">Spoken Answer</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {currentPriceItem.name.split(' ')[0]}{currentPriceItem.particle} {currentPriceItem.korean}
                </div>
              </div>
            )}

            <PracticeActionBar
              randomLabel="Random Price"
              revealed={revealedPrice}
              onRandom={handleRandomPrice}
              onToggleReveal={() => setRevealedPrice(!revealedPrice)}
              onWrong={() => priceStats.markWrong(() => setRevealedPrice(true))}
              onRight={() => priceStats.markRight(handleRandomPrice)}
            />
          </div>
        </div>
      )}

      {/* SUB MODULE 5: CALENDAR TRAPS */}
      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-6">
          <div>
            <span className="text-xs font-black uppercase text-rose-600 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 border border-black">
              Phonetic Irregular Traps
            </span>
            <h3 className="text-2xl font-black mt-2">1월 to 12월 (Months of the Year)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select any month or drill randomly. Guess the pronunciation, then check result to verify.
            </p>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const isSelected = selectedMonth === m;
              return (
                <button
                  key={m}
                  onClick={() => handleMonthSelect(m)}
                  className={`p-3 border-2 border-black flex flex-col items-center justify-center text-center transition-transform active:translate-y-0.5 ${
                    isSelected
                      ? 'bg-black text-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span className="text-lg font-black">{m}월</span>
                  <span className="text-xs text-slate-400 mt-0.5">Month {m}</span>
                </button>
              );
            })}
          </div>

          {/* Trap Detail Box */}
          <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border-2 border-black text-center flex flex-col items-center">
            <ScoreHeaderBar
              title={`Selected: ${selectedMonth}월`}
              stats={calendarStats.stats}
              onReset={calendarStats.resetStats}
            />

            <h4 className="text-base font-black text-amber-900 dark:text-amber-200 mt-2">
              {selectedMonth}월 Drill Target
            </h4>

            {revealedMonth && (
              <div className="mt-3 p-4 bg-white dark:bg-slate-900 border-2 border-black w-full max-w-md">
                <span className="text-xs font-black text-slate-400 uppercase">Correct Spoken Reading</span>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {calendarIrregulars[selectedMonth].display}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {calendarIrregulars[selectedMonth].note}
                </p>
              </div>
            )}

            <PracticeActionBar
              randomLabel="Random Month"
              revealed={revealedMonth}
              onRandom={handleRandomMonth}
              onToggleReveal={() => setRevealedMonth(!revealedMonth)}
              onWrong={() => calendarStats.markWrong(() => setRevealedMonth(true))}
              onRight={() => calendarStats.markRight(handleRandomMonth)}
            />
          </div>
        </div>
      )}

      {/* SUB MODULE 6: CLOCK & TIME (시·분) */}
      {activeTab === 'time' && (() => {
        const timeInfo = getPhoneticTime(selectedPeriod, selectedHour, selectedMinute);
        const formattedDigital = `${selectedPeriod} ${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
        const currentHourInfo = hourData[selectedHour] || { word: `${selectedHour}시`, note: 'Regular' };
        
        return (
          <div className="bg-white dark:bg-slate-900 border-[3px] border-black p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col gap-6">
            <div>
              <span className="text-xs font-black uppercase text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 border border-black">
                Dual Number Clock Architecture
              </span>
              <h3 className="text-2xl font-black mt-2">Hours: Native (시) • Minutes: Sino (분)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Say the full time in Korean for "지금 몇 시예요?". Reveal the result to verify Native Korean hour contractions and Sino Korean minutes.
              </p>
            </div>

            {/* Main Interactive Clock Display Card */}
            <div className="bg-slate-900 text-white border-[3px] border-black p-6 flex flex-col items-center text-center">
              <ScoreHeaderBar
                title="Target Clock Time"
                stats={timeStats.stats}
                onReset={timeStats.resetStats}
              />

              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => { setSelectedPeriod(p => p === '오전' ? '오후' : '오전'); setRevealedTime(false); }}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-black text-xs font-black border-2 border-black tracking-wider uppercase active:translate-y-0.5"
                >
                  {selectedPeriod} ({selectedPeriod === '오전' ? 'AM' : 'PM'}) ⇄
                </button>
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                  지금 몇 시예요?
                </span>
              </div>

              {/* Digital Clock Display */}
              <div className="text-4xl sm:text-6xl font-black tracking-widest font-mono text-emerald-400 my-4 drop-shadow-[0_2px_10px_rgba(52,211,153,0.3)]">
                {formattedDigital}
              </div>

              {/* Revealed Answer Box */}
              {revealedTime && (
                <div className="mt-4 p-5 bg-slate-800 border-2 border-emerald-400 w-full max-w-xl text-left flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Primary Spoken Korean
                    </span>
                    <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                      {timeInfo.fullSpoken}
                    </div>
                  </div>

                  {timeInfo.altSpoken && (
                    <div className="pt-2 border-t border-slate-700">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                        Casual Half-Past Shortcut (반)
                      </span>
                      <div className="text-lg font-black text-amber-200 mt-0.5">
                        {timeInfo.altSpoken}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-700">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Phonetic Liaison (연음 발음)
                    </span>
                    <div className="text-sm font-bold text-emerald-300 mt-0.5">
                      {timeInfo.pronunciation}
                    </div>
                  </div>

                  {/* Component Breakdown Badges */}
                  <div className="pt-2 border-t border-slate-700 flex flex-wrap gap-1.5 text-xs">
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-200 border border-slate-600 rounded">
                      구분: <strong>{selectedPeriod}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-900 text-indigo-200 border border-indigo-700 rounded">
                      시 (고유어): <strong>{currentHourInfo.word}</strong> ({currentHourInfo.note})
                    </span>
                    {selectedMinute > 0 && (
                      <span className="px-2 py-0.5 bg-emerald-900 text-emerald-200 border border-emerald-700 rounded">
                        분 (한자어): <strong>{formatMinuteSino(selectedMinute)}</strong>
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-amber-900 text-amber-200 border border-amber-700 rounded">
                      서술격 조사: <strong>{selectedMinute > 0 ? '이에요 (받침 ㄴ)' : '예요 (모음 ㅣ)'}</strong>
                    </span>
                  </div>
                </div>
              )}

              <PracticeActionBar
                randomLabel="Random Time"
                revealed={revealedTime}
                onRandom={handleRandomTime}
                onToggleReveal={() => setRevealedTime(!revealedTime)}
                onWrong={() => timeStats.markWrong(() => setRevealedTime(true))}
                onRight={() => timeStats.markRight(handleRandomTime)}
              />
            </div>

            {/* Quick Interactive Selectors */}
            <div className="flex flex-col gap-4">
              {/* Hours Grid (1 to 12) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    1. Hours (고유어 수사 축약형 + 시)
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    Trap: 1, 2, 3, 4, 11, 12 drop final consonant
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
                    const isSelected = selectedHour === h;
                    const info = hourData[h];
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleHourSelect(h)}
                        className={`p-2.5 border-2 border-black flex flex-col items-center justify-center transition-transform active:translate-y-0.5 ${
                          isSelected
                            ? 'bg-black text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-base font-black">{h}시</span>
                        <span className={`text-[11px] font-bold ${info.trap ? 'text-amber-500 font-black' : 'text-slate-400'}`}>
                          {info.word}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minutes Quick Buttons */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    2. Minutes (한자어 수사 + 분)
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">
                    30분 = 삼십 분 (또는 반)
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => {
                    const isSelected = selectedMinute === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleMinuteSelect(m)}
                        className={`p-2 border-2 border-black flex flex-col items-center justify-center transition-transform active:translate-y-0.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-sm font-black">{String(m).padStart(2, '0')}분</span>
                        <span className="text-[10px] text-slate-400">
                          {m === 0 ? '정각' : m === 30 ? '반 / 삼십분' : `${formatMinuteSino(m)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Minute Slider for custom minutes */}
                <div className="mt-3 flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 border-2 border-black">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Exact Minute ({selectedMinute}분):
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="59"
                    step="1"
                    value={selectedMinute}
                    onChange={(e) => handleMinuteSelect(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 border-2 border-black accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Core Architectural Rules Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border-2 border-black flex flex-col gap-1">
                <strong className="text-indigo-950 dark:text-indigo-200">1. 시 = Native Korean</strong>
                <p className="text-slate-600 dark:text-slate-400">
                  Hours use Native numbers in modified form: <strong>한, 두, 세, 네, 열한, 열두</strong>. Never say 일 시 or 이 시!
                </p>
              </div>
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border-2 border-black flex flex-col gap-1">
                <strong className="text-emerald-950 dark:text-emerald-200">2. 분 = Sino Korean</strong>
                <p className="text-slate-600 dark:text-slate-400">
                  Minutes use regular Sino numbers: <strong>일 분, 오 분, 십 분, 십오 분, 사십 분</strong>.
                </p>
              </div>
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border-2 border-black flex flex-col gap-1">
                <strong className="text-amber-950 dark:text-amber-200">3. Half Past = 반</strong>
                <p className="text-slate-600 dark:text-slate-400">
                  30 minutes can always be shortened to <strong>반</strong>: 두 시 삼십 분 = <strong>두 시 반</strong>.
                </p>
              </div>
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border-2 border-black flex flex-col gap-1">
                <strong className="text-rose-950 dark:text-rose-200">4. 이에요 vs 예요 Copula</strong>
                <p className="text-slate-600 dark:text-slate-400">
                  Minutes ending in <strong>분/반</strong> (consonant ㄴ) take <strong>이에요</strong>. On-the-hour <strong>시</strong> (vowel) takes <strong>예요</strong>.
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SUB MODULE 7: HANGUL DECODER FLASHCARDS */}
      {activeTab === 'hangul_decoder' && (
        <HangulDecoderStage />
      )}
    </div>
  );
}
