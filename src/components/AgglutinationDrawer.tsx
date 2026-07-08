import { Word, EndingOption, StepState } from '../types';
import { ENDINGS } from '../data';

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

  return (
    <div id="agglutination-drawer" className="bg-[#121212] border-[3px] border-black rounded-none p-2.5 py-3 sm:p-3.5 sm:py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] w-full">
      <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-2xl mx-auto">
        
        {/* Column 1: PARTICLES */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] font-black tracking-widest font-mono text-slate-400 uppercase select-none mb-1">
            <span className="w-1.5 h-1.5 bg-[#cc3311] block" />
            PARTICLES
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
          <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] font-black tracking-widest font-mono text-slate-400 uppercase select-none mb-1">
            <span className="w-1.5 h-1.5 bg-[#cc3311] block" />
            TENSE & MOOD
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
  );
}