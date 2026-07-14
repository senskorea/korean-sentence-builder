import { useState } from 'react';
import { Word, EndingOption, StepState } from '../types';
import { ENDINGS } from '../data';
import { Info, X, ChevronLeft, ChevronRight } from 'lucide-react';

const LESSON_DATA = {
  particles: [
    {
      title: 'Topic Particle',
      content: '은/는 marks the general topic of the sentence. It can carry a nuance of contrast ("as for..."). Use 은 if the noun ends in a consonant (batchim), and 는 if it ends in a vowel.',
      example: '저는 학생입니다. (As for me, I am a student.)'
    },
    {
      title: 'Subject Particle',
      content: '이/가 marks the specific subject performing the action. It emphasizes WHO or WHAT did it. Use 이 for consonants and 가 for vowels.',
      example: '비가 와요. (The rain is coming.)'
    },
    {
      title: 'Object Particle',
      content: '을/를 marks the direct object of the verb. It shows what the action is happening to. Use 을 for consonants and 를 for vowels.',
      example: '사과를 먹어요. (I eat an apple.)'
    }
  ],
  tense: [
    {
      title: 'Present Tense (-아/어/여요)',
      content: 'This is the polite present tense. The vowel of the verb stem determines which ending to use (Vowel Harmony): bright vowels (ㅏ, ㅗ) take 아요, dark vowels take 어요, and 하 becomes 해요.',
      example: '가다 -> 가요 (Go), 먹다 -> 먹어요 (Eat)'
    },
    {
      title: 'Past Tense (-았/었/였어요)',
      content: 'Follows the same vowel harmony rules as the present tense, but adds a double-siot (ㅆ) to indicate the past.',
      example: '가다 -> 갔어요 (Went), 먹다 -> 먹었어요 (Ate)'
    },
    {
      title: 'Future Tense (-(으)ㄹ 거예요)',
      content: 'Expresses future plans or probability. Use 을 거예요 if the stem ends in a consonant, and ㄹ 거예요 if it ends in a vowel.',
      example: '갈 거예요 (I will go), 먹을 거예요 (I will eat)'
    },
    {
      title: 'Desire (-고 싶어요)',
      content: 'Expresses wanting to do the verb. This ending is very simple: just attach -고 싶어요 to the verb stem, regardless of vowels or consonants.',
      example: '가고 싶어요 (I want to go)'
    }
  ]
};

interface AgglutinationDrawerProps {
  currentStep: StepState;
  selectedSubject: Word | null;
  selectedObject: Word | null;
  selectedVerb: Word | null;
  bypassMode: boolean;
  onAttachSubjectParticle: (particle: string) => void;
  onAttachObjectParticle: (particle: string) => void;
  onSelectEnding: (ending: EndingOption) => void;
  subjectParticle: string;
  objectParticle: string;
  selectedEnding: EndingOption | null;
}

// Helper to determine vowel harmony for visual highlighting
const getVowelHarmony = (stem?: string) => {
  if (!stem) return 'neutral';
  if (stem.endsWith('하')) return 'ha'; // 해요 (여요)
  if (['만나', '가', '사', '보', '오', '좋아하'].some(s => stem.endsWith(s))) return 'bright'; // 아요
  if (['마시', '주', '보내', '먹', '읽', '있', '없'].some(s => stem.endsWith(s))) return 'dark'; // 어요
  return 'neutral';
};

