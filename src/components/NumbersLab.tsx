import React, { useState, useMemo } from 'react';
import { Hash, Phone, Building2, ShoppingBag, Calendar, Eye, EyeOff, Shuffle, Check, X } from 'lucide-react';

type SubTab = 'high_numbers' | 'phone' | 'floors' | 'prices' | 'calendar';

interface PracticeStats {
  right: number;
  wrong: number;
  streak: number;
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

  const priceItems = useMemo(() => [
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
  ], []);

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
    </div>
  );
}
