import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, History, Loader2, ArrowRight } from 'lucide-react';
import { generateVocabForTopic, GeneratedVocab } from '../lib/gemini';

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
        className="relative w-full h-56 transition-all duration-700 [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front Face: Generator */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-2xl shadow-xl flex flex-col justify-center items-center p-6 text-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            AI Topic Generator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Type a topic (e.g., "ordering coffee") and AI will populate the platform with relevant vocabulary!
          </p>
          
          <div className="flex w-full max-w-lg gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              disabled={isGenerating}
              placeholder="Enter a topic..."
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Go'}
            </button>
            <button
              onClick={() => setIsFlipped(true)}
              className="px-6 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Space
            </button>
          </div>
        </div>

        {/* Back Face: History */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 overflow-hidden flex flex-col" style={{ transform: 'rotateY(180deg)' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              Previously Saved Topics
            </h2>
            <button
              onClick={() => setIsFlipped(false)}
              className="text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Back to Generator
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {savedTopics.length === 0 ? (
              <div className="text-center text-sm text-slate-400 mt-6">
                No generated topics yet. Flip back and create one!
              </div>
            ) : (
              savedTopics.map((item) => (
                <button
                  key={item.timestamp}
                  onClick={() => handleLoadSaved(item.vocab)}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-950 dark:hover:bg-indigo-900/20 border border-slate-200 dark:border-slate-800 rounded-xl transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-bold text-slate-700 dark:text-slate-200">{item.topic}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </button>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
