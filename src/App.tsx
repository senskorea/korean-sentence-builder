import { useState, useEffect } from 'react';
import { analyzeSentence, SentenceAnalysis } from './lib/ai';
import { Word, StepState, SavedSentence, AppConfig, EndingOption } from './types';
import { getFullEnglishTranslation, CONJUGATIONS, SUBJECTS, OBJECTS, VERBS, conjugateVerbDynamically } from './data';
import WorkingSentence from './components/WorkingSentence';
import ConceptBlocks from './components/ConceptBlocks';
import AgglutinationDrawer from './components/AgglutinationDrawer';
import SavedPhrases from './components/SavedPhrases';
import TopicGenerator from './components/TopicGenerator';
import LearnMode from './components/LearnMode';
import { 
  Smartphone, 
  Sparkles, 
  HelpCircle, 
  Info, 
  RotateCcw, 
  Copy, 
  Check, 
  Volume2, 
  Settings, 
  Globe, 
  Maximize2, 
  Minimize2,
  Trash2,
  BookOpen,
  ChevronRight,
  Bookmark,
  Upload,
  Database,
  FileText,
  PenTool
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pre-defined Custom Templates to load dynamically
const DATING_VOCAB_TEMPLATE = {
  subjects: [
    { id: "sub_i", korean: "저", english: "I", emoji: "👤", type: "subject", hasBatchim: false },
    { id: "sub_bf", korean: "남자친구", english: "Boyfriend", emoji: "👦", type: "subject", hasBatchim: false },
    { id: "sub_gf", korean: "여자친구", english: "Girlfriend", emoji: "👧", type: "subject", hasBatchim: false },
    { id: "sub_crush", korean: "짝사랑", english: "Crush", emoji: "💖", type: "subject", hasBatchim: true },
    { id: "sub_partner", korean: "애인", english: "Lover", emoji: "👩‍❤️‍👨", type: "subject", hasBatchim: true },
    { id: "sub_we", korean: "우리", english: "We", emoji: "👥", type: "subject", hasBatchim: false }
  ],
  objects: [
    { id: "obj_love", korean: "사랑", english: "Love", emoji: "❤️", type: "object", hasBatchim: true, compatibleVerbs: ["verb_give", "verb_confess", "verb_like", "verb_love"] },
    { id: "obj_gift", korean: "선물", english: "Gift", emoji: "🎁", type: "object", hasBatchim: true, compatibleVerbs: ["verb_give", "verb_buy"] },
    { id: "obj_coffee", korean: "커피", english: "Coffee", emoji: "☕", type: "object", hasBatchim: false, compatibleVerbs: ["verb_drink", "verb_buy", "verb_like"] },
    { id: "obj_movie", korean: "영화", english: "Movie", emoji: "🎬", type: "object", hasBatchim: false, compatibleVerbs: ["verb_watch", "verb_like"] },
    { id: "obj_message", korean: "메시지", english: "Message", emoji: "💬", type: "object", hasBatchim: false, compatibleVerbs: ["verb_send", "verb_like"] },
    { id: "obj_flowers", korean: "꽃", english: "Flowers", emoji: "💐", type: "object", hasBatchim: true, compatibleVerbs: ["verb_buy", "verb_give"] },
    { id: "obj_heart", korean: "마음", english: "Heart", emoji: "💝", type: "object", hasBatchim: true, compatibleVerbs: ["verb_give", "verb_confess", "verb_like"] }
  ],
  verbs: [
    { id: "verb_meet", korean: "만나다", english: "To meet", emoji: "👩‍❤️‍👨", type: "verb", hasBatchim: false, stem: "만나" },
    { id: "verb_love", korean: "사랑하다", english: "To love", emoji: "❤️", type: "verb", hasBatchim: false, stem: "사랑하" },
    { id: "verb_confess", korean: "고백하다", english: "To confess", emoji: "💌", type: "verb", hasBatchim: false, stem: "고백하" },
    { id: "verb_give", korean: "주다", english: "To give", emoji: "🤲", type: "verb", hasBatchim: false, stem: "주" },
    { id: "verb_buy", korean: "사다", english: "To buy", emoji: "🛒", type: "verb", hasBatchim: false, stem: "사" },
    { id: "verb_watch", korean: "보다", english: "To watch", emoji: "👀", type: "verb", hasBatchim: false, stem: "보" },
    { id: "verb_send", korean: "보내다", english: "To send", emoji: "✉️", type: "verb", hasBatchim: false, stem: "보내" },
    { id: "verb_like", korean: "좋아하다", english: "To like", emoji: "🥰", type: "verb", hasBatchim: false, stem: "좋아하" }
  ],
  conjugations: {
    verb_meet: {
      end_present: { korean: "만나요", english: "meets" },
      end_want: { korean: "만나고 싶어요", english: "wants to meet" },
      end_past: { korean: "만났어요", english: "met" },
      end_future: { korean: "만날 거예요", english: "will meet" }
    },
    verb_love: {
      end_present: { korean: "사랑해요", english: "loves" },
      end_want: { korean: "사랑하고 싶어요", english: "wants to love" },
      end_past: { korean: "사랑했어요", english: "loved" },
      end_future: { korean: "사랑할 거예요", english: "will love" }
    },
    verb_confess: {
      end_present: { korean: "고백해요", english: "confesses" },
      end_want: { korean: "고백하고 싶어요", english: "wants to confess" },
      end_past: { korean: "고백했어요", english: "confessed" },
      end_future: { korean: "고백할 거예요", english: "will confess" }
    },
    verb_give: {
      end_present: { korean: "줘요", english: "gives" },
      end_want: { korean: "주고 싶어요", english: "wants to give" },
      end_past: { korean: "줬어요", english: "gave" },
      end_future: { korean: "줄 거예요", english: "will give" }
    },
    verb_buy: {
      end_present: { korean: "사요", english: "buys" },
      end_want: { korean: "사고 싶어요", english: "wants to buy" },
      end_past: { korean: "샀어요", english: "bought" },
      end_future: { korean: "살 거예요", english: "will buy" }
    },
    verb_watch: {
      end_present: { korean: "봐요", english: "watches" },
      end_want: { korean: "보고 싶어요", english: "wants to watch" },
      end_past: { korean: "봤어요", english: "watched" },
      end_future: { korean: "볼 거예요", english: "will watch" }
    },
    verb_send: {
      end_present: { korean: "보내요", english: "sends" },
      end_want: { korean: "보내고 싶어요", english: "wants to send" },
      end_past: { korean: "보냈어요", english: "sent" },
      end_future: { korean: "보낼 거예요", english: "will send" }
    },
    verb_like: {
      end_present: { korean: "좋아해요", english: "likes" },
      end_want: { korean: "좋아하고 싶어요", english: "wants to like" },
      end_past: { korean: "좋아했어요", english: "liked" },
      end_future: { korean: "좋아할 거예요", english: "will like" }
    }
  }
};

const TRAVEL_VOCAB_TEMPLATE = {
  subjects: [
    { id: "sub_i", korean: "저", english: "I", emoji: "👤", type: "subject", hasBatchim: false },
    { id: "sub_friend", korean: "친구", english: "Friend", emoji: "🧑‍🤝‍🧑", type: "subject", hasBatchim: false },
    { id: "sub_teacher", korean: "선생님", english: "Teacher", emoji: "🧑‍🏫", type: "subject", hasBatchim: true }
  ],
  objects: [
    { id: "obj_ticket", korean: "표", english: "Ticket", emoji: "🎫", type: "object", hasBatchim: false, compatibleVerbs: ["verb_buy", "verb_give"] },
    { id: "obj_hotel", korean: "호텔", english: "Hotel", emoji: "🏨", type: "object", hasBatchim: false, compatibleVerbs: ["verb_find", "verb_go"] },
    { id: "obj_coffee", korean: "커피", english: "Coffee", emoji: "☕", type: "object", hasBatchim: false, compatibleVerbs: ["verb_drink", "verb_buy"] }
  ],
  verbs: [
    { id: "verb_buy", korean: "사다", english: "To buy", emoji: "🛒", type: "verb", hasBatchim: false, stem: "사" },
    { id: "verb_drink", korean: "마시다", english: "To drink", emoji: "🥤", type: "verb", hasBatchim: false, stem: "마시" },
    { id: "verb_go", korean: "가다", english: "To go", emoji: "🚶", type: "verb", hasBatchim: false, stem: "가" }
  ]
};

export default function App() {
  // --- Core State Machine ---
  const [currentStep, setCurrentStep] = useState<StepState>('START');
  const [selectedSubject, setSelectedSubject] = useState<Word | null>(null);
  const [subjectParticle, setSubjectParticle] = useState<string>('');
  const [selectedObject, setSelectedObject] = useState<Word | null>(null);
  const [objectParticle, setObjectParticle] = useState<string>('');
  const [selectedVerb, setSelectedVerb] = useState<Word | null>(null);
  const [selectedEnding, setSelectedEnding] = useState<EndingOption | null>(null);

  // --- Dynamic Vocabulary State ---
  const [vocab, setVocab] = useState<{
    subjects: Word[];
    objects: Word[];
    verbs: Word[];
    conjugations?: Record<string, Record<string, { korean: string; english: string }>>;
  }>(() => {
    const saved = localStorage.getItem('korean_sentences_custom_vocab');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse custom vocab', e);
      }
    }
    return { subjects: SUBJECTS, objects: OBJECTS, verbs: VERBS };
  });

  const [showVocabPanel, setShowVocabPanel] = useState<boolean>(false);
  const [vocabJsonInput, setVocabJsonInput] = useState<string>('');
  const [vocabError, setVocabError] = useState<string | null>(null);

  // --- Configuration & Utilities State ---
  const [appMode, setAppMode] = useState<'build' | 'learn'>('build');
  const [config, setConfig] = useState<AppConfig>({
    copyFormat: 'bilingual',
    bypassMode: false,
  });
  
  const [activeTab, setActiveTab] = useState<'subject' | 'object' | 'verb'>('subject');
  const [savedPhrases, setSavedPhrases] = useState<SavedSentence[]>([]);
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);

  // --- AI Analysis State ---
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<SentenceAnalysis | null>(null);
  const [isConceptBlocksFlipped, setIsConceptBlocksFlipped] = useState<boolean>(false);

  // --- LocalStorage Persistence ---
  useEffect(() => {
    const loaded = localStorage.getItem('korean_sentences_history');
    if (loaded) {
      try {
        setSavedPhrases(JSON.parse(loaded));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const saveHistory = (newHistory: SavedSentence[]) => {
    setSavedPhrases(newHistory);
    localStorage.setItem('korean_sentences_history', JSON.stringify(newHistory));
  };

  // --- Compile English and Korean output ---
  const compiledKorean = (): string => {
    let result = '';
    if (selectedSubject) {
      result += selectedSubject.korean;
      if (subjectParticle) result += subjectParticle;
    }
    if (selectedObject) {
      if (result) result += ' ';
      result += selectedObject.korean;
      if (objectParticle) result += objectParticle;
    }
    if (selectedVerb) {
      if (result) result += ' ';
      if (selectedEnding) {
        let conj = vocab.conjugations?.[selectedVerb.id]?.[selectedEnding.id] || CONJUGATIONS[selectedVerb.id]?.[selectedEnding.id];
        if (!conj) {
          conj = conjugateVerbDynamically(selectedVerb, selectedEnding.id);
        }
        result += conj ? conj.korean : selectedVerb.korean;
      } else {
        result += selectedVerb.korean;
      }
    }
    return result;
  };

  const activeKorean = compiledKorean();
  const activeEnglish = getFullEnglishTranslation(
    selectedSubject,
    selectedObject,
    selectedVerb,
    selectedEnding?.id || null,
    vocab.conjugations
  );

  const activeEmojis = (): string => {
    let emojis = '';
    if (selectedSubject) emojis += selectedSubject.emoji;
    if (selectedObject) emojis += ` ➔ ${selectedObject.emoji}`;
    if (selectedVerb) emojis += ` ➔ ${selectedVerb.emoji}`;
    return emojis;
  };

  // --- Audio Synthesis Helper (TTS) ---
  const handlePlayAudio = () => {
    if (!activeKorean) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeKorean);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8; // slightly slower for educational learning
      window.speechSynthesis.speak(utterance);
      showToast('Playing Korean audio...', 'info');
    } else {
      showToast('Text-to-Speech not supported in this browser.', 'info');
    }
  };

  // --- Toast Manager ---
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopyText = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    showToast('Copied to clipboard!', 'success');
  };

  // --- Save current sentence state to History ---
  const handleSaveSentence = () => {
    if (!selectedSubject || !selectedObject || !selectedVerb || !selectedEnding) return;
    
    const newPhrase: SavedSentence = {
      id: `phrase_${Date.now()}`,
      korean: activeKorean,
      english: activeEnglish,
      emojis: activeEmojis(),
      timestamp: Date.now()
    };

    const updated = [newPhrase, ...savedPhrases];
    saveHistory(updated);
    showToast('Saved to custom phrase book!', 'success');
  };

  // --- State Machine Select Handlers ---
  const handleSelectWord = (word: Word) => {
    setIsConceptBlocksFlipped(false);
    setAnalysisResult(null);
    if (config.bypassMode) {
      // In bypass mode, user can select anything in any order
      if (word.type === 'subject') {
        if (selectedSubject?.id === word.id) {
          setSelectedSubject(null);
          setSubjectParticle('');
        } else {
          setSelectedSubject(word);
          // Auto-apply recommended particle
          setSubjectParticle(word.hasBatchim ? '은' : '는');
        }
      } else if (word.type === 'object') {
        if (selectedObject?.id === word.id) {
          setSelectedObject(null);
          setObjectParticle('');
        } else {
          setSelectedObject(word);
          // Auto-apply recommended particle
          setObjectParticle(word.hasBatchim ? '을' : '를');
        }
      } else if (word.type === 'verb') {
        if (selectedVerb?.id === word.id) {
          setSelectedVerb(null);
          setSelectedEnding(null);
        } else {
          setSelectedVerb(word);
        }
      }
      return;
    }

    // --- STRICT STATE SEQUENCE LOGIC ---
    switch (currentStep) {
      case 'START':
        if (word.type === 'subject') {
          setSelectedSubject(word);
          setCurrentStep('SUBJECT_SELECTED');
          setActiveTab('object'); // Auto forward to object tab
        }
        break;

      case 'SUBJECT_SELECTED':
        if (word.type === 'subject') {
          setSelectedSubject(word);
          setSubjectParticle('');
        } else if (word.type === 'object') {
          setSelectedObject(word);
          setCurrentStep('OBJECT_SELECTED');
          setActiveTab('verb'); // Auto forward to verb tab
        }
        break;

      case 'OBJECT_SELECTED':
        if (word.type === 'subject') {
          setSelectedSubject(word);
          setSubjectParticle('');
        } else if (word.type === 'object') {
          setSelectedObject(word);
          setObjectParticle('');
        } else if (word.type === 'verb') {
          setSelectedVerb(word);
          setCurrentStep('VERB_STEM_SELECTED');
        }
        break;

      case 'VERB_STEM_SELECTED':
      case 'COMPLETED':
        if (word.type === 'subject') {
          setSelectedSubject(word);
          setSubjectParticle('');
        } else if (word.type === 'object') {
          setSelectedObject(word);
          setObjectParticle('');
        } else if (word.type === 'verb') {
          setSelectedVerb(word);
          setSelectedEnding(null);
        }
        break;

      default:
        break;
    }
  };

  const handleAttachSubjectParticle = (particle: string) => {
    setSubjectParticle(particle);
  };

  const handleAttachObjectParticle = (particle: string) => {
    setObjectParticle(particle);
  };

  const handleSelectEnding = (ending: EndingOption) => {
    setSelectedEnding(ending);
    if (!config.bypassMode) {
      setCurrentStep('COMPLETED');
    }
  };

  const handleReset = () => {
    setSelectedSubject(null);
    setSubjectParticle('');
    setSelectedObject(null);
    setObjectParticle('');
    setSelectedVerb(null);
    setSelectedEnding(null);
    setCurrentStep('START');
    setActiveTab('subject');
    setIsConceptBlocksFlipped(false);
    setAnalysisResult(null);
    showToast('Sentence builder reset.', 'info');
  };

  // --- AI Analysis Handler ---
  const handleAnalyzeSentence = async () => {
    if (!activeKorean || !activeEnglish) return;
    setIsAnalyzing(true);
    setIsConceptBlocksFlipped(true);
    try {
      const result = await analyzeSentence(activeKorean, activeEnglish);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to analyze sentence', error);
      showToast('Failed to analyze sentence', 'info');
      setIsConceptBlocksFlipped(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFlipBack = () => {
    setIsConceptBlocksFlipped(false);
  };

  // --- Deletion Helpers for Saved List ---
  const handleDeletePhrase = (id: string) => {
    const updated = savedPhrases.filter(p => p.id !== id);
    saveHistory(updated);
    showToast('Deleted phrase.', 'info');
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Clear all saved phrases?')) {
      saveHistory([]);
      showToast('Saved history cleared.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf9f0] dark:bg-[#100f0d] dot-pattern font-sans text-slate-800 dark:text-slate-100 py-6 px-4 md:px-8 transition-colors duration-300">
      


      {/* Layout Content wrapper */}
      <div className="max-w-6xl mx-auto flex flex-col items-stretch justify-center gap-6">
        
        {/* Main interactive application sandbox */}
        <div className={`flex-1 ${deviceFrameMode ? 'max-w-md mx-auto w-full' : 'w-full'}`}>
          {/* Smartphone Frame Wrapper */}
          <div className={`${
            deviceFrameMode 
              ? 'border-8 border-slate-900 dark:border-slate-800 rounded-[3rem] p-4 bg-slate-50 dark:bg-slate-900 shadow-2xl relative overflow-hidden min-h-[780px] flex flex-col justify-between' 
              : 'w-full flex flex-col gap-5'
          }`}>
            
            {/* Speaker Bezels in device mockup */}
            {deviceFrameMode && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-900 dark:bg-slate-800 rounded-b-2xl z-20 flex items-center justify-center">
                <div className="w-16 h-1 bg-slate-700 dark:bg-slate-600 rounded-full mb-1"></div>
              </div>
            )}

            <div className={deviceFrameMode ? 'pt-6 flex-1 flex flex-col justify-between gap-4' : 'flex flex-col gap-4'}>
              {appMode === 'learn' ? (
                <LearnMode vocab={vocab} />
              ) : (
                <>
                  {/* Zone 1 & 2: Working Sentence Ribbon (Blended with Roadmap) */}
                  <WorkingSentence
                subject={selectedSubject}
                subjectParticle={subjectParticle}
                object={selectedObject}
                objectParticle={objectParticle}
                verb={selectedVerb}
                ending={selectedEnding}
                bypassMode={config.bypassMode}
                onReset={handleReset}
                onCopy={handleCopyText}
                copyFormat={config.copyFormat}
                englishTranslation={activeEnglish}
                onPlayAudio={handlePlayAudio}
                activeKorean={activeKorean}
                onSave={handleSaveSentence}
                onAnalyze={handleAnalyzeSentence}
                isAnalyzing={isAnalyzing}
              />

              {/* Zone 3: Concept Blocks */}
              <ConceptBlocks
                currentStep={currentStep}
                selectedSubject={selectedSubject}
                selectedObject={selectedObject}
                selectedVerb={selectedVerb}
                bypassMode={config.bypassMode}
                onSelectWord={handleSelectWord}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                subjects={vocab.subjects}
                objects={vocab.objects}
                verbs={vocab.verbs}
                isFlipped={isConceptBlocksFlipped}
                isAnalyzing={isAnalyzing}
                analysisResult={analysisResult}
                onFlipBack={handleFlipBack}
              />

              {/* Zone 4: Agglutination Drawer */}
              <AgglutinationDrawer
                currentStep={currentStep}
                selectedSubject={selectedSubject}
                selectedObject={selectedObject}
                selectedVerb={selectedVerb}
                bypassMode={config.bypassMode}
                onAttachSubjectParticle={handleAttachSubjectParticle}
                onAttachObjectParticle={handleAttachObjectParticle}
                onSelectEnding={handleSelectEnding}
                subjectParticle={subjectParticle}
                objectParticle={objectParticle}
                  selectedEnding={selectedEnding}
                />
                </>
              )}

            </div>

          </div>
        </div>

        {/* Sidebar displaying saved sentences and comprehensive explanations */}
        <div className="w-full flex flex-col gap-6 shrink-0 justify-start">
          {/* Saved phrase history */}
          <SavedPhrases
            phrases={savedPhrases}
            onCopy={handleCopyText}
            onDelete={handleDeletePhrase}
            onClearAll={handleClearAllHistory}
          />


        </div>

      </div>

      {/* New Topic Generator Feature */}
      <div className="max-w-6xl mx-auto mt-12 mb-4">
        <TopicGenerator onVocabGenerated={(newVocab) => {
          setVocab(newVocab);
          setVocabJsonInput(JSON.stringify(newVocab, null, 2));
          handleReset(); // reset sentence builder when vocab changes
          showToast('Custom vocabulary loaded from AI!', 'success');
        }} />
      </div>

      {/* Sleek retro footer control bar */}
      <footer className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 mb-8 border-t-[3px] border-black pt-5">
        <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
          © SYSTEM.BUILDER // VER 2.1
        </div>
        
        {/* Compact Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Learn Mode Toggler */}
          <button
            onClick={() => {
              setAppMode(appMode === 'build' ? 'learn' : 'build');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black rounded-none font-extrabold transition-all cursor-pointer text-[11px] ${
              appMode === 'learn'
                ? 'bg-indigo-600 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none'
            }`}
          >
            <PenTool className={`w-3.5 h-3.5 ${appMode === 'learn' ? 'text-white' : 'text-indigo-500'}`} />
            <span>{appMode === 'build' ? 'Enter Learn Mode' : 'Back to Builder'}</span>
          </button>

          {/* Custom Vocabulary Toggler */}
          <button
            onClick={() => {
              setShowVocabPanel(!showVocabPanel);
              setShowConfigPanel(false); // close other panel
              if (!vocabJsonInput) {
                setVocabJsonInput(JSON.stringify(vocab, null, 2));
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-black rounded-none hover:bg-slate-50 font-extrabold transition-all cursor-pointer text-[11px] ${
              showVocabPanel
                ? 'bg-[#cc3311] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Manage Vocab</span>
          </button>

          {/* Format config toggle */}
          <button
            onClick={() => {
              setShowConfigPanel(!showConfigPanel);
              setShowVocabPanel(false); // close other panel
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-black rounded-none hover:bg-slate-50 font-extrabold transition-all cursor-pointer text-[11px] ${
              showConfigPanel
                ? 'bg-[#cc3311] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-rose-500" />
            <span>Format Settings</span>
          </button>

          {/* Desktop/Bezel Mockup Toggler */}
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-black rounded-none hover:bg-[#efebe4] font-extrabold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer text-[11px]"
            title="Toggle smartphone viewport framing"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-500" />
            <span>{deviceFrameMode ? 'Full Viewport' : 'Mobile Bezel'}</span>
          </button>
        </div>
      </footer>

      {/* Settings Overlay Panel */}
      <AnimatePresence>
        {showConfigPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-6xl mx-auto mb-6 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg text-xs"
          >
            <h3 className="font-extrabold font-display text-slate-900 dark:text-white mb-3 text-sm flex items-center gap-1.5 uppercase tracking-wider">
              <Settings className="w-4 h-4 text-indigo-500" />
              FORMATTING & BEHAVIOR PREFERENCES
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-bold block mb-1">Clipboard Copy Payload Format</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  Configure format delivered on copy interaction.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfig({ ...config, copyFormat: 'korean_only' })}
                    className={`flex-1 py-1.5 border rounded-lg font-bold transition-all ${
                      config.copyFormat === 'korean_only'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Korean Only
                  </button>
                  <button
                    onClick={() => setConfig({ ...config, copyFormat: 'bilingual' })}
                    className={`flex-1 py-1.5 border rounded-lg font-bold transition-all ${
                      config.copyFormat === 'bilingual'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Bilingual Format
                  </button>
                </div>
              </div>

              <div>
                <span className="font-bold block mb-1">Interaction Sequence Lock</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  Lock tabs into sequential Subject ➔ Object ➔ Verb grammar flow, or enable freeform.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setConfig({ ...config, bypassMode: false });
                      handleReset();
                    }}
                    className={`flex-1 py-1.5 border rounded-lg font-bold transition-all ${
                      !config.bypassMode
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Strict Sequence
                  </button>
                  <button
                    onClick={() => setConfig({ ...config, bypassMode: true })}
                    className={`flex-1 py-1.5 border rounded-lg font-bold transition-all ${
                      config.bypassMode
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    Bypass Mode (Sandbox)
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowConfigPanel(false)}
              className="mt-4 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-lg border border-slate-200 dark:border-slate-700 block ml-auto transition-colors"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Vocabulary Manager Panel */}
      <AnimatePresence>
        {showVocabPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-6xl mx-auto mt-10 mb-6 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 gap-2">
              <h3 className="font-extrabold font-display text-slate-900 dark:text-white text-sm flex items-center gap-1.5 uppercase tracking-wider">
                <Database className="w-4 h-4 text-indigo-500" />
                VOCABULARY MANAGER & JSON IMPORT
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Active Set:</span>
                <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-900/40">
                  {localStorage.getItem('korean_sentences_custom_vocab') ? '🔮 Custom Loaded' : '💘 Dating Theme (Default)'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed font-semibold">
              Customize the vocabulary available in the selection grid by pasting a custom JSON configuration below. Perfect for teachers, advanced learners, or focusing on specific topics like Travel, Business, or Hobbies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Left Column: Quick Templates */}
              <div className="md:col-span-1 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/50 dark:border-slate-850 rounded-xl flex flex-col justify-between gap-3">
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 mb-2 uppercase tracking-wide text-[10px] flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" /> Load Templates
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3">
                    Click to load a pre-formatted vocabulary structure into the editor, then customize or save it!
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setVocabJsonInput(JSON.stringify(DATING_VOCAB_TEMPLATE, null, 2));
                        setVocabError(null);
                      }}
                      className="w-full text-left p-2 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 rounded-lg transition-all"
                    >
                      <div className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400">💘 Dating & Romance</div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Boyfriend, girlfriend, love, confess, meet, flowers...</div>
                    </button>

                    <button
                      onClick={() => {
                        setVocabJsonInput(JSON.stringify(TRAVEL_VOCAB_TEMPLATE, null, 2));
                        setVocabError(null);
                      }}
                      className="w-full text-left p-2 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white dark:bg-slate-900 rounded-lg transition-all"
                    >
                      <div className="font-bold text-[11px] text-indigo-600 dark:text-indigo-400">✈️ Travel & Shopping</div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Tickets, hotels, buying, coffee, going...</div>
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200/50 dark:border-slate-800 pt-3 mt-2">
                  <button
                    onClick={() => {
                      if (window.confirm('Revert all custom vocabulary and restore default Dating Theme defaults?')) {
                        setVocab({ subjects: SUBJECTS, objects: OBJECTS, verbs: VERBS });
                        localStorage.removeItem('korean_sentences_custom_vocab');
                        setVocabJsonInput('');
                        setVocabError(null);
                        handleReset();
                        showToast('Restored default dating vocabulary!', 'success');
                        setShowVocabPanel(false);
                      }
                    }}
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold rounded-lg transition-colors text-center block"
                  >
                    Restore Default Dating Set
                  </button>
                </div>
              </div>

              {/* Right Columns: Editor area */}
              <div className="md:col-span-2 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold block text-slate-700 dark:text-slate-300">JSON Configuration Editor</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Edit values or paste custom blocks</span>
                </div>

                <div className="relative">
                  <textarea
                    value={vocabJsonInput}
                    onChange={(e) => setVocabJsonInput(e.target.value)}
                    placeholder="Pasted vocabulary JSON..."
                    className="w-full h-56 font-mono text-[11px] p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:ring-1 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100"
                  />
                </div>

                {vocabError && (
                  <div className="p-2 border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold rounded-lg leading-relaxed text-[10px]">
                    ⚠️ Error: {vocabError}
                  </div>
                )}

                <div className="flex gap-2 justify-end mt-1">
                  <button
                    onClick={() => {
                      setShowVocabPanel(false);
                      setVocabError(null);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!vocabJsonInput.trim()) {
                        setVocabError('Pasted text cannot be empty.');
                        return;
                      }
                      try {
                        const parsed = JSON.parse(vocabJsonInput);
                        
                        // Validation
                        if (!parsed.subjects || !Array.isArray(parsed.subjects)) {
                          throw new Error('Missing or invalid "subjects" array.');
                        }
                        if (!parsed.objects || !Array.isArray(parsed.objects)) {
                          throw new Error('Missing or invalid "objects" array.');
                        }
                        if (!parsed.verbs || !Array.isArray(parsed.verbs)) {
                          throw new Error('Missing or invalid "verbs" array.');
                        }

                        // Check fields of items
                        const checkWord = (w: any, type: string) => {
                          if (!w.id || typeof w.id !== 'string') throw new Error(`Items in ${type} must contain a unique string "id".`);
                          if (!w.korean || typeof w.korean !== 'string') throw new Error(`Item "${w.id}" must contain a string "korean".`);
                          if (!w.english || typeof w.english !== 'string') throw new Error(`Item "${w.id}" must contain a string "english".`);
                          if (!w.emoji || typeof w.emoji !== 'string') throw new Error(`Item "${w.id}" must contain a string "emoji".`);
                          if (w.hasBatchim === undefined) throw new Error(`Item "${w.id}" must specify boolean "hasBatchim".`);
                        };

                        parsed.subjects.forEach((w: any) => checkWord(w, 'subjects'));
                        parsed.objects.forEach((w: any) => checkWord(w, 'objects'));
                        parsed.verbs.forEach((w: any) => checkWord(w, 'verbs'));

                        // Save state and localStorage
                        setVocab(parsed);
                        localStorage.setItem('korean_sentences_custom_vocab', JSON.stringify(parsed));
                        setVocabError(null);
                        handleReset(); // Reset sentence state
                        showToast('Custom vocabulary loaded!', 'success');
                        setShowVocabPanel(false);
                      } catch (err: any) {
                        setVocabError(err?.message || 'Invalid JSON format.');
                      }
                    }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-lg transition-colors shadow-sm flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Apply Custom Vocab</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating System Notification/Toast alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full shadow-lg border text-xs font-bold flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-850 dark:border-slate-200 shadow-md'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
