import { useState, useEffect } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { SUBJECTS, OBJECTS, VERBS } from './data';
import LearnMode from './components/LearnMode';
import GrammarMode from './components/GrammarMode';
import { Word } from './types';

type ModuleTab = 'vocab' | 'grammar';

const INITIAL_VOCAB: { subjects: Word[]; objects: Word[]; verbs: Word[] } = {
  subjects: SUBJECTS,
  objects: OBJECTS,
  verbs: VERBS
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>(() => {
    try {
      const saved = localStorage.getItem('korean_app_active_module');
      return (saved === 'grammar' || saved === 'vocab') ? saved : 'vocab';
    } catch {
      return 'vocab';
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
      {/* Top Persistent Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b-[3px] border-black px-4 py-3 shadow-[0_3px_0_0_rgba(0,0,0,1)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo / Branding */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <span className="w-9 h-9 grid place-items-center bg-black text-white font-black text-base border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              한
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight leading-none">
                  Korean Practice
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border border-black">
                  Sogang 1A
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                Vocabulary Memorization & Grammar Mastery
              </p>
            </div>
          </div>

          {/* Module Switcher Tabs */}
          <nav className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleTabChange('vocab')}
              className={`flex-1 sm:flex-none min-h-11 px-4 py-2 border-2 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:translate-y-0.5 ${
                activeTab === 'vocab'
                  ? 'bg-indigo-600 text-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>단어 Vocabulary</span>
            </button>

            <button
              onClick={() => handleTabChange('grammar')}
              className={`flex-1 sm:flex-none min-h-11 px-4 py-2 border-2 border-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:translate-y-0.5 ${
                activeTab === 'grammar'
                  ? 'bg-amber-400 text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>문법 Grammar</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full p-3 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'vocab' ? (
            <LearnMode vocab={INITIAL_VOCAB} />
          ) : (
            <GrammarMode onBackToVocab={() => handleTabChange('vocab')} />
          )}
        </div>
      </main>
    </div>
  );
}
