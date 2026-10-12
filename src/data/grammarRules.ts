export interface GrammarExample {
  korean: string;
  pronunciation?: string;
  english: string;
  note?: string;
}

export interface GrammarDrillItem {
  id: string;
  prompt: string;
  target: string;
  options?: string[];
  correctAnswer: string;
  fullSentence: string;
  explanation: string;
}

export interface GrammarCard {
  id: string;
  order: number;
  unit: string;
  title: string;
  koreanTitle: string;
  tag: string;
  formula: string;
  summary: string;
  rules: string[];
  examples: GrammarExample[];
  drills: GrammarDrillItem[];
}

export const GRAMMAR_CARDS: GrammarCard[] = [
  {
    id: "sound_mechanics",
    order: 1,
    unit: "Phonetics & Syllables",
    title: "Phonetic Liaison and Representative Batchim",
    koreanTitle: "연음 법칙 및 받침 7개 대표음",
    tag: "phonetics",
    formula: "Word ending in 받침 + silent ㅇ syllable → 받침 sound carries over into ㅇ",
    summary: "Final consonants carry over into the next syllable when it begins with silent ㅇ, producing smooth natural speech.",
    rules: [
      "Liaison Rule: When a 받침 syllable meets ㅇ, move the final consonant sound directly into the next syllable.",
      "7 Representative Sounds: Any final consonant collapses into [ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, ㅇ] at word boundaries or before consonants.",
      "Bracket Notation: Dictionaries show actual pronunciation in brackets, such as [채기에요] for 책이에요."
    ],
    examples: [
      { korean: "볼펜 이에요", pronunciation: "[볼페니에요]", english: "It is a ballpoint pen." },
      { korean: "책 이에요", pronunciation: "[채기에요]", english: "It is a book." },
      { korean: "사람 이에요", pronunciation: "[사라미에요]", english: "I am a person." },
      { korean: "한국 사람 이에요", pronunciation: "[한국 사라미에요]", english: "I am a Korean person." },
      { korean: "물 이에요", pronunciation: "[무리에요]", english: "It is water." }
    ],
    drills: [
      {
        id: "sound_drill_1",
        prompt: "Write the phonetic pronunciation for 책 이에요 using liaison brackets.",
        target: "책이에요",
        options: ["[채기에요]", "[책이에요]", "[채기예요]"],
        correctAnswer: "[채기에요]",
        fullSentence: "책이에요 → [채기에요]",
        explanation: "Final consonant ㄱ carries over into the silent ㅇ of 이에요, pronounced [채기에요]."
      },
      {
        id: "sound_drill_2",
        prompt: "Write the phonetic pronunciation for 볼펜 이에요.",
        target: "볼펜이에요",
        options: ["[볼페니에요]", "[볼펜이에요]", "[볼페니예요]"],
        correctAnswer: "[볼페니에요]",
        fullSentence: "볼펜이에요 → [볼페니에요]",
        explanation: "Final consonant ㄴ carries over into 이에요, producing [볼페니에요]."
      },
      {
        id: "sound_drill_3",
        prompt: "Which representative sound does the final consonant in 옷 produce?",
        target: "옷",
        options: ["[ㄷ]", "[ㅅ]", "[ㄱ]"],
        correctAnswer: "[ㄷ]",
        fullSentence: "옷 → pronounced [옫]",
        explanation: "Consonants ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ collapse into the representative sound [ㄷ]."
      }
    ]
  },
  {
    id: "copula_ieyo_yeyo",
    order: 2,
    unit: "Unit Prep 1",
    title: "Identification Copula: 이에요 vs 예요 and Polite Title 씨",
    koreanTitle: "이에요 / 예요 및 호칭 씨",
    tag: "unit_prep_1",
    formula: "Noun + 이에요 (with 받침) | Noun + 예요 (without 받침)",
    summary: "The polite identification copula attaches directly to a noun without spaces. Use 이에요 after consonants and 예요 after vowels.",
    rules: [
      "Consonant Ending (With 받침) → attach 이에요 (e.g. 학생이에요, 선생님이에요).",
      "Vowel Ending (No 받침) → attach 예요 (e.g. 의사예요, 시계예요).",
      "Questions use the identical form with rising intonation and a question mark.",
      "Honorific Title 씨 attaches to given names or full names (폴 씨, 소라 씨). Never use with surname alone, and never with your own name."
    ],
    examples: [
      { korean: "학생이에요.", pronunciation: "[학쌩이에요]", english: "I am a student." },
      { korean: "선생님이에요.", pronunciation: "[선생니미에요]", english: "I am a teacher." },
      { korean: "의사예요.", english: "I am a doctor." },
      { korean: "시계예요.", english: "It is a clock." },
      { korean: "앤디 씨는 학생이에요?", english: "Andy, are you a student?" }
    ],
    drills: [
      {
        id: "copula_drill_1",
        prompt: "Choose the correct copula for 학생 (student).",
        target: "학생",
        options: ["이에요", "예요"],
        correctAnswer: "이에요",
        fullSentence: "학생이에요.",
        explanation: "학생 has final consonant 받침 ㅇ, so attach 이에요."
      },
      {
        id: "copula_drill_2",
        prompt: "Choose the correct copula for 의사 (doctor).",
        target: "의사",
        options: ["이에요", "예요"],
        correctAnswer: "예요",
        fullSentence: "의사예요.",
        explanation: "의사 ends in vowel ㅏ with no 받침, so attach 예요."
      },
      {
        id: "copula_drill_3",
        prompt: "Choose the correct copula for 선생님 (teacher).",
        target: "선생님",
        options: ["이에요", "예요"],
        correctAnswer: "이에요",
        fullSentence: "선생님이에요.",
        explanation: "선생님 ends in final consonant ㅁ, so attach 이에요."
      },
      {
        id: "copula_drill_4",
        prompt: "How do you introduce yourself as Paul politely?",
        target: "저",
        options: ["저는 폴이에요.", "저는 폴 씨예요.", "저는 김 씨예요."],
        correctAnswer: "저는 폴이에요.",
        fullSentence: "저는 폴이에요.",
        explanation: "Never attach 씨 to your own name. 폴 ends in 받침 ㄹ, so attach 이에요."
      }
    ]
  },
  {
    id: "demonstratives_possession",
    order: 3,
    unit: "Unit Prep 2",
    title: "Demonstratives: 이게, 그게, 저게 and Possession",
    koreanTitle: "지시대명사 (이게/그게/저게) 및 소유 표현",
    tag: "unit_prep_2",
    formula: "이게 (near speaker) | 그게 (near listener) | 저게 (far from both) + 뭐예요?",
    summary: "Demonstrative pronouns pinpoint objects based on physical distance. Possession is expressed using 제 거예요 (mine) or 누구 거예요? (whose).",
    rules: [
      "이게 (이것이): Close to the speaker.",
      "그게 (그것이): Close to the listener or previously mentioned.",
      "저게 (저것이): Far from both speaker and listener.",
      "뭐예요?: Contraction of 무엇 (what) + 예요 (is) → What is it?",
      "Possession: 저의 (my) contracts to 제. Add 거 (thing) + 예요 → 제 거예요 (It is mine)."
    ],
    examples: [
      { korean: "이게 뭐예요?", english: "What is this thing (near me)?" },
      { korean: "그게 뭐예요?", english: "What is that thing (near you)?" },
      { korean: "저게 뭐예요?", english: "What is that thing over there?" },
      { korean: "이거 누구 거예요?", english: "Whose is this?" },
      { korean: "제 거예요.", english: "It is mine." },
      { korean: "소라 씨 거예요.", english: "It is Sora's." }
    ],
    drills: [
      {
        id: "demo_drill_1",
        prompt: "Ask what an object right in front of you is.",
        target: "This near speaker",
        options: ["이게 뭐예요?", "그게 뭐예요?", "저게 뭐예요?"],
        correctAnswer: "이게 뭐예요?",
        fullSentence: "이게 뭐예요?",
        explanation: "Use 이게 when the object is physically close to the speaker."
      },
      {
        id: "demo_drill_2",
        prompt: "Ask what an object far away across the room is.",
        target: "That over there",
        options: ["저게 뭐예요?", "이게 뭐예요?", "그게 뭐예요?"],
        correctAnswer: "저게 뭐예요?",
        fullSentence: "저게 뭐예요?",
        explanation: "Use 저게 when the object is distant from both speaker and listener."
      },
      {
        id: "demo_drill_3",
        prompt: "How do you say 'It is mine' politely?",
        target: "Mine",
        options: ["제 거예요.", "저 거예요.", "내 거예요."],
        correctAnswer: "제 거예요.",
        fullSentence: "제 거예요.",
        explanation: "저의 (my) contracts to 제 in polite speech, forming 제 거예요."
      }
    ]
  },
  {
    id: "existence_requests_counters",
    order: 4,
    unit: "Unit Prep 3",
    title: "Existence (있어요/없어요), Requests (주세요), and Native Counters",
    koreanTitle: "존재 (있어요/없어요), 요청 (주세요), 및 순우리말 수사",
    tag: "unit_prep_3",
    formula: "[Noun] 있어요 / 없어요 | [Noun] + [Number] + [Counter] 주세요",
    summary: "State existence and possession with 있어요/없어요, request items politely with 주세요, and count objects using modified Native Korean numbers.",
    rules: [
      "있어요 = Have / There is. 없어요 = Do not have / There is not.",
      "주세요 = Please give me (attached after noun or counter phrase).",
      "Native Numbers 1 to 4 and 20 contract before counters: 하나 → 한, 둘 → 두, 셋 → 세, 넷 → 네, 스물 → 스무.",
      "Counters: 개 (general items), 명 (people), 잔 (cups), 병 (bottles), 권 (books), 자루 (pens/pencils), 살 (age)."
    ],
    examples: [
      { korean: "커피 있어요?", english: "Do you have coffee?" },
      { korean: "네, 있어요.", english: "Yes, we have it." },
      { korean: "아니요, 없어요.", english: "No, we don't have it." },
      { korean: "커피 한 잔 주세요.", english: "Please give me one cup of coffee." },
      { korean: "콜라 두 병 주세요.", english: "Please give me two bottles of cola." },
      { korean: "연필 세 자루 주세요.", english: "Please give me three pencils." },
      { korean: "몇 살이에요? 스무 살이에요.", english: "How old are you? I am 20 years old." }
    ],
    drills: [
      {
        id: "count_drill_1",
        prompt: "Order two cups of coffee politely.",
        target: "커피 2 cups",
        options: ["커피 두 잔 주세요.", "커피 둘 잔 주세요.", "커피 이 잔 주세요."],
        correctAnswer: "커피 두 잔 주세요.",
        fullSentence: "커피 두 잔 주세요.",
        explanation: "둘 contracts to 두 before the counter 잔 (cup)."
      },
      {
        id: "count_drill_2",
        prompt: "Say 'I am 20 years old' in Korean.",
        target: "20 years old",
        options: ["스무 살이에요.", "스물 살이에요.", "이십 살이에요."],
        correctAnswer: "스무 살이에요.",
        fullSentence: "스무 살이에요.",
        explanation: "스물 drops final ㄹ to become 스무 before the age counter 살."
      },
      {
        id: "count_drill_3",
        prompt: "Ask if they have an umbrella.",
        target: "Do you have umbrella?",
        options: ["우산 있어요?", "우산 없어요?", "우산 주세요?"],
        correctAnswer: "우산 있어요?",
        fullSentence: "우산 있어요?",
        explanation: "있어요? asks whether an item exists or is available."
      },
      {
        id: "count_drill_4",
        prompt: "Which counter is used for books and notebooks?",
        target: "Books counter",
        options: ["권", "개", "자루"],
        correctAnswer: "권",
        fullSentence: "책 세 권 (three books)",
        explanation: "권 is the dedicated counting unit for bound volumes and books."
      }
    ]
  },
  {
    id: "place_morphemes",
    order: 5,
    unit: "Place Morphemes",
    title: "Place and Building Suffixes (관, 점, 실, 장, 원)",
    koreanTitle: "장소 접미사 (관, 점, 실, 장, 원)",
    tag: "places",
    formula: "Core Root + Functional Suffix (관 / 점 / 실 / 장 / 원)",
    summary: "Korean place names combine logical building blocks. Recognize the suffix to immediately understand a venue's function.",
    rules: [
      "관 (館): Large building or public pavilion (영화관 = cinema, 도서관 = library, 미술관 = art gallery, 대사관 = embassy).",
      "점 (店): Store or shop (서점 = bookstore, 문구점 = stationery shop, 백화점 = department store, 편의점 = convenience store).",
      "실 (室): Room (교실 = classroom, 사무실 = office, 화장실 = restroom, 회의실 = meeting room).",
      "장 (場): Open ground or venue (운동장 = sports field, 수영장 = pool, 극장 = theatre, 공항 = airport).",
      "원 (院): Institute or designated establishment (병원 = hospital, 학원 = academy, 법원 = court)."
    ],
    examples: [
      { korean: "도서관", english: "Library (도서 books + 관 hall)" },
      { korean: "서점", english: "Bookstore (서 book + 점 store)" },
      { korean: "교실", english: "Classroom (교 teaching + 실 room)" },
      { korean: "수영장", english: "Swimming pool (수영 swim + 장 venue)" },
      { korean: "병원", english: "Hospital (병 illness + 원 institute)" }
    ],
    drills: [
      {
        id: "place_drill_1",
        prompt: "Which word means library (book hall)?",
        target: "Library",
        options: ["도서관", "서점", "독서실"],
        correctAnswer: "도서관",
        fullSentence: "도서관 = library",
        explanation: "도서 (books) + 관 (hall/building) forms 도서관."
      },
      {
        id: "place_drill_2",
        prompt: "What suffix is shared by 서점, 문구점, and 백화점?",
        target: "Shop suffix",
        options: ["점", "관", "실"],
        correctAnswer: "점",
        fullSentence: "점 (店) = shop / store",
        explanation: "점 signifies a store or commercial shop."
      },
      {
        id: "place_drill_3",
        prompt: "Which word means hospital (illness institute)?",
        target: "Hospital",
        options: ["병원", "약국", "보건실"],
        correctAnswer: "병원",
        fullSentence: "병원 = hospital",
        explanation: "병 (illness) + 원 (institute) forms 병원."
      }
    ]
  },
  {
    id: "locations_subject_markers",
    order: 6,
    unit: "Unit Prep 4",
    title: "Subject Marker (이/가) and Inquiring Locations (어디에 있어요?)",
    koreanTitle: "주격조사 (이/가) 및 위치 묻기 (어디에 있어요?)",
    tag: "unit_prep_4",
    formula: "Noun + 이/가 어디에 있어요? | [Location] + 에 있어요",
    summary: "The subject marker marks the primary focus of attention. Ask locations with 어디에 있어요? and respond with location particle 에.",
    rules: [
      "Subject Marker: Attach 이 after consonants with 받침 (서울역이, 은행이, 화장실이).",
      "Subject Marker: Attach 가 after vowels with no 받침 (우체국이 X → 우체국이 has 받침 ㄱ so 우체국이, 학교가, 백화점이 X → 백화점 has 받침 ㅁ so 백화점이).",
      "Inquiring Locations: [Noun]이/가 어디에 있어요? (Where is [Noun]?).",
      "Location Particle: -에 marks static location with 있어요/없어요 (e.g. 1층에 있어요 = It is on the 1st floor).",
      "Verbs of Motion: 가다 (to go) and 오다 (to come) pair with destination particle 에 (집에 가요 = I go home)."
    ],
    examples: [
      { korean: "서울역이 어디에 있어요?", english: "Where is Seoul Station?" },
      { korean: "화장실이 어디에 있어요?", english: "Where is the restroom?" },
      { korean: "은행이 2층에 있어요.", english: "The bank is on the 2nd floor." },
      { korean: "우체국이 어디에 있어요? 저기에 있어요.", english: "Where is the post office? It is over there." },
      { korean: "어디에 가요? 집에 가요.", english: "Where are you going? I am going home." }
    ],
    drills: [
      {
        id: "loc_drill_1",
        prompt: "Choose the correct subject marker for 서울역 (Seoul Station).",
        target: "서울역",
        options: ["이", "가"],
        correctAnswer: "이",
        fullSentence: "서울역이 어디에 있어요?",
        explanation: "서울역 ends in final consonant 받침 ㄱ, so attach subject marker 이."
      },
      {
        id: "loc_drill_2",
        prompt: "Choose the correct subject marker for 학교 (School).",
        target: "학교",
        options: ["가", "이"],
        correctAnswer: "가",
        fullSentence: "학교가 어디에 있어요?",
        explanation: "학교 ends in vowel ㅛ with no 받침, so attach subject marker 가."
      },
      {
        id: "loc_drill_3",
        prompt: "Complete the response: 'The pharmacy is on the 1st floor.'",
        target: "1층 ___ 있어요",
        options: ["1층에 있어요.", "1층을 있어요.", "1층이 있어요."],
        correctAnswer: "1층에 있어요.",
        fullSentence: "약국이 1층에 있어요.",
        explanation: "The particle 에 marks static location of existence with 있어요."
      }
    ]
  }
];
