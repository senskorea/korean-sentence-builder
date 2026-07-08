import { Word, EndingOption } from './types';

// DATING-focused default vocabulary
export const SUBJECTS: Word[] = [
  { id: 'sub_i', korean: '저', english: 'I', emoji: '👤', type: 'subject', hasBatchim: false },
  { id: 'sub_bf', korean: '남자친구', english: 'Boyfriend', emoji: '👦', type: 'subject', hasBatchim: false },
  { id: 'sub_gf', korean: '여자친구', english: 'Girlfriend', emoji: '👧', type: 'subject', hasBatchim: false },
  { id: 'sub_crush', korean: '짝사랑', english: 'Crush', emoji: '💖', type: 'subject', hasBatchim: true },
  { id: 'sub_partner', korean: '애인', english: 'Lover', emoji: '👩‍❤️‍👨', type: 'subject', hasBatchim: true },
  { id: 'sub_we', korean: '우리', english: 'We', emoji: '👥', type: 'subject', hasBatchim: false },
];

export const OBJECTS: Word[] = [
  { id: 'obj_love', korean: '사랑', english: 'Love', emoji: '❤️', type: 'object', hasBatchim: true, compatibleVerbs: ['verb_give', 'verb_confess', 'verb_like', 'verb_love'] },
  { id: 'obj_gift', korean: '선물', english: 'Gift', emoji: '🎁', type: 'object', hasBatchim: true, compatibleVerbs: ['verb_give', 'verb_buy'] },
  { id: 'obj_coffee', korean: '커피', english: 'Coffee', emoji: '☕', type: 'object', hasBatchim: false, compatibleVerbs: ['verb_drink', 'verb_buy', 'verb_like'] },
  { id: 'obj_movie', korean: '영화', english: 'Movie', emoji: '🎬', type: 'object', hasBatchim: false, compatibleVerbs: ['verb_watch', 'verb_like'] },
  { id: 'obj_message', korean: '메시지', english: 'Message', emoji: '💬', type: 'object', hasBatchim: false, compatibleVerbs: ['verb_send', 'verb_like'] },
  { id: 'obj_flowers', korean: '꽃', english: 'Flowers', emoji: '💐', type: 'object', hasBatchim: true, compatibleVerbs: ['verb_buy', 'verb_give'] },
  { id: 'obj_heart', korean: '마음', english: 'Heart / Feelings', emoji: '💝', type: 'object', hasBatchim: true, compatibleVerbs: ['verb_give', 'verb_confess', 'verb_like'] },
];

export const VERBS: Word[] = [
  { id: 'verb_meet', korean: '만나다', english: 'To meet', emoji: '👩‍❤️‍👨', type: 'verb', hasBatchim: false, stem: '만나' },
  { id: 'verb_love', korean: '사랑하다', english: 'To love', emoji: '❤️', type: 'verb', hasBatchim: false, stem: '사랑하' },
  { id: 'verb_confess', korean: '고백하다', english: 'To confess', emoji: '💌', type: 'verb', hasBatchim: false, stem: '고백하' },
  { id: 'verb_give', korean: '주다', english: 'To give', emoji: '🤲', type: 'verb', hasBatchim: false, stem: '주' },
  { id: 'verb_buy', korean: '사다', english: 'To buy', emoji: '🛒', type: 'verb', hasBatchim: false, stem: '사' },
  { id: 'verb_watch', korean: '보다', english: 'To watch', emoji: '👀', type: 'verb', hasBatchim: false, stem: '보' },
  { id: 'verb_send', korean: '보내다', english: 'To send', emoji: '✉️', type: 'verb', hasBatchim: false, stem: '보내' },
  { id: 'verb_like', korean: '좋아하다', english: 'To like', emoji: '🥰', type: 'verb', hasBatchim: false, stem: '좋아하' },
];

export const ENDINGS: EndingOption[] = [
  { id: 'end_present', korean: '-아요/어요', english: 'Polite Present (do/does)', type: 'present' },
  { id: 'end_want', korean: '-고 싶어요', english: 'Want to (would like to)', type: 'want' },
  { id: 'end_past', korean: '-았어요/었어요', english: 'Polite Past (did)', type: 'past' },
  { id: 'end_future', korean: '-ㄹ/을 거예요', english: 'Future Intent (will)', type: 'future' },
];