export default function AgglutinationDrawer({
  currentStep,
  selectedSubject,
  selectedObject,
  selectedVerb,
  bypassMode,
  onAttachSubjectParticle,
  onAttachObjectParticle,
  onSelectEnding,
  subjectParticle,
  objectParticle,
  selectedEnding,
}: AgglutinationDrawerProps) {
  
  const subjectHasBatchim = selectedSubject?.hasBatchim || false;
  const objectHasBatchim = selectedObject?.hasBatchim || false;
  const harmony = getVowelHarmony(selectedVerb?.stem);

  const [isFlipped, setIsFlipped] = useState(false);
  const [lessonType, setLessonType] = useState<'particles' | 'tense'>('particles');
  const [currentSlide, setCurrentSlide] = useState(0);

  const flipToLesson = (type: 'particles' | 'tense') => {
    setLessonType(type);
    setCurrentSlide(0);
    setIsFlipped(true);
  };

  const currentLesson = LESSON_DATA[lessonType];

  return (
    <div id="agglutination-drawer" className="relative w-full [perspective:1000px] min-h-[300px]">
      <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* Front Face: Controls */}
        <div className="[backface-visibility:hidden] flex flex-col h-full bg-[#121212] border-[3px] border-black rounded-none p-2.5 py-3 sm:p-3.5 sm:py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-2xl mx-auto flex-1">
        
        {/* Column 1: PARTICLES */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] font-black tracking-widest font-mono text-slate-400 uppercase select-none mb-1 relative">
            <span className="w-1.5 h-1.5 bg-[#cc3311] block" />
            PARTICLES
            <button onClick={() => flipToLesson('particles')} className="absolute right-0 hover:text-white transition-colors" title="Learn about Particles">
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            {/* Topic Particle: 은 / 는 */}
            <button
              onClick={() => {
                if (selectedSubject || bypassMode) {
                  onAttachSubjectParticle(subjectHasBatchim ? '은' : '는');
                }
              }}
              disabled={!selectedSubject && !bypassMode}
              className={`flex flex-col items-center justify-center p-2.5 rounded-none border-[3px] text-center transition-all cursor-pointer ${
                (subjectParticle === '은' || subjectParticle === '는')
                  ? 'bg-[#cc3311] border-black text-white font-extrabold translate-y-[2px]'
                  : (!selectedSubject && !bypassMode)
                  ? 'bg-[#1a1a1a] border-dashed border-slate-800 text-slate-700 cursor-not-allowed opacity-20'
                  : 'bg-[#efebe4] text-black border-black font-extrabold hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
              style={{ minHeight: '44px' }}
            >
              <div className="text-[14px] font-black font-sans leading-none flex items-center gap-1">
                <span className={subjectHasBatchim ? 'text-emerald-500 scale-110 drop-shadow-md' : 'opacity-40'}>은</span>
                <span className="opacity-50 text-[10px]">/</span>
                <span className={!subjectHasBatchim && selectedSubject ? 'text-emerald-500 scale-110 drop-shadow-md' : 'opacity-40'}>는</span>
              </div>
              <span className="text-[9px] font-mono font-bold mt-1 opacity-80 leading-none tracking-wide">TOPIC</span>
            </button>

            {/* Subject Particle: 이 / 가 */}
            <button
              onClick={() => {
                if (selectedSubject || bypassMode) {
                  onAttachSubjectParticle(subjectHasBatchim ? '이' : '가');
                }
              }}
              disabled={!selectedSubject && !bypassMode}
              className={`flex flex-col items-center justify-center p-2.5 rounded-none border-[3px] text-center transition-all cursor-pointer ${
                (subjectParticle === '이' || subjectParticle === '가')
                  ? 'bg-[#cc3311] border-black text-white font-extrabold translate-y-[2px]'
                  : (!selectedSubject && !bypassMode)
                  ? 'bg-[#1a1a1a] border-dashed border-slate-800 text-slate-700 cursor-not-allowed opacity-20'
                  : 'bg-[#efebe4] text-black border-black font-extrabold hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
              style={{ minHeight: '44px' }}
            >
              <div className="text-[14px] font-black font-sans leading-none flex items-center gap-1">
                <span className={subjectHasBatchim ? 'text-emerald-500 scale-110 drop-shadow-md' : 'opacity-40'}>이</span>
                <span className="opacity-50 text-[10px]">/</span>
                <span className={!subjectHasBatchim && selectedSubject ? 'text-emerald-500 scale-110 drop-shadow-md' : 'opacity-40'}>가</span>
              </div>
              <span className="text-[9px] font-mono font-bold mt-1 opacity-80 leading-none tracking-wide">SUBJECT</span>
            </button>

            {/* Object Particle: 을 / 를 */}
            <button
              onClick={() => {
                if (selectedObject || bypassMode) {
                  onAttachObjectParticle(objectHasBatchim ? '을' : '를');
                }
              }}
              disabled={!selectedObject && !bypassMode}
              className={`flex flex-col items-center justify-center p-2.5 rounded-none border-[3px] text-center transition-all cursor-pointer ${
                (objectParticle === '을' || objectParticle === '를')
                  ? 'bg-[#cc3311] border-black text-white font-extrabold translate-y-[2px]'
                  : (!selectedObject && !bypassMode)
                  ? 'bg-[#1a1a1a] border-dashed border-slate-800 text-slate-700 cursor-not-allowed opacity-20'
                  : 'bg-[#efebe4] text-black border-black font-extrabold hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
              style={{ minHeight: '44px' }}
            >
              <div className="text-[14px] font-black font-sans leading-none flex items-center gap-1">
                <span className={objectHasBatchim ? 'text-emerald-500 scale-110 drop-shadow-md' : 'opacity-40'}>을</span>
                <span className="opacity-50 text-[10px]">/</span>
                <span className={!objectHasBatchim && selectedObject ? 'text-emerald-500 scale-110 drop-shadow-md' : 'opacity-40'}>를</span>
              </div>
              <span className="text-[9px] font-mono font-bold mt-1 opacity-80 leading-none tracking-wide">OBJECT</span>
            </button>
          </div>
        </div>

        {/* Column 2: TENSE & MOOD */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] font-black tracking-widest font-mono text-slate-400 uppercase select-none mb-1 relative">
            <span className="w-1.5 h-1.5 bg-[#cc3311] block" />
            TENSE & MOOD
            <button onClick={() => flipToLesson('tense')} className="absolute right-0 hover:text-white transition-colors" title="Learn about Tense & Mood">
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Present Tense */}
            <button
              onClick={() => {
                if (selectedVerb || bypassMode) {
                  onSelectEnding(ENDINGS.find(e => e.id === 'end_present') || ENDINGS[0]);
                }
              }}
              disabled={!selectedVerb && !bypassMode}
              className={`flex flex-col items-center justify-center p-2.5 rounded-none border-[3px] text-center transition-all cursor-pointer ${
                selectedEnding?.id === 'end_present'
                  ? 'bg-[#cc3311] border-black text-white font-extrabold translate-y-[2px]'
                  : (!selectedVerb && !bypassMode)
                  ? 'bg-[#1a1a1a] border-dashed border-slate-800 text-slate-700 cursor-not-allowed opacity-20'
                  : 'bg-[#efebe4] text-black border-black font-extrabold hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
              style={{ minHeight: '44px' }}
            >
              <div className="text-[13px] font-black font-sans leading-none flex items-center gap-0.5">
                <span className="opacity-70">-</span>
                <span className={harmony === 'bright' ? 'text-emerald-500 scale-110 drop-shadow-md' : (harmony === 'dark' || harmony === 'ha') ? 'opacity-30' : ''}>아</span>
                <span className="opacity-50 text-[10px] px-0.5">/</span>
                <span className={harmony === 'dark' ? 'text-emerald-500 scale-110 drop-shadow-md' : (harmony === 'bright' || harmony === 'ha') ? 'opacity-30' : ''}>어</span>
                <span className={harmony === 'ha' ? 'text-emerald-500 scale-110 drop-shadow-md' : (harmony !== 'neutral') ? 'opacity-30' : 'hidden'}>/여</span>
                <span>요</span>
              </div>
              <span className="text-[9px] font-mono font-bold mt-1 opacity-80 leading-none tracking-wide">PRESENT</span>
            </button>

            {/* Past Tense */}
            <button
              onClick={() => {
                if (selectedVerb || bypassMode) {
                  onSelectEnding(ENDINGS.find(e => e.id === 'end_past') || ENDINGS[2]);
                }
              }}
              disabled={!selectedVerb && !bypassMode}
              className={`flex flex-col items-center justify-center p-2.5 rounded-none border-[3px] text-center transition-all cursor-pointer ${
                selectedEnding?.id === 'end_past'
                  ? 'bg-[#cc3311] border-black text-white font-extrabold translate-y-[2px]'
                  : (!selectedVerb && !bypassMode)
                  ? 'bg-[#1a1a1a] border-dashed border-slate-800 text-slate-700 cursor-not-allowed opacity-20'
                  : 'bg-[#efebe4] text-black border-black font-extrabold hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
              style={{ minHeight: '44px' }}
            >
              <div className="text-[13px] font-black font-sans leading-none flex items-center gap-0.5">
                <span className="opacity-70">-</span>
                <span className={harmony === 'bright' ? 'text-emerald-500 scale-110 drop-shadow-md' : (harmony === 'dark' || harmony === 'ha') ? 'opacity-30' : ''}>았</span>
                <span className="opacity-50 text-[10px] px-0.5">/</span>
                <span className={harmony === 'dark' ? 'text-emerald-500 scale-110 drop-shadow-md' : (harmony === 'bright' || harmony === 'ha') ? 'opacity-30' : ''}>었</span>
                <span className={harmony === 'ha' ? 'text-emerald-500 scale-110 drop-shadow-md' : (harmony !== 'neutral') ? 'opacity-30' : 'hidden'}>/였</span>
                <span>어요</span>
              </div>
              <span className="text-[9px] font-mono font-bold mt-1 opacity-80 leading-none tracking-wide">PAST</span>
            </button>

            {/* Future Tense */}
            <button
              onClick={() => {
                if (selectedVerb || bypassMode) {
                  onSelectEnding(ENDINGS.find(e => e.id === 'end_future') || ENDINGS[3]);
                }
              }}
              disabled={!selectedVerb && !bypassMode}
              className={`flex flex-col items-center justify-center p-2.5 rounded-none border-[3px] text-center transition-all cursor-pointer ${
                selectedEnding?.id === 'end_future'
                  ? 'bg-[#cc3311] border-black text-white font-extrabold translate-y-[2px]'
                  : (!selectedVerb && !bypassMode)
                  ? 'bg-[#1a1a1a] border-dashed border-slate-800 text-slate-700 cursor-not-allowed opacity-20'
                  : 'bg-[#efebe4] text-black border-black font-extrabold hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
              style={{ minHeight: '44px' }}
            >
              <div className="text-[13px] font-black font-sans leading-none flex items-center gap-0.5">
                <span className="opacity-70">-</span>
                <span className={selectedVerb?.hasBatchim ? 'opacity-30' : 'text-emerald-500 scale-110 drop-shadow-md'}>ㄹ</span>
                <span className="opacity-50 text-[10px] px-0.5">/</span>
                <span className={selectedVerb?.hasBatchim ? 'text-emerald-500 scale-110 drop-shadow-md' : 'opacity-30'}>을</span>
                <span> 거예요</span>
              </div>
              <span className="text-[9px] font-mono font-bold mt-1 opacity-80 leading-none tracking-wide">FUTURE</span>
            </button>

            {/* Want To (Desire) */}
            <button
              onClick={() => {
                if (selectedVerb || bypassMode) {
                  onSelectEnding(ENDINGS.find(e => e.id === 'end_want') || ENDINGS[1]);
                }
              }}
              disabled={!selectedVerb && !bypassMode}
              className={`flex flex-col items-center justify-center p-2.5 rounded-none border-[3px] text-center transition-all cursor-pointer ${
                selectedEnding?.id === 'end_want'
                  ? 'bg-[#cc3311] border-black text-white font-extrabold translate-y-[2px]'
                  : (!selectedVerb && !bypassMode)
                  ? 'bg-[#1a1a1a] border-dashed border-slate-800 text-slate-700 cursor-not-allowed opacity-20'
                  : 'bg-[#efebe4] text-black border-black font-extrabold hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
              style={{ minHeight: '44px' }}
            >
              <span className="text-[13px] font-black font-sans leading-none flex items-center gap-0.5">
                <span className="opacity-70">-</span>고 싶어요
              </span>
              <span className="text-[9px] font-mono font-bold mt-1 opacity-80 leading-none tracking-wide">WANT TO</span>
            </button>
          </div>
        </div>

          </div>
        </div>

        {/* Back Face: Mini Lessons Carousel */}
        <div className="absolute top-0 left-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#121212] border-[3px] border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex flex-col overflow-hidden text-slate-200">
          {/* Header */}
          <div className="flex justify-between items-center shrink-0 mb-4 border-b-2 border-[#333] pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#cc3311] block" />
              <h3 className="font-mono font-black tracking-widest uppercase text-sm">{lessonType === 'particles' ? 'PARTICLES' : 'TENSE & MOOD'}</h3>
            </div>
            <button onClick={() => setIsFlipped(false)} className="p-1 hover:bg-[#cc3311] hover:text-white transition-colors cursor-pointer active:translate-y-[1px]">
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* Carousel Body */}
          <div className="flex-1 flex flex-col justify-center overflow-y-auto custom-scrollbar px-2">
            <div className="mb-2">
              <h4 className="font-display font-black text-xl md:text-2xl text-white mb-2">{currentLesson[currentSlide].title}</h4>
              <p className="text-sm md:text-base leading-relaxed text-slate-400">{currentLesson[currentSlide].content}</p>
            </div>
            
            <div className="mt-4 bg-[#1a1a1a] border border-slate-700 p-3 rounded-md">
              <span className="text-[10px] font-mono font-bold text-[#cc3311] uppercase tracking-widest block mb-1">Example</span>
              <span className="font-display font-bold text-slate-200 text-sm md:text-base">{currentLesson[currentSlide].example}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center pt-3 mt-auto shrink-0 border-t border-[#333]">
            <button 
              onClick={() => setCurrentSlide(s => Math.max(0, s - 1))}
              disabled={currentSlide === 0}
              className={`p-2 border-[2px] border-slate-700 flex items-center justify-center transition-colors ${currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800 hover:border-slate-500 text-white'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex gap-1.5">
              {currentLesson.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all ${idx === currentSlide ? 'w-6 bg-[#cc3311]' : 'w-2 bg-slate-700'}`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button 
              onClick={() => setCurrentSlide(s => Math.min(currentLesson.length - 1, s + 1))}
              disabled={currentSlide === currentLesson.length - 1}
              className={`p-2 border-[2px] border-slate-700 flex items-center justify-center transition-colors ${currentSlide === currentLesson.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800 hover:border-slate-500 text-white'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}