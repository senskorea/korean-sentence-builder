export type JamoLayout =
  | 'cv-vertical'
  | 'cv-horizontal'
  | 'cv-compound'
  | 'cvc-vertical'
  | 'cvc-horizontal'
  | 'cvc-compound';

export type JamoLevel = 'basic' | 'compound' | 'batchim';

export interface JamoExercise {
  id: string;
  initial: string;
  medial: string;
  final?: string;
  syllable: string;
  romanization: string;
  soundHint: string;
  layout: JamoLayout;
  level: JamoLevel;
}

// Local, curated practice set. It deliberately covers every canonical block geometry.
export const JAMO_EXERCISES: JamoExercise[] = [
  { id: 'ga', initial: 'ㄱ', medial: 'ㅏ', syllable: '가', romanization: 'ga', soundHint: 'g/k + a', layout: 'cv-vertical', level: 'basic' },
  { id: 'neo', initial: 'ㄴ', medial: 'ㅓ', syllable: '너', romanization: 'neo', soundHint: 'n + eo', layout: 'cv-vertical', level: 'basic' },
  { id: 'mi', initial: 'ㅁ', medial: 'ㅣ', syllable: '미', romanization: 'mi', soundHint: 'm + i', layout: 'cv-vertical', level: 'basic' },
  { id: 'se', initial: 'ㅅ', medial: 'ㅔ', syllable: '세', romanization: 'se', soundHint: 's + e', layout: 'cv-vertical', level: 'basic' },
  { id: 'go', initial: 'ㄱ', medial: 'ㅗ', syllable: '고', romanization: 'go', soundHint: 'g/k + o', layout: 'cv-horizontal', level: 'basic' },
  { id: 'nu', initial: 'ㄴ', medial: 'ㅜ', syllable: '누', romanization: 'nu', soundHint: 'n + u', layout: 'cv-horizontal', level: 'basic' },
  { id: 'deu', initial: 'ㄷ', medial: 'ㅡ', syllable: '드', romanization: 'deu', soundHint: 'd/t + eu', layout: 'cv-horizontal', level: 'basic' },
  { id: 'ryo', initial: 'ㄹ', medial: 'ㅛ', syllable: '료', romanization: 'ryo', soundHint: 'r/l + yo', layout: 'cv-horizontal', level: 'basic' },
  { id: 'gwa', initial: 'ㄱ', medial: 'ㅘ', syllable: '과', romanization: 'gwa', soundHint: 'g/k + wa', layout: 'cv-compound', level: 'compound' },
  { id: 'dwe', initial: 'ㄷ', medial: 'ㅞ', syllable: '돼', romanization: 'dwae', soundHint: 'd/t + wae', layout: 'cv-compound', level: 'compound' },
  { id: 'mwo', initial: 'ㅁ', medial: 'ㅝ', syllable: '뭐', romanization: 'mwo', soundHint: 'm + wo', layout: 'cv-compound', level: 'compound' },
  { id: 'gwi', initial: 'ㄱ', medial: 'ㅟ', syllable: '귀', romanization: 'gwi', soundHint: 'g/k + wi', layout: 'cv-compound', level: 'compound' },
  { id: 'gan', initial: 'ㄱ', medial: 'ㅏ', final: 'ㄴ', syllable: '간', romanization: 'gan', soundHint: 'g/k + a + n', layout: 'cvc-vertical', level: 'batchim' },
  { id: 'meok', initial: 'ㅁ', medial: 'ㅓ', final: 'ㄱ', syllable: '먹', romanization: 'meok', soundHint: 'm + eo + k', layout: 'cvc-vertical', level: 'batchim' },
  { id: 'sil', initial: 'ㅅ', medial: 'ㅣ', final: 'ㄹ', syllable: '실', romanization: 'sil', soundHint: 's + i + l', layout: 'cvc-vertical', level: 'batchim' },
  { id: 'bam', initial: 'ㅂ', medial: 'ㅏ', final: 'ㅁ', syllable: '밤', romanization: 'bam', soundHint: 'b/p + a + m', layout: 'cvc-vertical', level: 'batchim' },
  { id: 'gon', initial: 'ㄱ', medial: 'ㅗ', final: 'ㄴ', syllable: '곤', romanization: 'gon', soundHint: 'g/k + o + n', layout: 'cvc-horizontal', level: 'batchim' },
  { id: 'mun', initial: 'ㅁ', medial: 'ㅜ', final: 'ㄴ', syllable: '문', romanization: 'mun', soundHint: 'm + u + n', layout: 'cvc-horizontal', level: 'batchim' },
  { id: 'geul', initial: 'ㄱ', medial: 'ㅡ', final: 'ㄹ', syllable: '글', romanization: 'geul', soundHint: 'g/k + eu + l', layout: 'cvc-horizontal', level: 'batchim' },
  { id: 'sok', initial: 'ㅅ', medial: 'ㅗ', final: 'ㄱ', syllable: '속', romanization: 'sok', soundHint: 's + o + k', layout: 'cvc-horizontal', level: 'batchim' },
  { id: 'gwan', initial: 'ㄱ', medial: 'ㅘ', final: 'ㄴ', syllable: '관', romanization: 'gwan', soundHint: 'g/k + wa + n', layout: 'cvc-compound', level: 'batchim' },
  { id: 'won', initial: 'ㅇ', medial: 'ㅝ', final: 'ㄴ', syllable: '원', romanization: 'won', soundHint: 'silent + wo + n', layout: 'cvc-compound', level: 'batchim' },
  { id: 'gwin', initial: 'ㄱ', medial: 'ㅟ', final: 'ㄴ', syllable: '귄', romanization: 'gwin', soundHint: 'g/k + wi + n', layout: 'cvc-compound', level: 'batchim' },
  { id: 'gwang', initial: 'ㄱ', medial: 'ㅘ', final: 'ㅇ', syllable: '광', romanization: 'gwang', soundHint: 'g/k + wa + ng', layout: 'cvc-compound', level: 'batchim' },
];

