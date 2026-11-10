import { RoomData, WheelConfig, WheelItem, WHEEL_COLOR_PALETTE } from '../types/game';

function createIllustrationSvg(bgCircle: string, symbolText: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <defs>
      <radialGradient id="g" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="60%" stop-color="${bgCircle}" stop-opacity="0.65"/>
        <stop offset="100%" stop-color="${bgCircle}" stop-opacity="0.95"/>
      </radialGradient>
    </defs>
    <rect width="160" height="160" fill="url(#g)"/>
    <circle cx="80" cy="74" r="54" fill="#ffffff" fill-opacity="0.88" stroke="#ffffff" stroke-width="4"/>
    <text x="80" y="80" font-size="76" text-anchor="middle" dominant-baseline="middle">${symbolText}</text>
    <rect x="18" y="122" width="124" height="26" rx="13" fill="rgba(15, 23, 42, 0.75)"/>
    <text x="80" y="136" font-family="sans-serif" font-weight="bold" font-size="12" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const defaultAnimalsItems: WheelItem[] = [
  {
    id: 'anim-1',
    text: 'Dog',
    emoji: '🐶',
    color: '#EF4444',
    image: createIllustrationSvg('#EF4444', '🐶', 'DOG'),
  },
  {
    id: 'anim-2',
    text: 'Cat',
    emoji: '🐱',
    color: '#F97316',
    image: createIllustrationSvg('#F97316', '🐱', 'CAT'),
  },
  {
    id: 'anim-3',
    text: 'Frog',
    emoji: '🐸',
    color: '#10B981',
    image: createIllustrationSvg('#10B981', '🐸', 'FROG'),
  },
  {
    id: 'anim-4',
    text: 'Tiger',
    emoji: '🐯',
    color: '#F59E0B',
    image: createIllustrationSvg('#F59E0B', '🐯', 'TIGER'),
  },
  {
    id: 'anim-5',
    text: 'Rabbit',
    emoji: '🐰',
    color: '#EC4899',
    image: createIllustrationSvg('#EC4899', '🐰', 'RABBIT'),
  },
  {
    id: 'anim-6',
    text: 'Monkey',
    emoji: '🐵',
    color: '#3B82F6',
    image: createIllustrationSvg('#3B82F6', '🐵', 'MONKEY'),
  },
];

const defaultStudentsItems: WheelItem[] = [
  { id: 'stu-1', text: 'Alex', emoji: '👦', color: '#3B82F6' },
  { id: 'stu-2', text: 'Emma', emoji: '👧', color: '#EC4899' },
  { id: 'stu-3', text: 'Leo', emoji: '🧒', color: '#10B981' },
  { id: 'stu-4', text: 'Maya', emoji: '👧', color: '#8B5CF6' },
  { id: 'stu-5', text: 'Noah', emoji: '👦', color: '#F97316' },
  { id: 'stu-6', text: 'Sophie', emoji: '👧', color: '#06B6D4' },
];

const defaultSubjectsItems: WheelItem[] = [
  { id: 'sub-1', text: 'I', emoji: '🙋', color: '#3B82F6' },
  { id: 'sub-2', text: 'You', emoji: '👉', color: '#10B981' },
  { id: 'sub-3', text: 'He', emoji: '👦', color: '#F59E0B' },
  { id: 'sub-4', text: 'She', emoji: '👧', color: '#EC4899' },
  { id: 'sub-5', text: 'We', emoji: '👥', color: '#8B5CF6' },
  { id: 'sub-6', text: 'They', emoji: '🧑‍🤝‍🧑', color: '#06B6D4' },
];

const defaultActionsItems: WheelItem[] = [
  {
    id: 'act-1',
    text: 'Play Soccer',
    emoji: '⚽',
    color: '#10B981',
    image: createIllustrationSvg('#10B981', '⚽', 'SOCCER'),
  },
  {
    id: 'act-2',
    text: 'Read a Book',
    emoji: '📖',
    color: '#3B82F6',
    image: createIllustrationSvg('#3B82F6', '📖', 'READ'),
  },
  {
    id: 'act-3',
    text: 'Ride a Bike',
    emoji: '🚲',
    color: '#F97316',
    image: createIllustrationSvg('#F97316', '🚲', 'BIKE'),
  },
  {
    id: 'act-4',
    text: 'Draw Pictures',
    emoji: '🎨',
    color: '#EC4899',
    image: createIllustrationSvg('#EC4899', '🎨', 'DRAW'),
  },
  {
    id: 'act-5',
    text: 'Listen to Music',
    emoji: '🎵',
    color: '#8B5CF6',
    image: createIllustrationSvg('#8B5CF6', '🎵', 'MUSIC'),
  },
  {
    id: 'act-6',
    text: 'Eat Ice Cream',
    emoji: '🍦',
    color: '#EF4444',
    image: createIllustrationSvg('#EF4444', '🍦', 'ICE CREAM'),
  },
];

const defaultFoodItems: WheelItem[] = [
  {
    id: 'food-1',
    text: 'Apple',
    emoji: '🍎',
    color: '#EF4444',
    image: createIllustrationSvg('#EF4444', '🍎', 'APPLE'),
  },
  {
    id: 'food-2',
    text: 'Banana',
    emoji: '🍌',
    color: '#F59E0B',
    image: createIllustrationSvg('#F59E0B', '🍌', 'BANANA'),
  },
  {
    id: 'food-3',
    text: 'Orange',
    emoji: '🍊',
    color: '#F97316',
    image: createIllustrationSvg('#F97316', '🍊', 'ORANGE'),
  },
  {
    id: 'food-4',
    text: 'Watermelon',
    emoji: '🍉',
    color: '#10B981',
    image: createIllustrationSvg('#10B981', '🍉', 'MELON'),
  },
  {
    id: 'food-5',
    text: 'Mango',
    emoji: '🥭',
    color: '#8B5CF6',
    image: createIllustrationSvg('#8B5CF6', '🥭', 'MANGO'),
  },
  {
    id: 'food-6',
    text: 'Strawberry',
    emoji: '🍓',
    color: '#EC4899',
    image: createIllustrationSvg('#EC4899', '🍓', 'BERRY'),
  },
];

const defaultActionPlacesActions: WheelItem[] = [
  {
    id: 'act-cook',
    text: 'cooking',
    emoji: '🍳',
    color: '#EF4444',
    image: createIllustrationSvg('#EF4444', '🍳', 'COOKING'),
  },
  {
    id: 'act-drink',
    text: 'drinking',
    emoji: '🥤',
    color: '#3B82F6',
    image: createIllustrationSvg('#3B82F6', '🥤', 'DRINKING'),
  },
  {
    id: 'act-eat',
    text: 'eating',
    emoji: '🍽️',
    color: '#F59E0B',
    image: createIllustrationSvg('#F59E0B', '🍽️', 'EATING'),
  },
  {
    id: 'act-table',
    text: 'setting the table',
    emoji: '🥣',
    color: '#10B981',
    image: createIllustrationSvg('#10B981', '🥣', 'SETTING TABLE'),
  },
];

const defaultActionPlacesLocations: WheelItem[] = [
  {
    id: 'plc-dining',
    text: 'in the dining room',
    emoji: '🍽️',
    color: '#EF4444',
    image: createIllustrationSvg('#EF4444', '🍽️', 'DINING ROOM'),
  },
  {
    id: 'plc-kitchen',
    text: 'in the kitchen',
    emoji: '🍳',
    color: '#F97316',
    image: createIllustrationSvg('#F97316', '🍳', 'KITCHEN'),
  },
];

export const DEFAULT_ROOMS: RoomData[] = [
  {
    id: 'room-dual-action-places',
    roomName: 'Action + Places (Cặp hợp lý: Cooking ➔ Kitchen...)',
    question: 'What are you doing ?\nI am ............................................. .',
    mode: 'dual',
    updatedAt: Date.now() - 5000,
    settings: {
      mode: 'dual',
      rounds: 2,
      spinDuration: 4,
      soundEnabled: true,
      avoidRepeat: true,
      dualSpinMode: 'matched',
    },
    wheel1: {
      id: 'wheel-1',
      title: 'Action',
      items: defaultActionPlacesActions,
      selectedHistoryIds: [],
      rounds: 2,
    },
    wheel2: {
      id: 'wheel-2',
      title: 'places',
      items: defaultActionPlacesLocations,
      selectedHistoryIds: [],
      rounds: 2,
    },
    matchedPairs: {
      'act-cook': ['plc-kitchen'],
      'act-drink': ['plc-dining', 'plc-kitchen'],
      'act-eat': ['plc-dining', 'plc-kitchen'],
      'act-table': ['plc-dining'],
    },
  },
  {
    id: 'room-dual-student-topic',
    roomName: 'Dual Wheels: Student + Topic',
    question: 'Tell the class about your favorite topic!\nI love talking about ........',
    mode: 'dual',
    updatedAt: Date.now() - 10000,
    settings: {
      mode: 'dual',
      rounds: 2,
      spinDuration: 4,
      soundEnabled: true,
      avoidRepeat: true,
      dualSpinMode: 'random',
    },
    wheel1: {
      id: 'wheel-1',
      title: 'Student Name',
      items: defaultStudentsItems,
      selectedHistoryIds: [],
      rounds: 2,
    },
    wheel2: {
      id: 'wheel-2',
      title: 'Speaking Topic',
      items: defaultAnimalsItems,
      selectedHistoryIds: [],
      rounds: 3,
    },
  },
  {
    id: 'room-grade-4-animals',
    roomName: 'Grade 4 - Animals',
    question: 'What is your favorite animal?\nMy favorite animal is ........',
    mode: 'single',
    updatedAt: Date.now() - 40000,
    settings: {
      mode: 'single',
      rounds: 2,
      spinDuration: 4,
      soundEnabled: true,
      avoidRepeat: true,
    },
    wheel1: {
      id: 'wheel-1',
      title: 'Animal Topics',
      items: defaultAnimalsItems,
      selectedHistoryIds: [],
      rounds: 2,
    },
    wheel2: {
      id: 'wheel-2',
      title: 'Challenges',
      items: defaultActionsItems,
      selectedHistoryIds: [],
      rounds: 2,
    },
  },
  {
    id: 'room-dual-sentence-builder',
    roomName: 'Dual Wheels: Sentence Builder',
    question: 'Build a sentence with Subject + Action!\nFor example: The cat is jumping.',
    mode: 'dual',
    updatedAt: Date.now() - 25000,
    settings: {
      mode: 'dual',
      rounds: 2,
      spinDuration: 4,
      soundEnabled: true,
      avoidRepeat: true,
    },
    wheel1: {
      id: 'wheel-1',
      title: 'Subject (Who)',
      items: defaultSubjectsItems,
      selectedHistoryIds: [],
      rounds: 2,
    },
    wheel2: {
      id: 'wheel-2',
      title: 'Action (What)',
      items: defaultActionsItems,
      selectedHistoryIds: [],
      rounds: 3,
    },
  },
  {
    id: 'room-grade-5-food',
    roomName: 'Grade 5 - Food',
    question: 'What fruit or food do you like?\nI like eating ........',
    mode: 'single',
    updatedAt: Date.now() - 30000,
    settings: {
      mode: 'single',
      rounds: 3,
      spinDuration: 4,
      soundEnabled: true,
      avoidRepeat: true,
    },
    wheel1: {
      id: 'wheel-1',
      title: 'Food Topics',
      items: defaultFoodItems,
      selectedHistoryIds: [],
      rounds: 3,
    },
    wheel2: {
      id: 'wheel-2',
      title: 'Actions',
      items: defaultActionsItems,
      selectedHistoryIds: [],
      rounds: 2,
    },
  },
];

export function createDefaultItem(index: number, prefix: string = 'Topic'): WheelItem {
  const topics = [
    { text: 'Apple', emoji: '🍎' },
    { text: 'Banana', emoji: '🍌' },
    { text: 'Dog', emoji: '🐶' },
    { text: 'Cat', emoji: '🐱' },
    { text: 'Sunny', emoji: '☀️' },
    { text: 'Rainbow', emoji: '🌈' },
    { text: 'Soccer', emoji: '⚽' },
    { text: 'Music', emoji: '🎵' },
    { text: 'Rocket', emoji: '🚀' },
    { text: 'Star', emoji: '⭐' },
    { text: 'Book', emoji: '📚' },
    { text: 'Pizza', emoji: '🍕' },
    { text: 'Bicycle', emoji: '🚲' },
    { text: 'Guitar', emoji: '🎸' },
  ];
  const topic = topics[index % topics.length];
  const color = WHEEL_COLOR_PALETTE[index % WHEEL_COLOR_PALETTE.length];
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text: index < topics.length ? topic.text : `${prefix} ${index + 1}`,
    emoji: topic.emoji,
    color,
  };
}

export function createEmptyWheel(id: string, title: string): WheelConfig {
  return {
    id,
    title,
    items: Array.from({ length: 6 }, (_, i) => createDefaultItem(i, title)),
    selectedHistoryIds: [],
    rounds: 2,
  };
}
