import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, History, Loader2, ArrowRight } from 'lucide-react';
import { generateVocabForTopic, GeneratedVocab } from '../lib/ai';

interface TopicGeneratorProps {
  onVocabGenerated: (vocab: GeneratedVocab) => void;
}

export default function TopicGenerator({ onVocabGenerated }: TopicGeneratorProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedTopics, setSavedTopics] = useState<{ topic: string, vocab: GeneratedVocab, timestamp: number }[]>([]);

  useEffect(() => {
    const loaded = localStorage.getItem('korean_sentences_generated_topics');
    if (loaded) {
      try {
        setSavedTopics(JSON.parse(loaded));
      } catch (e) {
        console.error('Failed to parse saved topics', e);
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    try {
      const vocab = await generateVocabForTopic(topic.trim());
      
      const newEntry = { topic: topic.trim(), vocab, timestamp: Date.now() };
      const updatedTopics = [newEntry, ...savedTopics.filter(t => t.topic !== topic.trim())].slice(0, 10);
      setSavedTopics(updatedTopics);
      localStorage.setItem('korean_sentences_generated_topics', JSON.stringify(updatedTopics));
      
      onVocabGenerated(vocab);
      
      localStorage.setItem('korean_sentences_custom_vocab', JSON.stringify(vocab));
      
      setTopic('');
    } catch (error) {
      console.error('Error generating vocab:', error);
      alert('Failed to generate vocabulary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadSaved = (vocab: GeneratedVocab) => {
    onVocabGenerated(vocab);
    localStorage.setItem('korean_sentences_custom_vocab', JSON.stringify(vocab));
    setIsFlipped(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 [perspective:1000px]">
      <motion.div
        className="relative w-full h-64 transition-all duration-700 [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front Face: Generator */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-slate-900 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-center items-center p-6 text-center">
          <h2 className="text-xl font-extrabold font-display text-slate-900 dark:text-white mb-2 flex items-center gap-2 uppercase tracking-wider">
            <Sparkles className="w-6 h-6 text-[#cc3311]" />
            AI Topic Generator
          </h2>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-6 uppercase tracking-wide">
            Type a topic (e.g., "ordering coffee") and AI will populate the platform with relevant vocabulary!
          </p>
          
          <div className="flex w-full max-w-lg gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              disabled={isGenerating}
              placeholder="ENTER A TOPIC..."
              className="flex-1 bg-white dark:bg-slate-950 border-2 border-black px-4 py-3 text-sm font-extrabold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="px-8 bg-[#cc3311] hover:bg-[#aa2200] disabled:bg-slate-400 text-white font-extrabold border-2 border-black flex items-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none uppercase tracking-wider"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Go'}
            </button>
            <button
              onClick={() => setIsFlipped(true)}
              className="px-6 bg-slate-800 hover:bg-slate-900 text-white font-extrabold border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none uppercase tracking-wider"
            >
              Space
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-center max-w-lg mt-6">
            {[
              { label: 'Greetings 👋', topic: 'Greetings' },
              { label: 'Ordering Food 🍕', topic: 'Ordering Food' },
              { label: 'Shopping 🛍️', topic: 'Shopping' },
              { label: 'Travel ✈️', topic: 'Travel' },
              { label: 'Hobbies 🎨', topic: 'Hobbies' }
            ].map((scenario) => (
              <button
                key={scenario.topic}
                onClick={() => setTopic(scenario.topic)}
                className="text-[10px] font-extrabold px-3 py-1.5 bg-[#fdf9f0] hover:bg-[#efebe4] dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-2 border-black uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>

        {/* Back Face: History */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-[#fdf9f0] dark:bg-slate-900 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 overflow-hidden flex flex-col" style={{ transform: 'rotateY(180deg)' }}>
          <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-3">
            <h2 className="text-sm font-extrabold font-display text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
              <History className="w-5 h-5 text-slate-800 dark:text-slate-200" />
              Previously Saved Topics
            </h2>
            <button
              onClick={() => setIsFlipped(false)}
              className="text-[10px] font-extrabold px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-2 border-black transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none uppercase"
            >
              Back to Generator
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {savedTopics.length === 0 ? (
              <div className="text-center text-xs font-bold text-slate-500 mt-8 uppercase tracking-wide">
                No generated topics yet. Flip back and create one!
              </div>
            ) : (
              savedTopics.map((item) => (
                <button
                  key={item.timestamp}
                  onClick={() => handleLoadSaved(item.vocab)}
                  className="w-full text-left px-4 py-3 bg-white hover:bg-[#efebe4] dark:bg-slate-950 border-2 border-black transition-all flex items-center justify-between group cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                >
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wide">{item.topic}</span>
                  <ArrowRight className="w-5 h-5 text-slate-900 dark:text-slate-100 group-hover:translate-x-1 transition-transform" />
                </button>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
