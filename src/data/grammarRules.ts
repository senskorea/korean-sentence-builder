export interface GrammarSubcard {
  id: string;
  topicId: string;
  topicTitle: string;
  stepNumber: number;
  totalSteps: number;
  badge: string;
  title: string;
  koreanTitle: string;
  formula?: string;
  summary: string;
  rules: string[];
  examples: {
    korean: string;
    pronunciation?: string;
    english: string;
  }[];
  practicePrompt: string;
  practiceTarget: string;
  practiceAnswer?: string;
}

export const GRAMMAR_TOPICS = [
  { id: "all", title: "All Cards (Sequential)", count: 23 },
  { id: "sound", title: "Phonetics & Liaison", count: 3 },
  { id: "copula", title: "Unit Prep 1: 이에요/예요", count: 4 },
  { id: "demo", title: "Unit Prep 2: Demonstratives", count: 4 },
  { id: "count", title: "Unit Prep 3: Numbers & Counters", count: 5 },
  { id: "morphemes", title: "Place Morphemes (관,점,실,장,원)", count: 3 },
  { id: "loc", title: "Unit Prep 4: Locations & 이/가", count: 4 }
];

export const GRAMMAR_SUBCARDS: GrammarSubcard[] = [
  // ==========================================
  // TOPIC 1: Phonetics & Liaison
  // ==========================================
  {
    id: "sound_1",
    topicId: "sound",
    topicTitle: "Phonetics & Sound Mechanics",
    stepNumber: 1,
    totalSteps: 3,
    badge: "Step 1 · Core Principle",
    title: "Phonetic Liaison Rule (연음 법칙)",
    koreanTitle: "연음 법칙의 기본 원리",
    formula: "Final Consonant (받침) + Silent Initial ㅇ → 받침 carries over to next syllable",
    summary: "When a syllable with a final consonant meets a syllable starting with silent ㅇ, the consonant sound carries over smoothly into the next block.",
    rules: [
      "In Korean pronunciation, syllables flow without pause when meeting silent ㅇ.",
      "The spelling stays identical, but the spoken sound transfers directly.",
      "Dictionaries show actual pronunciation in square brackets."
    ],
    examples: [
      { korean: "볼펜 이에요", pronunciation: "[볼페니에요]", english: "It is a ballpoint pen." },
      { korean: "책 이에요", pronunciation: "[채기에요]", english: "It is a book." },
      { korean: "물 이에요", pronunciation: "[무리에요]", english: "It is water." }
    ],
    practicePrompt: "Write the liaison bracket pronunciation for 책 이에요 on the canvas:",
    practiceTarget: "책 이에요",
    practiceAnswer: "[채기에요]"
  },
  {
    id: "sound_2",
    topicId: "sound",
    topicTitle: "Phonetics & Sound Mechanics",
    stepNumber: 2,
    totalSteps: 3,
    badge: "Step 2 · Batchim Rules",
    title: "7 Representative Batchim Sounds",
    koreanTitle: "받침의 7개 대표음",
    formula: "All final consonants collapse into [ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ]",
    summary: "Regardless of complex spelling, any final consonant at the end of a word collapses into one of 7 representative sounds.",
    rules: [
      "[ㄱ]: ㄱ, ㅋ, ㄲ (e.g. 책, 부엌, 밖)",
      "[ㄷ]: ㄷ, ㅌ, ㅅ, ㅆ, ㅈ, ㅊ, ㅎ (e.g. 옷, 꽃, 끝)",
      "[ㅂ]: ㅂ, ㅍ (e.g. 밥, 잎)"
    ],
    examples: [
      { korean: "옷", pronunciation: "[옫]", english: "Clothes (ㅅ collapses to ㄷ)" },
      { korean: "꽃", pronunciation: "[꼳]", english: "Flower (ㅊ collapses to ㄷ)" },
      { korean: "밖", pronunciation: "[박]", english: "Outside (ㄲ collapses to ㄱ)" }
    ],
    practicePrompt: "Write the representative sound for 옷 and 꽃 on the canvas:",
    practiceTarget: "옷 and 꽃",
    practiceAnswer: "Both pronounce as [ㄷ] sound ([옫], [꼳])"
  },
  {
    id: "sound_3",
    topicId: "sound",
    topicTitle: "Phonetics & Sound Mechanics",
    stepNumber: 3,
    totalSteps: 3,
    badge: "Step 3 · Practical Application",
    title: "Applying Liaison to Sentences",
    koreanTitle: "문장 속 연음 적용",
    formula: "한국 사람 + 이에요 → [한국 사라미에요]",
    summary: "Liaison applies continuously through compound phrases and copulas.",
    rules: [
      "사람 ends in ㅁ. Combined with 이에요, ㅁ moves over into 이에요 to sound like [사라미에요].",
      "Listen for the transferred sound when speaking with Koreans."
    ],
    examples: [
      { korean: "한국 사람이에요.", pronunciation: "[한국 사라미에요]", english: "I am a Korean person." },
      { korean: "선생님이에요.", pronunciation: "[선생니미에요]", english: "I am a teacher." }
    ],
    practicePrompt: "Practice writing the full sentence and bracket sound for 한국 사람이에요:",
    practiceTarget: "한국 사람이에요",
    practiceAnswer: "한국 사람이에요 [한국 사라미에요]"
  },

  // ==========================================
  // TOPIC 2: Unit Prep 1: 이에요 vs 예요
  // ==========================================
  {
    id: "copula_1",
    topicId: "copula",
    topicTitle: "Unit Prep 1: 반갑습니다",
    stepNumber: 1,
    totalSteps: 4,
    badge: "Step 1 · Core Copula",
    title: "The Identification Copula: To Be (am, is, are)",
    koreanTitle: "서술격 조사 이에요 / 예요",
    formula: "Noun ends in Vowel → 예요 | Noun ends in Consonant → 이에요",
    summary: "이에요 and 예요 mean am, is, or are in everyday polite speech. They attach directly to nouns with zero space.",
    rules: [
      "Vowel Ending (No 받침) → attach 예요 (e.g. 의사예요, 시계예요).",
      "Consonant Ending (With 받침) → attach 이에요 (e.g. 학생이에요, 선생님이에요).",
      "Never leave a space between the noun and the copula."
    ],
    examples: [
      { korean: "학생이에요.", pronunciation: "[학쌩이에요]", english: "I am a student." },
      { korean: "의사예요.", english: "I am a doctor." },
      { korean: "선생님이에요.", pronunciation: "[선생니미에요]", english: "I am a teacher." }
    ],
    practicePrompt: "Attach the correct copula to 학생 (student) and 의사 (doctor):",
    practiceTarget: "학생 + copula | 의사 + copula",
    practiceAnswer: "학생이에요 | 의사예요"
  },
  {
    id: "copula_2",
    topicId: "copula",
    topicTitle: "Unit Prep 1: 반갑습니다",
    stepNumber: 2,
    totalSteps: 4,
    badge: "Step 2 · Batchim Choice",
    title: "Batchim Conditioning Drill",
    koreanTitle: "받침 유무에 따른 형태 선택",
    formula: "Check final syllable: Final consonant? 이에요. Open vowel? 예요.",
    summary: "Korean grammar constantly branches based on whether the preceding noun has a final consonant.",
    rules: [
      "폴 (Paul) ends in ㄹ → 폴이에요.",
      "소라 (Sora) ends in ㅏ → 소라예요.",
      "시계 (Clock) ends in ㅔ → 시계예요."
    ],
    examples: [
      { korean: "저는 폴이에요.", english: "I am Paul." },
      { korean: "저는 미나예요.", english: "I am Mina." },
      { korean: "가방이에요.", english: "It is a bag." }
    ],
    practicePrompt: "Write 'I am Paul' in polite Korean on the canvas:",
    practiceTarget: "저는 폴...",
    practiceAnswer: "저는 폴이에요."
  },
  {
    id: "copula_3",
    topicId: "copula",
    topicTitle: "Unit Prep 1: 반갑습니다",
    stepNumber: 3,
    totalSteps: 4,
    badge: "Step 3 · Polite Title",
    title: "Respectful Name Title 씨 (ssi)",
    koreanTitle: "존칭 접미사 씨 사용 규칙",
    formula: "Given Name + 씨 (폴 씨, 앤디 씨, 소라 씨)",
    summary: "씨 attaches to a person's name to show respectful politeness, similar to Mr. or Ms.",
    rules: [
      "Rule 1: Never attach 씨 to only a surname (saying 김 씨 sounds condescending or dismissive).",
      "Rule 2: Never attach 씨 to your own name (never say 저는 폴 씨예요).",
      "Attach to given names (폴 씨) or full names (김미나 씨)."
    ],
    examples: [
      { korean: "앤디 씨는 학생이에요?", english: "Andy, are you a student?" },
      { korean: "소라 씨, 안녕하세요?", english: "Hello, Sora." },
      { korean: "저는 마이클이에요.", english: "I am Michael (no 씨 on oneself)." }
    ],
    practicePrompt: "How do you ask 'Andy, are you a student?' Write on canvas:",
    practiceTarget: "Ask Andy politely",
    practiceAnswer: "앤디 씨는 학생이에요?"
  },
  {
    id: "copula_4",
    topicId: "copula",
    topicTitle: "Unit Prep 1: 반갑습니다",
    stepNumber: 4,
    totalSteps: 4,
    badge: "Step 4 · Questions & Answers",
    title: "Question Intonation & Answering",
    koreanTitle: "의문문과 대답 (네 / 아니요)",
    formula: "Question: [Noun]이에요? (rising pitch) | Answer: 네, / 아니요,",
    summary: "In Korean informal polite style, questions share identical spelling and syntax with statements. Only intonation rises.",
    rules: [
      "Affirmative Answer: 네, [Noun]이에요 / 예요.",
      "Negative Answer: 아니요, [Noun]이에요 / 예요."
    ],
    examples: [
      { korean: "의사예요? 네, 의사예요.", english: "Are you a doctor? Yes, I am a doctor." },
      { korean: "선생님이에요? 아니요, 학생이에요.", english: "Are you a teacher? No, I am a student." }
    ],
    practicePrompt: "Write an answer: 'No, I am a student' on the canvas:",
    practiceTarget: "아니요, ...",
    practiceAnswer: "아니요, 학생이에요."
  },

  // ==========================================
  // TOPIC 3: Unit Prep 2: Demonstratives
  // ==========================================
  {
    id: "demo_1",
    topicId: "demo",
    topicTitle: "Unit Prep 2: 이게 뭐예요?",
    stepNumber: 1,
    totalSteps: 4,
    badge: "Step 1 · Spatial Distance",
    title: "Demonstrative Pronouns: 이게 vs 그게 vs 저게",
    koreanTitle: "지시대명사의 공간적 거리",
    formula: "이게 (near speaker) | 그게 (near listener) | 저게 (far from both)",
    summary: "Demonstratives indicate physical distance relative to speaker and listener.",
    rules: [
      "이게: Contraction of 이것이 (This item, right near speaker).",
      "그게: Contraction of 그것이 (That item, near listener, or previously mentioned).",
      "저게: Contraction of 저것이 (That item over there, far from both)."
    ],
    examples: [
      { korean: "이게 뭐예요?", english: "What is this (right here next to me)?" },
      { korean: "그게 뭐예요?", english: "What is that (next to you)?" },
      { korean: "저게 뭐예요?", english: "What is that (over there in distance)?" }
    ],
    practicePrompt: "Write 'What is this thing?' using the near-speaker demonstrative:",
    practiceTarget: "This thing what is it?",
    practiceAnswer: "이게 뭐예요?"
  },
  {
    id: "demo_2",
    topicId: "demo",
    topicTitle: "Unit Prep 2: 이게 뭐예요?",
    stepNumber: 2,
    totalSteps: 4,
    badge: "Step 2 · Identifying Objects",
    title: "Asking and Answering: 뭐예요?",
    koreanTitle: "사물 묻고 답하기",
    formula: "Question: 이게 뭐예요? | Answer: [Noun]이에요 / 예요.",
    summary: "뭐 is the contraction of 무엇 (what). Combined with 예요, it forms 뭐예요? (What is it?).",
    rules: [
      "이게 책이에요. (This is a book.)",
      "저게 시계예요. (That over there is a clock.)",
      "그게 볼펜이에요. (That next to you is a pen.)"
    ],
    examples: [
      { korean: "이게 뭐예요? 책이에요.", english: "What is this? It is a book." },
      { korean: "저게 뭐예요? 시계예요.", english: "What is that over there? It is a clock." }
    ],
    practicePrompt: "Write question and answer: 'What is this?' 'It is a clock.'",
    practiceTarget: "Q: This what? A: Clock.",
    practiceAnswer: "이게 뭐예요? 시계예요."
  },
  {
    id: "demo_3",
    topicId: "demo",
    topicTitle: "Unit Prep 2: 이게 뭐예요?",
    stepNumber: 3,
    totalSteps: 4,
    badge: "Step 3 · Possession",
    title: "Possession: 누구 거예요? and 제 거예요",
    koreanTitle: "소유 표현 (누구 거예요? / 제 거예요)",
    formula: "저의 (my) contracts to 제 | 누구 (who) + 거 (thing) + 예요",
    summary: "In polite Korean, my contracts from 저의 into 제. Possession of an item attaches 거 (thing) + 예요.",
    rules: [
      "누구 거예요? = Whose is it?",
      "제 거예요 = It is mine (polite).",
      "Other people: [Name] 씨 거예요 (e.g. 소라 씨 거예요 = It is Sora's)."
    ],
    examples: [
      { korean: "이거 누구 거예요?", english: "Whose is this?" },
      { korean: "제 거예요.", english: "It is mine." },
      { korean: "앤디 씨 거예요.", english: "It is Andy's." }
    ],
    practicePrompt: "Write 'Whose is this?' and 'It is mine' on the canvas:",
    practiceTarget: "Whose? Mine.",
    practiceAnswer: "이거 누구 거예요? 제 거예요."
  },
  {
    id: "demo_4",
    topicId: "demo",
    topicTitle: "Unit Prep 2: 이게 뭐예요?",
    stepNumber: 4,
    totalSteps: 4,
    badge: "Step 4 · Contracted Forms",
    title: "Summary of Object Demonstrative Forms",
    koreanTitle: "지시대명사 축약형 정리",
    formula: "Subject form (이게/그게/저게) vs General object form (이거/그거/저거)",
    summary: "In fast spoken Korean, Koreans constantly contract demonstrative pronouns.",
    rules: [
      "Subject marker 이: 이것이 → 이게, 그것이 → 그게, 저것이 → 저게.",
      "Topic marker 는: 이것은 → 이건, 그것은 → 그건, 저것은 → 저건.",
      "Object/General: 이것 → 이거, 그것 → 그거, 저것 → 저거."
    ],
    examples: [
      { korean: "이건 제 거예요.", english: "As for this, it is mine." },
      { korean: "그거 얼마예요?", english: "How much is that thing?" },
      { korean: "저게 뭐예요?", english: "What is that thing over there?" }
    ],
    practicePrompt: "Write 'As for this, it is mine' using 이건 제 거예요:",
    practiceTarget: "이건 제 거예요",
    practiceAnswer: "이건 제 거예요."
  },

  // ==========================================
  // TOPIC 4: Unit Prep 3: Numbers & Counters
  // ==========================================
  {
    id: "count_1",
    topicId: "count",
    topicTitle: "Unit Prep 3: 커피 주세요",
    stepNumber: 1,
    totalSteps: 5,
    badge: "Step 1 · Existence",
    title: "Existence & Possession: 있어요 vs 없어요",
    koreanTitle: "존재와 소유 (있어요 / 없어요)",
    formula: "[Noun] 있어요 (Have / There is) | [Noun] 없어요 (Don't have / There isn't)",
    summary: "Use 있어요 to express that you have an item or that something exists. Use 없어요 for the negative.",
    rules: [
      "Question: [Noun] 있어요? (Do you have [Noun]?).",
      "Affirmative: 네, 있어요. (Yes, we have it.)",
      "Negative: 아니요, 없어요. (No, we do not have it.)"
    ],
    examples: [
      { korean: "커피 있어요?", english: "Do you have coffee?" },
      { korean: "네, 있어요.", english: "Yes, we have it." },
      { korean: "아니요, 없어요.", english: "No, we don't have it." },
      { korean: "우산 있어요?", english: "Do you have an umbrella?" }
    ],
    practicePrompt: "Write the question 'Do you have coffee?' on the canvas:",
    practiceTarget: "커피 있어요?",
    practiceAnswer: "커피 있어요?"
  },
  {
    id: "count_2",
    topicId: "count",
    topicTitle: "Unit Prep 3: 커피 주세요",
    stepNumber: 2,
    totalSteps: 5,
    badge: "Step 2 · Requests",
    title: "Polite Requests: 주세요 (Please give me)",
    koreanTitle: "정중한 요청: 주세요",
    formula: "[Noun] 주세요 | [Noun] + [Number] + [Counter] 주세요",
    summary: "주세요 comes from the verb 주다 (to give). In cafes and stores, it is the standard phrase for ordering.",
    rules: [
      "Basic request: 물 주세요 (Water, please).",
      "With quantity: [Noun] + [Number] + [Counter] + 주세요.",
      "Always attach with clear pronunciation."
    ],
    examples: [
      { korean: "물 주세요.", english: "Water, please." },
      { korean: "커피 한 잔 주세요.", english: "One cup of coffee, please." },
      { korean: "메뉴판 주세요.", english: "Menu, please." }
    ],
    practicePrompt: "Write 'Water, please' and 'Coffee, please' on the canvas:",
    practiceTarget: "물 주세요 | 커피 주세요",
    practiceAnswer: "물 주세요 | 커피 주세요"
  },
  {
    id: "count_3",
    topicId: "count",
    topicTitle: "Unit Prep 3: 커피 주세요",
    stepNumber: 3,
    totalSteps: 5,
    badge: "Step 3 · Number Contractions",
    title: "Native Korean Numbers 1 to 4 and 20 Contractions",
    koreanTitle: "순우리말 수사의 변형 (한, 두, 세, 네, 스무)",
    formula: "하나 → 한 | 둘 → 두 | 셋 → 세 | 넷 → 네 | 스물 → 스무",
    summary: "When Native Korean numbers 1 through 4 and 20 precede counters, they drop their final sound.",
    rules: [
      "1: 하나 + counter → 한 (한 개, 한 명, 한 잔)",
      "2: 둘 + counter → 두 (두 개, 두 병, 두 잔)",
      "3: 셋 + counter → 세 (세 개, 세 권, 세 살)",
      "4: 넷 + counter → 네 (네 개, 네 명, 네 살)",
      "20: 스물 + counter → 스무 (스무 살)"
    ],
    examples: [
      { korean: "한 개", english: "One item" },
      { korean: "두 잔", english: "Two cups" },
      { korean: "세 권", english: "Three books" },
      { korean: "스무 살", english: "20 years old" }
    ],
    practicePrompt: "Write 'two cups' (둘 -> 두) and 'three books' (셋 -> 세) on canvas:",
    practiceTarget: "2 cups | 3 books",
    practiceAnswer: "두 잔 | 세 권"
  },
  {
    id: "count_4",
    topicId: "count",
    topicTitle: "Unit Prep 3: 커피 주세요",
    stepNumber: 4,
    totalSteps: 5,
    badge: "Step 4 · Counting Units",
    title: "Essential Korean Counters",
    koreanTitle: "필수 단위 명사 (개, 명, 병, 잔, 권, 살)",
    formula: "Noun + Native Number (contracted) + Counter",
    summary: "Korean requires specific counter words matching the physical shape or category of objects.",
    rules: [
      "개: General inanimate objects (사과 세 개 = 3 apples).",
      "명: People (친구 두 명 = 2 friends).",
      "잔: Cups and glasses (커피 한 잔 = 1 cup of coffee).",
      "병: Bottles (콜라 두 병 = 2 bottles of cola).",
      "권: Books and bound volumes (책 세 권 = 3 books).",
      "자루: Pens and writing utensils (연필 네 자루 = 4 pencils).",
      "살: Age in years (스무 살 = 20 years old)."
    ],
    examples: [
      { korean: "커피 두 잔 주세요.", english: "Please give me two cups of coffee." },
      { korean: "사과 세 개 있어요.", english: "There are three apples." },
      { korean: "몇 살이에요? 스무 살이에요.", english: "How old are you? I am 20 years old." }
    ],
    practicePrompt: "Write an order for 'two cups of coffee, please' on canvas:",
    practiceTarget: "커피 2 cups 주세요",
    practiceAnswer: "커피 두 잔 주세요."
  },
  {
    id: "count_5",
    topicId: "count",
    topicTitle: "Unit Prep 3: 커피 주세요",
    stepNumber: 5,
    totalSteps: 5,
    badge: "Step 5 · Age Inquiries",
    title: "Asking and Stating Age: 몇 살이에요?",
    koreanTitle: "나이 묻고 답하기",
    formula: "Question: 몇 살이에요? | Answer: [Native Number] 살이에요.",
    summary: "Combine question word 몇 (how many) with age counter 살 to ask someone's age politely.",
    rules: [
      "몇 살이에요? = How old are you?",
      "Use Native numbers: 스물 contracts to 스무 before 살 (스무 살이에요 = I am 20).",
      "Thirty is 서른 (서른 살), forty is 마흔 (마흔 살)."
    ],
    examples: [
      { korean: "몇 살이에요?", english: "How old are you?" },
      { korean: "스물네 살이에요.", english: "I am 24 years old." },
      { korean: "스무 살이에요.", english: "I am 20 years old." }
    ],
    practicePrompt: "Write 'How old are you?' and 'I am 20 years old' on canvas:",
    practiceTarget: "How old? 20 years old.",
    practiceAnswer: "몇 살이에요? 스무 살이에요."
  },

  // ==========================================
  // TOPIC 5: Place Morphemes
  // ==========================================
  {
    id: "morph_1",
    topicId: "morphemes",
    topicTitle: "Place Morphemes & Suffixes",
    stepNumber: 1,
    totalSteps: 3,
    badge: "Step 1 · Public Halls & Stores",
    title: "Public Buildings (관) and Shops (점)",
    koreanTitle: "공공 건물 (관) 및 상점 (점)",
    formula: "Root + 관 (Public Pavilion) | Root + 점 (Commercial Store)",
    summary: "Recognize functional Hanja suffixes to immediately understand new place words.",
    rules: [
      "관 (館): Large public pavilion or hall (도서관 = library, 영화관 = cinema, 미술관 = art museum, 대사관 = embassy).",
      "점 (店): Store or commercial shop (서점 = bookstore, 문구점 = stationery shop, 백화점 = department store, 편의점 = convenience store)."
    ],
    examples: [
      { korean: "도서관", english: "Library (도서 books + 관 hall)" },
      { korean: "영화관", english: "Cinema (영화 movie + 관 pavilion)" },
      { korean: "서점", english: "Bookstore (서 book + 점 shop)" },
      { korean: "편의점", english: "Convenience store (편의 convenience + 점 store)" }
    ],
    practicePrompt: "Write the Korean words for 'library' (관) and 'bookstore' (점):",
    practiceTarget: "Library | Bookstore",
    practiceAnswer: "도서관 | 서점"
  },
  {
    id: "morph_2",
    topicId: "morphemes",
    topicTitle: "Place Morphemes & Suffixes",
    stepNumber: 2,
    totalSteps: 3,
    badge: "Step 2 · Rooms, Grounds & Institutes",
    title: "Rooms (실), Grounds (장), and Institutes (원)",
    koreanTitle: "실 (방), 장 (마당), 원 (기관)",
    formula: "Root + 실 (Room) | Root + 장 (Open Grounds) | Root + 원 (Institute)",
    summary: "Every indoor room, open field, and educational or medical institution uses a predictable suffix.",
    rules: [
      "실 (室): Room (교실 = classroom, 사무실 = office, 화장실 = restroom, 회의실 = meeting room).",
      "장 (場): Open venue or grounds (운동장 = sports field, 수영장 = pool, 극장 = theatre, 공항 = airport).",
      "원 (院): Designated institute (병원 = hospital, 학원 = private academy, 법원 = court)."
    ],
    examples: [
      { korean: "화장실", english: "Restroom (화장 toilet/makeup + 실 room)" },
      { korean: "수영장", english: "Swimming pool (수영 swim + 장 venue)" },
      { korean: "병원", english: "Hospital (병 illness + 원 institute)" }
    ],
    practicePrompt: "Write the Korean words for 'restroom' (실) and 'hospital' (원):",
    practiceTarget: "Restroom | Hospital",
    practiceAnswer: "화장실 | 병원"
  },
  {
    id: "morph_3",
    topicId: "morphemes",
    topicTitle: "Place Morphemes & Suffixes",
    stepNumber: 3,
    totalSteps: 3,
    badge: "Step 3 · Deconstruction Drill",
    title: "Morpheme Deconstruction Practice",
    koreanTitle: "접미사 분석 실습",
    formula: "Look at the final syllable of building names to determine their function",
    summary: "When you encounter a new Korean word ending in 관, 점, 실, 장, or 원, you already know its functional category.",
    rules: [
      "관 = Hall / Public Venue",
      "점 = Shop / Store",
      "실 = Room",
      "장 = Open Grounds / Venue",
      "원 = Institute"
    ],
    examples: [
      { korean: "대사관", english: "Embassy (대사 ambassador + 관 hall)" },
      { korean: "문구점", english: "Stationery store (문구 stationery + 점 shop)" },
      { korean: "사무실", english: "Office (사무 desk work + 실 room)" }
    ],
    practicePrompt: "Write down the 5 place suffix blocks: 관, 점, 실, 장, 원:",
    practiceTarget: "5 place suffixes",
    practiceAnswer: "관 · 점 · 실 · 장 · 원"
  },

  // ==========================================
  // TOPIC 6: Unit Prep 4: Locations & 이/가
  // ==========================================
  {
    id: "loc_1",
    topicId: "loc",
    topicTitle: "Unit Prep 4: 서울역이 어디에 있어요?",
    stepNumber: 1,
    totalSteps: 4,
    badge: "Step 1 · Subject Marker",
    title: "The Subject Marker: 이 vs 가",
    koreanTitle: "주격 조사: 이 / 가",
    formula: "Noun with 받침 → attach 이 | Noun without 받침 → attach 가",
    summary: "The subject marker 이/가 marks the grammatical subject of the clause and the main focus of information.",
    rules: [
      "Consonant ending (With 받침): attach 이 (e.g. 서울역이, 은행이, 화장실이).",
      "Vowel ending (No 받침): attach 가 (e.g. 학교가, 의사가, 커피가).",
      "Be careful: 서울역 ends in ㄱ → 서울역이. 백화점 ends in ㅁ → 백화점이."
    ],
    examples: [
      { korean: "서울역이 어디에 있어요?", english: "Where is Seoul Station?" },
      { korean: "학교가 어디에 있어요?", english: "Where is the school?" },
      { korean: "은행이 있어요.", english: "There is a bank." }
    ],
    practicePrompt: "Attach the correct subject marker (이 or 가) to 서울역 and 학교:",
    practiceTarget: "서울역 [ 이 | 가 ] · 학교 [ 이 | 가 ]",
    practiceAnswer: "서울역이 · 학교가"
  },
  {
    id: "loc_2",
    topicId: "loc",
    topicTitle: "Unit Prep 4: 서울역이 어디에 있어요?",
    stepNumber: 2,
    totalSteps: 4,
    badge: "Step 2 · Asking Where",
    title: "Asking Where: 어디에 있어요?",
    koreanTitle: "위치 묻기: 어디에 있어요?",
    formula: "[Noun]이/가 어디에 있어요? (Where is [Noun]?)",
    summary: "어디 means where. Combine with location particle 에 and copula 있어요 to ask for directions.",
    rules: [
      "서울역이 어디에 있어요? (Where is Seoul Station?)",
      "화장실이 어디에 있어요? (Where is the restroom?)",
      "식당이 어디에 있어요? (Where is the restaurant?)"
    ],
    examples: [
      { korean: "화장실이 어디에 있어요?", english: "Where is the restroom?" },
      { korean: "은행이 어디에 있어요?", english: "Where is the bank?" }
    ],
    practicePrompt: "Write 'Where is the restroom?' with correct subject marker and 어디에 있어요:",
    practiceTarget: "Where is the restroom?",
    practiceAnswer: "화장실이 어디에 있어요?"
  },
  {
    id: "loc_3",
    topicId: "loc",
    topicTitle: "Unit Prep 4: 서울역이 어디에 있어요?",
    stepNumber: 3,
    totalSteps: 4,
    badge: "Step 3 · Giving Location",
    title: "Answering Locations: -에 있어요 and Floors",
    koreanTitle: "위치 답하기: [장소]에 있어요",
    formula: "[Location] + 에 있어요 (It is at / on [Location])",
    summary: "Particle 에 indicates the static location where someone or something exists with 있어요/없어요.",
    rules: [
      "Floor counter 층 (Sino-Korean numbers): 1층 (일층), 2층 (이층), 3층 (삼층).",
      "1층에 있어요. (It is on the 1st floor.)",
      "저기에 있어요. (It is over there.)"
    ],
    examples: [
      { korean: "약국이 1층에 있어요.", pronunciation: "[약꾸기 일층에 있어요]", english: "The pharmacy is on the 1st floor." },
      { korean: "은행이 2층에 있어요.", english: "The bank is on the 2nd floor." },
      { korean: "저기에 있어요.", english: "It is over there." }
    ],
    practicePrompt: "Write 'The pharmacy is on the 1st floor' on canvas:",
    practiceTarget: "약국 + 1층 + 에 있어요",
    practiceAnswer: "약국이 1층에 있어요."
  },
  {
    id: "loc_4",
    topicId: "loc",
    topicTitle: "Unit Prep 4: 서울역이 어디에 있어요?",
    stepNumber: 4,
    totalSteps: 4,
    badge: "Step 4 · Motion Verbs",
    title: "Destination Particle -에 with 가다 (Go) and 오다 (Come)",
    koreanTitle: "방향 및 목적지 조사: -에 가다 / 오다",
    formula: "[Destination] + 에 가요 (Go to) | [Destination] + 에 와요 (Come to)",
    summary: "When paired with verbs of motion like 가다 and 오다, particle 에 marks the destination.",
    rules: [
      "집에 가요 = I go home.",
      "학교에 가요 = I go to school.",
      "한국에 와요 = I come to Korea.",
      "Question: 어디에 가요? = Where are you going?"
    ],
    examples: [
      { korean: "어디에 가요? 집에 가요.", english: "Where are you going? I am going home." },
      { korean: "한국에 와요.", english: "Come to Korea." }
    ],
    practicePrompt: "Write question and answer: 'Where are you going?' 'I am going home.'",
    practiceTarget: "Q: Where going? A: Go home.",
    practiceAnswer: "어디에 가요? 집에 가요."
  }
];
