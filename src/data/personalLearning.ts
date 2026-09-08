export interface PersonalVocabItem {
  id: string;
  korean: string;
  english: string;
  tags: string[];
  sensitive?: boolean;
}

const entries: [string, string, string[]][] = [
  ['오다', 'to come', ['verb']], ['그냥', 'just; simply', ['adverb']], ['거기', 'there; that place', ['pronoun']],
  ['근데', 'but; by the way', ['conjunction']], ['알다', 'to know', ['verb']], ['돈', 'money', ['noun']],
  ['선생님', 'teacher', ['noun']], ['괜찮다', 'to be okay', ['adjective']], ['친구', 'friend', ['noun']],
  ['쫄리다', 'to feel nervous or intimidated', ['verb', 'slang']], ['치다', 'to hit; to play certain games or instruments', ['verb']],
  ['플로리스트', 'florist', ['noun']], ['그렇다', 'to be so; to be like that', ['adjective']],
  ['고르다', 'to choose; to pick', ['verb']], ['가다', 'to go', ['verb']], ['어제', 'yesterday', ['adverb']],
  ['뭐', 'what', ['pronoun']], ['취하다', 'to become drunk', ['verb']], ['가위바위보', 'rock, paper, scissors', ['noun']],
  ['학생', 'student', ['noun']], ['한 번', 'once; one time', ['adverb']], ['조심하다', 'to be careful', ['verb']],
  ['쫄다', 'to become scared or intimidated', ['verb', 'slang']], ['아버지', 'father', ['noun']],
  ['초코 스틱', 'chocolate stick', ['noun']], ['비싸다', 'to be expensive', ['adjective']],
  ['죄송하다', 'to be sorry', ['adjective']], ['없다', 'to not exist; to not have', ['adjective']],
  ['먹다', 'to eat', ['verb']], ['밥', 'rice; a meal', ['noun']], ['시간', 'time; hour', ['noun']],
  ['마시다', 'to drink', ['verb']], ['술', 'alcohol; an alcoholic drink', ['noun']],
  ['씨발', 'fuck; damn', ['interjection', 'vulgar']], ['사우나', 'sauna', ['noun']],
  ['기다리다', 'to wait', ['verb']], ['자다', 'to sleep', ['verb']], ['좋다', 'to be good; to like', ['adjective']],
  ['싫다', 'to dislike; to be unpleasant', ['adjective']], ['다시는', 'never again', ['adverb']],
  ['일어나다', 'to get up; to happen', ['verb']], ['나', 'I; me', ['pronoun']],
  ['비호감', 'an unfavorable impression; a turn-off', ['noun']], ['많이', 'a lot; much; many', ['adverb']],
  ['떠나다', 'to leave; to depart', ['verb']], ['왜', 'why', ['adverb']], ['피곤하다', 'to be tired', ['adjective']],
  ['경찰', 'police; police officer', ['noun']], ['여보', 'honey; darling', ['interjection']],
  ['이모', 'maternal aunt; auntie', ['noun']], ['맞다', 'to be correct; to be right', ['verb']],
  ['신부님', 'priest; Father', ['noun']], ['형', 'an older brother or older male friend, used by a male', ['noun']],
  ['이렇다', 'to be like this', ['adjective']], ['믿다', 'to believe; to trust', ['verb']],
  ['예', 'yes', ['interjection']], ['자격', 'qualification; right; entitlement', ['noun']],
  ['미끄럽다', 'to be slippery', ['adjective']], ['있다', 'to exist; to have', ['verb']],
  ['아프다', 'to hurt; to be sick', ['adjective']], ['혹시', 'perhaps; by any chance', ['adverb']],
  ['여러분', 'everyone; you all', ['pronoun']], ['미안하다', 'to be sorry', ['adjective']],
  ['맛있다', 'to be delicious', ['adjective']], ['무슨', 'what; what kind of', ['determiner']],
  ['축복받다', 'to be blessed', ['verb']], ['미치다', 'to go crazy', ['verb']], ['앉다', 'to sit', ['verb']],
  ['자주', 'often', ['adverb']], ['궁금하다', 'to be curious', ['adjective']],
  ['트렌디하다', 'to be trendy', ['adjective']], ['비타민', 'vitamin', ['noun']],
  ['거짓말하다', 'to lie', ['verb']], ['계속하다', 'to continue', ['verb']],
  ['이거', 'this; this thing', ['pronoun']], ['조금', 'a little', ['adverb']],
  ['슬프다', 'to be sad', ['adjective']], ['빨리빨리', 'quickly; hurry up', ['adverb']],
  ['속다', 'to be deceived; to be fooled', ['verb']],
  ['거기 뭐야?', 'What’s that over there?', ['expression']], ['알겠어요', 'I understand; okay', ['expression', 'polite']],
  ['하지 마', 'Don’t do it', ['expression', 'casual']], ['얘들아', 'Guys!; everyone!', ['expression', 'casual']],
  ['그치?', 'Right?', ['expression', 'casual']], ['가지 마', 'Don’t go; don’t leave', ['expression', 'casual']],
  ['뭐야?', 'What is it?', ['expression', 'casual']], ['저기요', 'Excuse me', ['expression', 'polite']],
  ['알아서', 'On your own; as you see fit', ['expression']], ['번호가 뭐예요?', 'What’s your number?', ['expression', 'polite']],
  ['밥 먹을 시간이에요', 'It’s time to eat', ['expression', 'polite']], ['잠깐만', 'Wait a moment', ['expression', 'casual']],
  ['왜 그래?', 'What’s wrong?', ['expression', 'casual']], ['나도', 'Me too', ['expression', 'casual']],
  ['이거 뭐야?', 'What’s this?', ['expression', 'casual']],
];

