import { useState } from 'react';
import { BookOpen, Sparkles, Flame, Hash, PenTool, Smartphone, Zap } from 'lucide-react';
import { SUBJECTS, OBJECTS, VERBS } from './data';
import LearnMode from './components/LearnMode';
import GrammarMode from './components/GrammarMode';
import BatchimGame from './components/BatchimGame';
import ParticleTrainer from './components/ParticleTrainer';
import NumbersLab from './components/NumbersLab';
import StylusTrainer from './components/StylusTrainer';
import SmartphoneMode from './components/SmartphoneMode';
import { Word } from './types';

type ModuleTab = 'vocab' | 'grammar' | 'particle' | 'batchim' | 'numbers' | 'stylus' | 'smartphone';

const INITIAL_VOCAB: { subjects: Word[]; objects: Word[]; verbs: Word[] } = {
  subjects: SUBJECTS,
  objects: OBJECTS,
  verbs: VERBS
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>(() => {
    try {
      const saved = localStorage.getItem('korean_app_active_module') as ModuleTab;
      return ['vocab', 'grammar', 'particle', 'batchim', 'numbers', 'stylus', 'smartphone'].includes(saved) ? saved : 'smartphone';
    } catch {
      return 'smartphone';
    }
  });

  const handleTabChange = (tab: ModuleTab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem('korean_app_active_module', tab);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Persistent Navigation Bar with safe-top padding for camera notch/cutout */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b-[3px] border-black px-3 sm:px-4 py-2 sm:py-2.5 shadow-[0_3px_0_0_rgba(0,0,0,1)] safe-top">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          {/* Logo / Branding */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <span className="w-8 h-8 sm:w-9 sm:h-9 grid place-items-center bg-black text-white font-black text-sm sm:text-base border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              한
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-none">
                  Korean Practice
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border border-black">
                  Sogang 1A
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                Smartphone, Vocab, Grammar, Particle Duel, Batchim, Numbers & Stylus Trainer
              </p>
            </div>
          </div>

          {/* Module Switcher Tabs */}
          <nav className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto pb-0.5 md:pb-0 scrollbar-none">
            <button
              onClick={() => handleTabChange('smartphone')}
              className={`flex-1 md:flex-none min-h-10 px-3 py-1.5 border-2 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 whitespace-nowrap ${
                activeTab === 'smartphone'
                  ? 'bg-purple-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>스마트폰 Mobile</span>
            </button>

            <button
              onClick={() => handleTabChange('vocab')}
              className={`flex-1 md:flex-none min-h-10 px-3 py-1.5 border-2 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 whitespace-nowrap ${
                activeTab === 'vocab'
                  ? 'bg-indigo-600 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>단어 Vocab</span>
            </button>

            <button
              onClick={() => handleTabChange('particle')}
              className={`flex-1 md:flex-none min-h-10 px-3 py-1.5 border-2 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 whitespace-nowrap ${
                activeTab === 'particle'
                  ? 'bg-amber-500 text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>조사 Particles</span>
            </button>

            <button
              onClick={() => handleTabChange('grammar')}
              className={`flex-1 md:flex-none min-h-10 px-3 py-1.5 border-2 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 whitespace-nowrap ${
                activeTab === 'grammar'
                  ? 'bg-amber-400 text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>문법 Grammar</span>
            </button>

            <button
              onClick={() => handleTabChange('batchim')}
              className={`flex-1 md:flex-none min-h-10 px-3 py-1.5 border-2 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 whitespace-nowrap ${
                activeTab === 'batchim'
                  ? 'bg-rose-500 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>받침 Batchim</span>
            </button>

            <button
              onClick={() => handleTabChange('numbers')}
              className={`flex-1 md:flex-none min-h-10 px-3 py-1.5 border-2 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 whitespace-nowrap ${
                activeTab === 'numbers'
                  ? 'bg-emerald-500 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>숫자 Numbers</span>
            </button>

            <button
              onClick={() => handleTabChange('stylus')}
              className={`flex-1 md:flex-none min-h-10 px-3 py-1.5 border-2 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform active:translate-y-0.5 whitespace-nowrap ${
                activeTab === 'stylus'
                  ? 'bg-sky-500 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>자모 Stylus</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full p-2 sm:p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'smartphone' && <SmartphoneMode />}
          {activeTab === 'vocab' && <LearnMode vocab={INITIAL_VOCAB} />}
          {activeTab === 'grammar' && <GrammarMode onBackToVocab={() => handleTabChange('vocab')} />}
          {activeTab === 'particle' && <ParticleTrainer />}
          {activeTab === 'batchim' && <BatchimGame />}
          {activeTab === 'numbers' && <NumbersLab />}
          {activeTab === 'stylus' && <StylusTrainer />}
        </div>
      </main>
    </div>
  );
}
