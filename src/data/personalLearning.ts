export type PersonalVocabKind = 'word' | 'phrase' | 'fragment' | 'sentence';

export interface PersonalVocabItem {
  id: string;
  korean: string;
  english: string;
  kind: PersonalVocabKind;
  sensitive?: boolean;
}

const entries: [string, string, PersonalVocabKind, boolean?][] = [
  ['그냥 와요', 'Just come', 'sentence'], ['왔어요', 'I came / I’m back', 'phrase'],
  ['거기 뭐야?', 'What’s that over there?', 'sentence'], ['근데', 'But / by the way', 'word'],
  ['알겠어요', 'I understand / okay', 'phrase'], ['돈', 'Money', 'word'],
  ['선생님', 'Teacher', 'word'], ['괜찮아', 'It’s okay', 'phrase'], ['친구', 'Friend', 'word'],
  ['쫄리지?', 'You’re nervous or scared, right?', 'sentence'], ['하지 마', 'Don’t do it', 'sentence'],
  ['얘들아', 'Guys / everyone', 'phrase'], ['알아요', 'I know', 'phrase'],
  ['잘 쳐', 'Hit it well / play well', 'sentence'], ['플로리스트', 'Florist', 'word'],
  ['그치?', 'Right?', 'phrase'], ['골라', 'Choose / pick one', 'phrase'],
  ['가지 마', 'Don’t go / don’t leave', 'sentence'], ['어제', 'Yesterday', 'word'], ['언제', 'When', 'word'],
  ['뭐야?', 'What is it?', 'phrase'], ['취했어', 'I’m drunk / I got drunk', 'phrase'],
  ['가', 'Go', 'phrase'], ['가위바위보', 'Rock, paper, scissors', 'word'],
  ['저기요', 'Excuse me', 'phrase'], ['학생', 'Student', 'word'], ['한 번', 'Once / one time', 'phrase'],
  ['알아서', 'On your own / as you see fit', 'phrase'], ['번호가 뭐예요?', 'What’s your number?', 'sentence'],
  ['조심하세요', 'Be careful', 'sentence'], ['쫄았어요?', 'Did you get scared?', 'sentence'],
  ['아버지', 'Father / dad', 'word'], ['초코 스틱', 'Chocolate stick', 'word'],
  ['비싸대', 'Apparently, it’s expensive', 'phrase'], ['죄송합니다', 'I’m sorry', 'phrase'],
  ['없어요', 'There isn’t any / I don’t have it', 'phrase'], ['가자', 'Let’s go', 'phrase'],
  ['밥 먹을 시간이에요', 'It’s time to eat', 'sentence'], ['마셔', 'Drink', 'phrase'],
  ['술에 취했어', 'I’m drunk', 'sentence'], ['씨발', 'Fuck / damn', 'word', true],
  ['사우나', 'Sauna', 'word'], ['기다려', 'Wait', 'phrase'], ['자 봐', 'Try sleeping', 'phrase'],
  ['좋아', 'Good / I like it', 'phrase'], ['알았어', 'Understood / got it', 'phrase'],
  ['싫어', 'No / I don’t like it', 'phrase'], ['다시는', 'Never again', 'word'],
  ['일어나', 'Wake up / get up', 'phrase'], ['내가', 'I / me, as the subject', 'fragment'],
  ['내가 간다', 'I’m going', 'sentence'], ['비호감', 'Unappealing / a turn-off', 'word'],
  ['많이', 'A lot / many / much', 'word'], ['떠나', 'Leave', 'phrase'],
  ['왜 그래?', 'What’s wrong?', 'sentence'], ['피곤해', 'I’m tired', 'phrase'], ['경찰', 'Police', 'word'],
  ['마십니다', 'Drink / am drinking', 'phrase'], ['여보', 'Honey / darling', 'phrase'],
  ['이모', 'Maternal aunt / auntie', 'word'], ['먹자', 'Let’s eat', 'phrase'],
  ['맞다', 'To be correct / right', 'word'], ['잠깐만', 'Wait a moment', 'phrase'],
  ['신부님', 'Priest / Father', 'word'], ['형', 'Older brother, used by a male', 'word'],
  ['이럴 거야', 'It will be like this', 'sentence'], ['믿습니다', 'I believe', 'phrase'],
  ['예', 'Yes', 'word'], ['그럴 자격이 있다', 'To deserve it / be entitled to it', 'sentence'],
  ['미끄러워', 'It’s slippery', 'phrase'], ['그렇지', 'Right / that’s right', 'phrase'],
  ['있는데', 'There is / I have, but…', 'fragment'], ['왜요?', 'Why?', 'phrase'],
  ['시간', 'Time / hour', 'word'], ['아파', 'It hurts / I’m sick', 'phrase'],
  ['혹시', 'Perhaps / by any chance', 'fragment'], ['여러분', 'Everyone', 'word'],
  ['미안해', 'I’m sorry', 'phrase'], ['맛있다', 'To be delicious', 'word'],
  ['무슨', 'What / what kind of', 'fragment'], ['축복받다', 'To be blessed', 'word'],
  ['미치다', 'To go crazy', 'word'], ['앉으세요', 'Please sit down', 'sentence'],
  ['있어서', 'Because there is / because I have', 'fragment'], ['좋겠다', 'That would be nice', 'phrase'],
  ['자주', 'Often', 'word'], ['그래', 'Yes / okay', 'phrase'],
  ['없어', 'There isn’t any / I don’t have it', 'phrase'], ['궁금해', 'I’m curious', 'phrase'],
  ['하지 마라', 'Don’t do it', 'sentence'], ['트렌디', 'Trendy', 'word'], ['비타민', 'Vitamin', 'word'],
  ['거짓말하다', 'To lie', 'word'], ['계속해', 'Go on / continue', 'phrase'],
  ['이거 뭐야?', 'What’s this?', 'sentence'], ['나도', 'Me too', 'phrase'],
  ['조금', 'A little', 'word'], ['슬퍼', 'I’m sad', 'phrase'],
  ['빨리빨리', 'Quickly / hurry up', 'phrase'], ['속았지?', 'You were fooled, right?', 'sentence'],
];

export const PERSONAL_VOCABULARY: PersonalVocabItem[] = entries.map(([korean, english, kind, sensitive], index) => ({
  id: `personal-${index + 1}`,
  korean,
  english,
  kind,
  sensitive,
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