// Complete robust verb conjugation matrix to bypass raw algorithmic edge-cases and assure 100% correct standard polite Korean
export const CONJUGATIONS: Record<string, Record<string, { korean: string; english: string }>> = {
  verb_meet: {
    end_present: { korean: '만나요', english: 'meets' },
    end_want: { korean: '만나고 싶어요', english: 'wants to meet' },
    end_past: { korean: '만났어요', english: 'met' },
    end_future: { korean: '만날 거예요', english: 'will meet' },
  },
  verb_love: {
    end_present: { korean: '사랑해요', english: 'loves' },
    end_want: { korean: '사랑하고 싶어요', english: 'wants to love' },
    end_past: { korean: '사랑했어요', english: 'loved' },
    end_future: { korean: '사랑할 거예요', english: 'will love' },
  },
  verb_confess: {
    end_present: { korean: '고백해요', english: 'confesses' },
    end_want: { korean: '고백하고 싶어요', english: 'wants to confess' },
    end_past: { korean: '고백했어요', english: 'confessed' },
    end_future: { korean: '고백할 거예요', english: 'will confess' },
  },
  verb_give: {
    end_present: { korean: '줘요', english: 'gives' },
    end_want: { korean: '주고 싶어요', english: 'wants to give' },
    end_past: { korean: '줬어요', english: 'gave' },
    end_future: { korean: '줄 거예요', english: 'will give' },
  },
  verb_buy: {
    end_present: { korean: '사요', english: 'buys' },
    end_want: { korean: '사고 싶어요', english: 'wants to buy' },
    end_past: { korean: '샀어요', english: 'bought' },
    end_future: { korean: '살 거예요', english: 'will buy' },
  },
  verb_watch: {
    end_present: { korean: '봐요', english: 'watches' },
    end_want: { korean: '보고 싶어요', english: 'wants to watch' },
    end_past: { korean: '봤어요', english: 'watched' },
    end_future: { korean: '볼 거예요', english: 'will watch' },
  },
  verb_send: {
    end_present: { korean: '보내요', english: 'sends' },
    end_want: { korean: '보내고 싶어요', english: 'wants to send' },
    end_past: { korean: '보냈어요', english: 'sent' },
    end_future: { korean: '보낼 거예요', english: 'will send' },
  },
  verb_like: {
    end_present: { korean: '좋아해요', english: 'likes' },
    end_want: { korean: '좋아하고 싶어요', english: 'wants to like' },
    end_past: { korean: '좋아했어요', english: 'liked' },
    end_future: { korean: '좋아할 거예요', english: 'will like' },
  },
};

// Smart algorithmic rules engine to conjugate custom verbs
export function conjugateVerbDynamically(verb: Word, endingId: string): { korean: string; english: string } {
  const stem = verb.stem || (verb.korean.endsWith('다') ? verb.korean.slice(0, -1) : verb.korean);
  const baseEnglish = verb.english.toLowerCase().replace(/^to /, '').trim();

  if (endingId === 'end_present') {
    if (stem.endsWith('하')) {
      return {
        korean: stem.slice(0, -1) + '해요',
        english: baseEnglish + 'es'
      };
    }
    if (stem.endsWith('가') || stem.endsWith('사') || stem.endsWith('만나')) {
      return {
        korean: stem + '요',
        english: baseEnglish + 's'
      };
    }
    if (stem.endsWith('보')) {
      return {
        korean: '봐요',
        english: baseEnglish + 'es'
      };
    }
    if (stem.endsWith('마시')) {
      return {
        korean: '마셔요',
        english: baseEnglish + 's'
      };
    }
    if (stem.endsWith('주')) {
      return {
        korean: '줘요',
        english: baseEnglish + 's'
      };
    }
    if (stem.endsWith('보내')) {
      return {
        korean: '보내요',
        english: baseEnglish + 's'
      };
    }
    return {
      korean: stem + (verb.hasBatchim ? '어요' : '요'),
      english: baseEnglish + 's'
    };
  }

  if (endingId === 'end_want') {
    return {
      korean: stem + '고 싶어요',
      english: 'wants to ' + baseEnglish
    };
  }

  if (endingId === 'end_past') {
    if (stem.endsWith('하')) {
      return {
        korean: stem.slice(0, -1) + '했어요',
        english: baseEnglish + 'ed'
      };
    }
    if (stem.endsWith('가') || stem.endsWith('사') || stem.endsWith('만나')) {
      return {
        korean: stem.slice(0, -1) + '았어요',
        english: baseEnglish + 'ed'
      };
    }
    if (stem.endsWith('보')) {
      return {
        korean: '봤어요',
        english: baseEnglish + 'ed'
      };
    }
    return {
      korean: stem + (verb.hasBatchim ? '었어요' : 'ㅆ어요'),
      english: baseEnglish + 'ed'
    };
  }

  if (endingId === 'end_future') {
    if (verb.hasBatchim) {
      return {
        korean: stem + '을 거예요',
        english: 'will ' + baseEnglish
      };
    } else {
      return {
        korean: stem + 'ㄹ 거예요',
        english: 'will ' + baseEnglish
      };
    }
  }

  return {
    korean: verb.korean,
    english: verb.english
  };
}