export const PERSONAL_VOCABULARY: PersonalVocabItem[] = entries.map(([korean, english, tags]) => ({
  id: `personal-${korean}`,
  korean,
  english,
  tags,
  sensitive: tags.includes('vulgar'),
}));

export interface MistakeExercise {
  prompt: string;
  answer: string;
  hint: string;
}

export interface MistakePattern {
  id: string;
  title: string;
  summary: string;
  examples: string[];
  practice: string;
  exercises: MistakeExercise[];
}

export const MISTAKE_PATTERNS: MistakePattern[] = [
  { id: 'sound', title: 'Writing what you hear', summary: 'Fast speech blends sounds. Rebuild what you hear from syllable blocks, familiar stems, and endings.', examples: ['어제 = yesterday · 언제 = when', '얘들아, 가위바위보, 기다려, 플로리스트'], practice: 'Listen once, say it slowly, identify blocks, then check the complete word.', exercises: [
    { prompt: 'Which means “yesterday”: 어제 or 언제?', answer: '어제', hint: '언제 means “when.”' },
    { prompt: 'Correct the sound-spelling: 기다료', answer: '기다려', hint: 'The final syllable is 려.' },
  ]},
  { id: 'consonants', title: 'Missing consonants', summary: 'Pay special attention to ㄹ, final consonants, and tense consonants such as ㄲ and ㅆ.', examples: ['쫄리지? has ㄹ in both relevant syllables', '씨발 begins with ㅆ; 잠깐만 contains ㄲ', '알았어 keeps final ㄹ and ㅆ'], practice: 'Underline 받침 and circle every double consonant after writing.', exercises: [
    { prompt: 'Correct the spelling: 잠간만', answer: '잠깐만', hint: 'Use the tense consonant ㄲ.' },
    { prompt: 'Correct the spelling: 미그러워', answer: '미끄러워', hint: 'The second syllable begins with ㄲ.' },
  ]},
  { id: 'meaning', title: 'Word meaning vs. scene', summary: 'A scene’s overall meaning is not always the literal contribution of one Korean word.', examples: ['근데 = but / by the way', '혹시 = perhaps / by any chance', '여보 = honey / darling', '좋아 = good / I like it'], practice: 'Record both a core meaning and its natural contextual translation.', exercises: [
    { prompt: 'What is the core meaning of 혹시?', answer: 'Perhaps / by any chance', hint: 'It cautiously introduces a question.' },
    { prompt: 'Does 좋아 directly mean “happy”?', answer: 'No — it means “good” or “I like it.”', hint: 'Separate the scene’s emotion from the word.' },
  ]},
  { id: 'similar', title: 'Similar expressions', summary: 'Small spelling or ending changes can produce a different expression and social meaning.', examples: ['알아요 = I know', '알겠어요 = I understand', '알았어 = Got it', '알아서 = On your own', '그래 / 그렇지 / 왜 그래?'], practice: 'Study contrast sets and write one original sentence for each member.', exercises: [
    { prompt: 'Choose “on your own”: 알았어 or 알아서?', answer: '알아서', hint: '알았어 means “got it.”' },
    { prompt: 'How do you ask “What’s wrong?”', answer: '왜 그래?', hint: 'Add 왜 to the 그래 family.' },
  ]},
  { id: 'spacing', title: 'Spacing commands', summary: 'In negative commands, the main verb and 마 are normally separated.', examples: ['하지 마 · 가지 마 · 먹지 마 · 마시지 마', '한 번 = one time'], practice: 'Memorize the frame: verb stem + 지 마.', exercises: [
    { prompt: 'Correct the spacing: 하지마', answer: '하지 마', hint: 'Separate 마 from the verb.' },
    { prompt: 'Write “don’t eat.”', answer: '먹지 마', hint: '먹다 → 먹지 마' },
  ]},
  { id: 'speech', title: 'Speech levels', summary: 'Formal, everyday polite, casual, and forceful forms are each appropriate in different relationships.', examples: ['죄송합니다 · 믿습니다 (formal)', '알겠어요 · 조심하세요 (polite)', '미안해 · 기다려 (casual)', '하지 마라 (forceful)'], practice: 'Prioritize everyday polite -요 speech, then convert phrases between levels.', exercises: [
    { prompt: 'Make 기다려 everyday polite.', answer: '기다려요', hint: 'Add 요 to the casual form.' },
    { prompt: 'Make 알았어 formal polite.', answer: '알겠습니다', hint: 'Use the formal 겠습니다 ending.' },
  ]},
  { id: 'plural', title: 'Korean plurals', summary: 'Korean nouns often stay unchanged for singular and plural; context supplies the number.', examples: ['친구 can mean friend or friends', '학생들 explicitly emphasizes multiple students', '여러분 already means everyone'], practice: 'Record the basic dictionary meaning first; add 들 only when plurality needs emphasis.', exercises: [
    { prompt: 'Must 친구 always take 들 to mean friends?', answer: 'No', hint: 'Context can supply plurality.' },
    { prompt: 'Which already means “everyone”?', answer: '여러분', hint: 'It does not need 들.' },
  ]},
  { id: 'fragments', title: 'Fragments vs. sentences', summary: 'Do not memorize an incomplete Korean fragment as if it were a complete English sentence.', examples: ['내가 = I, as subject · 내가 간다 = I’m going', '무슨 needs a noun', '있는데 leads into more information', '혹시 introduces a cautious question'], practice: 'Label every item as a word, phrase, fragment, or complete sentence.', exercises: [
    { prompt: 'Is 내가 a complete sentence?', answer: 'No — it is a subject fragment.', hint: 'It needs a predicate.' },
    { prompt: 'Complete “what kind of ___” with “movie.”', answer: '무슨 영화', hint: '무슨 normally modifies a noun.' },
  ]},
];

export const WEEKLY_PRACTICE = [
  'Practise 어제/언제, 알았어/알아서, and the 그래 family.',
  'Repeat the contrast sets and write one example for each.',
  'Rewrite words containing 받침 and tense consonants.',
  'Continue 받침 practice one syllable at a time.',
  'Convert ten casual expressions into everyday polite -요 speech.',
  'Record both literal and contextual meanings from a short scene.',
  'Review only the items you still miss.',
];
