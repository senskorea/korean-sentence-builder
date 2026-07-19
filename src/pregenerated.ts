import { GeneratedVocab } from './lib/ai';
import { Word } from './types';

export const PREGENERATED_TOPICS: Record<string, GeneratedVocab> = {
  "Greetings": {
    subjects: [
      { id: "sub_greet_i", korean: "저", english: "I", emoji: "👤", type: "subject", hasBatchim: false },
      { id: "sub_greet_you", korean: "당신", english: "You", emoji: "👉", type: "subject", hasBatchim: true },
      { id: "sub_greet_friend", korean: "친구", english: "Friend", emoji: "🧑‍🤝‍🧑", type: "subject", hasBatchim: false },
      { id: "sub_greet_teacher", korean: "선생님", english: "Teacher", emoji: "🧑‍🏫", type: "subject", hasBatchim: true },
      { id: "sub_greet_boss", korean: "사장님", english: "Boss", emoji: "👔", type: "subject", hasBatchim: true },
      { id: "sub_greet_colleague", korean: "동료", english: "Colleague", emoji: "💼", type: "subject", hasBatchim: false }
    ],
    objects: [
      { id: "obj_greet_hello", korean: "안녕하세요", english: "Hello", emoji: "👋", type: "object", hasBatchim: false },
      { id: "obj_greet_name", korean: "이름", english: "Name", emoji: "📛", type: "object", hasBatchim: true },
      { id: "obj_greet_age", korean: "나이", english: "Age", emoji: "🎂", type: "object", hasBatchim: false },
      { id: "obj_greet_country", korean: "나라", english: "Country", emoji: "🌎", type: "object", hasBatchim: false },
      { id: "obj_greet_job", korean: "직업", english: "Job", emoji: "🛠️", type: "object", hasBatchim: true },
      { id: "obj_greet_handshake", korean: "악수", english: "Handshake", emoji: "🤝", type: "object", hasBatchim: false }
    ],
    verbs: [
      { id: "verb_greet_greet", korean: "인사하다", english: "To greet", emoji: "🙇", type: "verb", hasBatchim: false, stem: "인사하" },
      { id: "verb_greet_ask", korean: "묻다", english: "To ask", emoji: "❓", type: "verb", hasBatchim: true, stem: "묻" },
      { id: "verb_greet_intro", korean: "소개하다", english: "To introduce", emoji: "🤝", type: "verb", hasBatchim: false, stem: "소개하" },
      { id: "verb_greet_meet", korean: "만나다", english: "To meet", emoji: "👥", type: "verb", hasBatchim: false, stem: "만나" },
      { id: "verb_greet_speak", korean: "말하다", english: "To speak", emoji: "🗣️", type: "verb", hasBatchim: false, stem: "말하" },
      { id: "verb_greet_bow", korean: "절하다", english: "To bow", emoji: "🙇‍♂️", type: "verb", hasBatchim: false, stem: "절하" }
    ]
  },
  "Ordering Food": {
    subjects: [
      { id: "sub_food_i", korean: "저", english: "I", emoji: "👤", type: "subject", hasBatchim: false },
      { id: "sub_food_we", korean: "우리", english: "We", emoji: "👥", type: "subject", hasBatchim: false },
      { id: "sub_food_customer", korean: "손님", english: "Customer", emoji: "🛍️", type: "subject", hasBatchim: true },
      { id: "sub_food_waiter", korean: "종업원", english: "Waiter", emoji: "💁", type: "subject", hasBatchim: true },
      { id: "sub_food_chef", korean: "요리사", english: "Chef", emoji: "🧑‍🍳", type: "subject", hasBatchim: false },
      { id: "sub_food_owner", korean: "사장님", english: "Owner", emoji: "👔", type: "subject", hasBatchim: true }
    ],
    objects: [
      { id: "obj_food_menu", korean: "메뉴", english: "Menu", emoji: "📋", type: "object", hasBatchim: false },
      { id: "obj_food_water", korean: "물", english: "Water", emoji: "💧", type: "object", hasBatchim: true },
      { id: "obj_food_pizza", korean: "피자", english: "Pizza", emoji: "🍕", type: "object", hasBatchim: false },
      { id: "obj_food_chicken", korean: "치킨", english: "Chicken", emoji: "🍗", type: "object", hasBatchim: true },
      { id: "obj_food_beer", korean: "맥주", english: "Beer", emoji: "🍺", type: "object", hasBatchim: false },
      { id: "obj_food_bill", korean: "계산서", english: "Bill", emoji: "🧾", type: "object", hasBatchim: false }
    ],
    verbs: [
      { id: "verb_food_order", korean: "주문하다", english: "To order", emoji: "📝", type: "verb", hasBatchim: false, stem: "주문하" },
      { id: "verb_food_eat", korean: "먹다", english: "To eat", emoji: "😋", type: "verb", hasBatchim: true, stem: "먹" },
      { id: "verb_food_drink", korean: "마시다", english: "To drink", emoji: "🥤", type: "verb", hasBatchim: false, stem: "마시" },
      { id: "verb_food_give", korean: "주다", english: "To give", emoji: "🤲", type: "verb", hasBatchim: false, stem: "주" },
      { id: "verb_food_pay", korean: "계산하다", english: "To pay", emoji: "💳", type: "verb", hasBatchim: false, stem: "계산하" },
      { id: "verb_food_wait", korean: "기다리다", english: "To wait", emoji: "⏳", type: "verb", hasBatchim: false, stem: "기다리" }
    ]
  },
  "Shopping": {
    subjects: [
      { id: "sub_shop_i", korean: "저", english: "I", emoji: "👤", type: "subject", hasBatchim: false },
      { id: "sub_shop_cashier", korean: "계산원", english: "Cashier", emoji: "🧑‍💼", type: "subject", hasBatchim: true },
      { id: "sub_shop_staff", korean: "직원", english: "Staff", emoji: "👕", type: "subject", hasBatchim: true },
      { id: "sub_shop_friend", korean: "친구", english: "Friend", emoji: "🧑‍🤝‍🧑", type: "subject", hasBatchim: false },
      { id: "sub_shop_mom", korean: "어머니", english: "Mother", emoji: "👩", type: "subject", hasBatchim: false },
      { id: "sub_shop_customer", korean: "고객", english: "Customer", emoji: "🛍️", type: "subject", hasBatchim: true }
    ],
    objects: [
      { id: "obj_shop_clothes", korean: "옷", english: "Clothes", emoji: "👗", type: "object", hasBatchim: true },
      { id: "obj_shop_shoes", korean: "신발", english: "Shoes", emoji: "👞", type: "object", hasBatchim: true },
      { id: "obj_shop_bag", korean: "가방", english: "Bag", emoji: "👜", type: "object", hasBatchim: true },
      { id: "obj_shop_price", korean: "가격", english: "Price", emoji: "🏷️", type: "object", hasBatchim: true },
      { id: "obj_shop_card", korean: "카드", english: "Card", emoji: "💳", type: "object", hasBatchim: false },
      { id: "obj_shop_receipt", korean: "영수증", english: "Receipt", emoji: "🧾", type: "object", hasBatchim: true }
    ],
    verbs: [
      { id: "verb_shop_buy", korean: "사다", english: "To buy", emoji: "🛒", type: "verb", hasBatchim: false, stem: "사" },
      { id: "verb_shop_see", korean: "보다", english: "To see/look", emoji: "👀", type: "verb", hasBatchim: false, stem: "보" },
      { id: "verb_shop_try", korean: "입어보다", english: "To try on", emoji: "👕", type: "verb", hasBatchim: false, stem: "입어보" },
      { id: "verb_shop_pay", korean: "결제하다", english: "To pay", emoji: "💳", type: "verb", hasBatchim: false, stem: "결제하" },
      { id: "verb_shop_discount", korean: "할인하다", english: "To discount", emoji: "📉", type: "verb", hasBatchim: false, stem: "할인하" },
      { id: "verb_shop_refund", korean: "환불하다", english: "To refund", emoji: "↩️", type: "verb", hasBatchim: false, stem: "환불하" }
    ]
  },
  "Travel": {
    subjects: [
      { id: "sub_travel_i", korean: "저", english: "I", emoji: "👤", type: "subject", hasBatchim: false },
      { id: "sub_travel_we", korean: "우리", english: "We", emoji: "👥", type: "subject", hasBatchim: false },
      { id: "sub_travel_tourist", korean: "관광객", english: "Tourist", emoji: "📷", type: "subject", hasBatchim: true },
      { id: "sub_travel_guide", korean: "가이드", english: "Guide", emoji: "🚩", type: "subject", hasBatchim: false },
      { id: "sub_travel_driver", korean: "기사님", english: "Driver", emoji: "🚕", type: "subject", hasBatchim: true },
      { id: "sub_travel_friend", korean: "친구", english: "Friend", emoji: "🧑‍🤝‍🧑", type: "subject", hasBatchim: false }
    ],
    objects: [
      { id: "obj_travel_ticket", korean: "표", english: "Ticket", emoji: "🎫", type: "object", hasBatchim: false },
      { id: "obj_travel_hotel", korean: "호텔", english: "Hotel", emoji: "🏨", type: "object", hasBatchim: true },
      { id: "obj_travel_taxi", korean: "택시", english: "Taxi", emoji: "🚕", type: "object", hasBatchim: false },
      { id: "obj_travel_airport", korean: "공항", english: "Airport", emoji: "✈️", type: "object", hasBatchim: true },
      { id: "obj_travel_passport", korean: "여권", english: "Passport", emoji: "🛂", type: "object", hasBatchim: true },
      { id: "obj_travel_photo", korean: "사진", english: "Photo", emoji: "📸", type: "object", hasBatchim: true }
    ],
    verbs: [
      { id: "verb_travel_go", korean: "가다", english: "To go", emoji: "🚶", type: "verb", hasBatchim: false, stem: "가" },
      { id: "verb_travel_arrive", korean: "도착하다", english: "To arrive", emoji: "📍", type: "verb", hasBatchim: false, stem: "도착하" },
      { id: "verb_travel_ride", korean: "타다", english: "To ride", emoji: "🚗", type: "verb", hasBatchim: false, stem: "타" },
      { id: "verb_travel_sleep", korean: "자다", english: "To sleep", emoji: "🛌", type: "verb", hasBatchim: false, stem: "자" },
      { id: "verb_travel_photo", korean: "사진을 찍다", english: "To take a photo", emoji: "📷", type: "verb", hasBatchim: false, stem: "사진을 찍" },
      { id: "verb_travel_rest", korean: "쉬다", english: "To rest", emoji: "😌", type: "verb", hasBatchim: false, stem: "쉬" }
    ]
  },
  "Hobbies": {
    subjects: [
      { id: "sub_hobby_i", korean: "저", english: "I", emoji: "👤", type: "subject", hasBatchim: false },
      { id: "sub_hobby_we", korean: "우리", english: "We", emoji: "👥", type: "subject", hasBatchim: false },
      { id: "sub_hobby_friend", korean: "친구", english: "Friend", emoji: "🧑‍🤝‍🧑", type: "subject", hasBatchim: false },
      { id: "sub_hobby_bro", korean: "형", english: "Older Brother", emoji: "👦", type: "subject", hasBatchim: true },
      { id: "sub_hobby_sis", korean: "누나", english: "Older Sister", emoji: "👧", type: "subject", hasBatchim: false },
      { id: "sub_hobby_family", korean: "가족", english: "Family", emoji: "👪", type: "subject", hasBatchim: true }
    ],
    objects: [
      { id: "obj_hobby_music", korean: "음악", english: "Music", emoji: "🎵", type: "object", hasBatchim: true },
      { id: "obj_hobby_book", korean: "책", english: "Book", emoji: "📚", type: "object", hasBatchim: true },
      { id: "obj_hobby_game", korean: "게임", english: "Game", emoji: "🎮", type: "object", hasBatchim: true },
      { id: "obj_hobby_movie", korean: "영화", english: "Movie", emoji: "🎬", type: "object", hasBatchim: false },
      { id: "obj_hobby_picture", korean: "그림", english: "Picture", emoji: "🖼️", type: "object", hasBatchim: true },
      { id: "obj_hobby_exercise", korean: "운동", english: "Exercise", emoji: "🏃", type: "object", hasBatchim: true }
    ],
    verbs: [
      { id: "verb_hobby_listen", korean: "듣다", english: "To listen", emoji: "🎧", type: "verb", hasBatchim: true, stem: "듣" },
      { id: "verb_hobby_read", korean: "읽다", english: "To read", emoji: "📖", type: "verb", hasBatchim: true, stem: "읽" },
      { id: "verb_hobby_play", korean: "하다", english: "To play/do", emoji: "🕹️", type: "verb", hasBatchim: false, stem: "하" },
      { id: "verb_hobby_watch", korean: "보다", english: "To watch", emoji: "👀", type: "verb", hasBatchim: false, stem: "보" },
      { id: "verb_hobby_draw", korean: "그리다", english: "To draw", emoji: "🖌️", type: "verb", hasBatchim: false, stem: "그리" },
      { id: "verb_hobby_do", korean: "하다", english: "To do", emoji: "💪", type: "verb", hasBatchim: false, stem: "하" }
    ]
  }
};
