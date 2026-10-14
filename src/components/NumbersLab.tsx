import React, { useState, useMemo } from 'react';
import { Hash, Phone, Building2, ShoppingBag, Calendar, ArrowRight, Eye, EyeOff } from 'lucide-react';

type SubTab = 'high_numbers' | 'phone' | 'floors' | 'prices' | 'calendar';

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

export default function NumbersLab() {
  const [activeTab, setActiveTab] = useState<SubTab>('high_numbers');

  // Sub Module 1: High Numbers State
  const [sliderVal, setSliderVal] = useState<number>(45000);
  const [revealedHighNumber, setRevealedHighNumber] = useState(false);

  // Sub Module 2: Phone Numbers State
  const [phoneSeed, setPhoneSeed] = useState(0);
  const [revealedPhone, setRevealedPhone] = useState(false);
  const phoneNumbers = useMemo(() => [
    { num: '010 8113 7787', label: "Paul's Mobile", spoken: '공일공에 팔일일삼에 칠칠팔칠이에요', pron: '[공일공에 파릴이리사메 칠칠팔치리에요]' },
    { num: '010 3248 1931', label: "Irina's Mobile", spoken: '공일공에 삼이사팔에 일구삼일이에요', pron: '[공일공에 삼이사파레 일구사미리에요]' },
    { num: '02 735 9240', label: "Seoul Office Landline", spoken: '공이에 칠삼오에 구이사공이에요', pron: '[공이에 칠삼오에 구이사공이에요]' },
    { num: '031 261 8703', label: "Gyeonggi Business Line", spoken: '공삼일에 이육일에 팔칠공삼이에요', pron: '[공사미레 이유기레 팔칠공사미에요]' },
    { num: '064 628 9537', label: "Jeju Hotel Line", spoken: '공육사에 육이팔에 구오삼칠이에요', pron: '[공육사에 유기파레 구오삼치리에요]' },
  ], []);
  const currentPhone = phoneNumbers[phoneSeed % phoneNumbers.length];

  // Sub Module 3: Floor Navigator State
  const [selectedFloor, setSelectedFloor] = useState<number>(4);
  const [revealedFloor, setRevealedFloor] = useState(false);
  const floorDirectory: Record<number, { name: string; korean: string }> = {
    6: { name: 'Cinema (영화관)', korean: '육 층' },
    5: { name: 'Bag Store (가방 가게)', korean: '오 층' },
    4: { name: 'Restaurant (식당)', korean: '사 층' },
    3: { name: 'Shoe Store (신발 가게)', korean: '삼 층' },
    2: { name: 'Clothing Store (옷 가게)', korean: '이 층' },
    1: { name: 'Lobby & Boutique (로비 / 매장)', korean: '일 층' },
    [-1]: { name: 'Underground Parking (지하 주차장)', korean: '지하 일 층' },
  };

  // Sub Module 4: Price Matcher State
  const [priceItemIdx, setPriceItemIdx] = useState(0);
  const [revealedPrice, setRevealedPrice] = useState(false);
  const priceItems = useMemo(() => [
    { name: '바지 (Pants)', price: 76000, korean: '칠만 육천 원이에요', particle: '가' },
    { name: '모자 (Hat)', price: 9000, korean: '구천 원이에요', particle: '가' },
    { name: '가방 (Bag)', price: 35000, korean: '삼만 오천 원이에요', particle: '이' },
    { name: '안경 (Glasses)', price: 110000, korean: '십일만 원이에요', particle: '이' },
    { name: '구두 (Shoes)', price: 28000, korean: '이만 팔천 원이에요', particle: '가' },
    { name: '컴퓨터 (Computer)', price: 1150000, korean: '백십오만 원이에요', particle: '가' },
    { name: '책 (Book)', price: 21000, korean: '이만 천 원이에요', particle: '이' },
    { name: '지갑 (Wallet)', price: 49500, korean: '사만 구천오백 원이에요', particle: '이' },
  ], []);
  const currentPriceItem = priceItems[priceItemIdx % priceItems.length];

  // Sub Module 5: Calendar Traps
  const [selectedMonth, setSelectedMonth] = useState<number>(6);
  const [revealedMonth, setRevealedMonth] = useState(false);
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
          <div className="bg-slate-50 dark:bg-slate-800 border-2 border-black p-6 text-center flex flex-col items-center">
            <span className="text-xs font-black uppercase text-slate-400">Target Value</span>
            <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {sliderVal.toLocaleString()} 원
            </div>

            {/* Hidden Result Gate */}
            {revealedHighNumber ? (
              <div className="mt-5 p-4 bg-white dark:bg-slate-900 border-2 border-black w-full max-w-md">
                <span className="text-xs font-black text-slate-400 uppercase">Spoken Korean</span>
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {numberToSinoKorean(sliderVal)} 원이에요
                </div>
                <button
                  onClick={() => setRevealedHighNumber(false)}
                  className="mt-3 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-black text-xs font-bold flex items-center gap-1 mx-auto"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Result</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setRevealedHighNumber(true)}
                className="mt-5 px-6 py-3 bg-black hover:bg-slate-800 text-white font-black text-sm border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Check Result (정답 확인)</span>
              </button>
            )}
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
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
              {currentPhone.label}
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-widest font-mono text-emerald-400">
              {currentPhone.num}
            </div>

            {/* Hidden Result Gate */}
            {revealedPhone ? (
              <div className="mt-5 p-4 bg-slate-800 border-2 border-emerald-400 w-full max-w-lg">
                <span className="text-xs font-black uppercase text-slate-300">Spoken Reading</span>
                <div className="text-xl sm:text-2xl font-black mt-1 text-white">
                  {currentPhone.spoken}
                </div>
                <div className="text-sm font-bold text-amber-300 mt-2">
                  Phonetic Liaison: {currentPhone.pron}
                </div>
                <button
                  onClick={() => setRevealedPhone(false)}
                  className="mt-3 px-3 py-1 bg-slate-700 hover:bg-slate-600 border border-slate-500 text-xs font-bold flex items-center gap-1 mx-auto text-white"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Result</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setRevealedPhone(true)}
                className="mt-5 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-sm border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Check Result (발음 확인)</span>
              </button>
            )}
          </div>

          {/* Next Phone Number Button */}
          <button
            onClick={() => {
              setPhoneSeed((s) => s + 1);
              setRevealedPhone(false);
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-black font-black text-sm flex items-center justify-center gap-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            <span>Next Phone Number Drill</span>
            <ArrowRight className="w-4 h-4" />
          </button>

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
              Select a floor. Speak the answer aloud, then click Check Result to verify.
            </p>
          </div>

          {/* Interactive Building Stack */}
          <div className="flex flex-col-reverse gap-2 max-w-xl mx-auto w-full">
            {[-1, 1, 2, 3, 4, 5, 6].map((fl) => (
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
                    {fl === -1 ? 'B1' : `${fl}F`}
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
            <div className="text-xs font-black text-sky-800 dark:text-sky-300 uppercase">
              Dialogue Prompt for {floorDirectory[selectedFloor].name}
            </div>
            <div className="text-xl font-black mt-2">
              가: {floorDirectory[selectedFloor].name.split(' ')[0]}이/가 어디에 있어요?
            </div>

            {/* Hidden Result Gate */}
            {revealedFloor ? (
              <div className="mt-4 p-4 bg-white dark:bg-slate-900 border-2 border-black w-full max-w-md">
                <span className="text-xs font-black text-slate-400 uppercase">Answer</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  나: {selectedFloor === -1 ? '지하 일 층' : `${numberToSinoKorean(selectedFloor)} 층`}에 있어요.
                </div>
                <button
                  onClick={() => setRevealedFloor(false)}
                  className="mt-3 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-black text-xs font-bold flex items-center gap-1 mx-auto"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Result</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setRevealedFloor(true)}
                className="mt-4 px-6 py-3 bg-black hover:bg-slate-800 text-white font-black text-sm border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Check Result (답변 확인)</span>
              </button>
            )}
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
            <h3 className="text-2xl font-black mt-2">{currentPriceItem.name}이/가 얼마예요?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Read the price tag. State the full answer aloud, then click Check Result.
            </p>
          </div>

          {/* Flash Price Item */}
          <div className="p-8 bg-slate-50 dark:bg-slate-800 border-[3px] border-black text-center flex flex-col items-center">
            <span className="text-xs font-black uppercase text-slate-400">Current Item</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {currentPriceItem.name}
            </div>
            <div className="text-5xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-4">
              {currentPriceItem.price.toLocaleString()}원
            </div>

            {revealedPrice ? (
              <div className="mt-6 p-4 bg-white dark:bg-slate-900 border-2 border-black w-full max-w-md">
                <span className="text-xs font-black text-slate-400 uppercase">Spoken Answer</span>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {currentPriceItem.name.split(' ')[0]}{currentPriceItem.particle} {currentPriceItem.korean}
                </div>
                <button
                  onClick={() => setRevealedPrice(false)}
                  className="mt-3 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-black text-xs font-bold flex items-center gap-1 mx-auto"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Result</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setRevealedPrice(true)}
                className="mt-6 px-6 py-3 bg-black hover:bg-slate-800 text-white font-black text-sm border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Check Result (가격 말하기)</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setPriceItemIdx((i) => i + 1);
              setRevealedPrice(false);
            }}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-black font-black text-sm flex items-center justify-center gap-2 shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            <span>Next Price Drill</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
              Select any month. Guess the pronunciation, then click Check Result to verify.
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

          {/* Trap Detail Box with Hidden Result Gate */}
          <div className="p-5 bg-amber-50 dark:bg-amber-950/40 border-2 border-black text-center flex flex-col items-center">
            <h4 className="text-sm font-black text-amber-900 dark:text-amber-200">
              Selected: {selectedMonth}월
            </h4>

            {revealedMonth ? (
              <div className="mt-3 p-4 bg-white dark:bg-slate-900 border-2 border-black w-full max-w-md">
                <span className="text-xs font-black text-slate-400 uppercase">Correct Spoken Reading</span>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                  {calendarIrregulars[selectedMonth].display}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  {calendarIrregulars[selectedMonth].note}
                </p>
                <button
                  onClick={() => setRevealedMonth(false)}
                  className="mt-3 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-black text-xs font-bold flex items-center gap-1 mx-auto"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Hide Result</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setRevealedMonth(true)}
                className="mt-3 px-6 py-2.5 bg-black hover:bg-slate-800 text-white font-black text-sm border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Check Result (월 발음 확인)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