export function getFullEnglishTranslation(
  subject: Word | null,
  object: Word | null,
  verb: Word | null,
  endingId: string | null,
  customConjugations?: Record<string, Record<string, { korean: string; english: string }>>
): string {
  if (!subject) return '';

  const subEng = subject.id === 'sub_i' ? 'I' : subject.english;
  const isPluralOrI = subject.id === 'sub_i' || subject.id === 'sub_we';

  if (!object) {
    return `${subEng}...`;
  }

  const objEng = object.english.toLowerCase();

  if (!verb || !endingId) {
    return `${subEng} ➔ ${objEng}...`;
  }

  // Find conjugation
  let conj = customConjugations?.[verb.id]?.[endingId] || CONJUGATIONS[verb.id]?.[endingId];
  if (!conj) {
    // Try to conjugate dynamically
    conj = conjugateVerbDynamically(verb, endingId);
  }
  
  if (!conj) return '';

  let verbEng = conj.english;

  // Simple Subject-Verb agreement fix for English translation
  if (isPluralOrI) {
    if (verbEng.endsWith('s') && !verbEng.endsWith('less') && !verbEng.endsWith('ness')) {
      if (verbEng.endsWith('es')) {
        verbEng = verbEng.slice(0, -2);
      } else {
        verbEng = verbEng.slice(0, -1);
      }
    }
    
    // Explicit mappings for irregular agreement changes
    if (verbEng === 'eats') verbEng = 'eat';
    else if (verbEng === 'drinks') verbEng = 'drink';
    else if (verbEng === 'buys') verbEng = 'buy';
    else if (verbEng === 'reads') verbEng = 'read';
    else if (verbEng === 'studies') verbEng = 'study';
    else if (verbEng === 'learns') verbEng = 'learn';
    else if (verbEng === 'likes') verbEng = 'like';
    else if (verbEng === 'watches') verbEng = 'watch';
    else if (verbEng === 'meets') verbEng = 'meet';
    else if (verbEng === 'loves') verbEng = 'love';
    else if (verbEng === 'confesses') verbEng = 'confess';
    else if (verbEng === 'gives') verbEng = 'give';
    else if (verbEng === 'sends') verbEng = 'send';
    else if (verbEng === 'listens to') verbEng = 'listen to';
    else if (verbEng === 'wants to eat') verbEng = 'want to eat';
    else if (verbEng === 'wants to drink') verbEng = 'want to drink';
    else if (verbEng === 'wants to buy') verbEng = 'want to buy';
    else if (verbEng === 'wants to read') verbEng = 'want to read';
    else if (verbEng === 'wants to study') verbEng = 'want to study';
    else if (verbEng === 'wants to learn') verbEng = 'want to learn';
    else if (verbEng === 'wants to like') verbEng = 'want to like';
    else if (verbEng === 'wants to watch') verbEng = 'want to watch';
    else if (verbEng === 'wants to listen to') verbEng = 'want to listen to';
    else if (verbEng === 'wants to meet') verbEng = 'want to meet';
    else if (verbEng === 'wants to love') verbEng = 'want to love';
    else if (verbEng === 'wants to confess') verbEng = 'want to confess';
    else if (verbEng === 'wants to give') verbEng = 'want to give';
    else if (verbEng === 'wants to send') verbEng = 'want to send';
  }

  const article = ['a', 'e', 'i', 'o', 'u'].includes(objEng[0]) ? 'an' : 'a';
  const needArticle = ['apple', 'book', 'movie', 'sibling', 'friend', 'cat', 'dog', 'gift', 'message'].includes(objEng);
  const formattedObj = needArticle ? `${article} ${objEng}` : objEng;

  return `${subEng} ${verbEng} ${formattedObj}.`;
}

