export interface Word {
  id: string;
  korean: string;
  english: string;
  emoji: string;
  type: 'subject' | 'object' | 'verb';
  hasBatchim: boolean; // True if it ends in a consonant (Batchim / 받침)
  stem?: string;       // For verbs, the stem (e.g. '먹' for '먹다')
  compatibleVerbs?: string[]; // IDs of verbs that make sense with this object
}

export type StepState =
  | 'START'
  | 'SUBJECT_SELECTED'
  | 'SUBJECT_PARTICLE_ATTACHED'
  | 'OBJECT_SELECTED'
  | 'OBJECT_PARTICLE_ATTACHED'
  | 'VERB_STEM_SELECTED'
  | 'COMPLETED';

export interface SavedSentence {
  id: string;
  korean: string;
  english: string;
  emojis: string;
  timestamp: number;
}

export interface EndingOption {
  id: string;
  korean: string;
  english: string;
  type: 'present' | 'want' | 'past' | 'future';
}

export interface AppConfig {
  copyFormat: 'korean_only' | 'bilingual';
  bypassMode: boolean; // If true, allows freeform/frictionless clicking without strict sequencing
}
