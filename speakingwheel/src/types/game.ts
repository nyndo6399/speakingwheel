export interface WheelItem {
  id: string;
  text: string;
  emoji?: string;
  image?: string; // Base64 Data URL or inline SVG Data URI
  color: string;
}

export interface WheelConfig {
  id: string;
  title: string;
  items: WheelItem[];
  selectedHistoryIds: string[];
  rounds: 1 | 2 | 3;
}

export type DualSpinMode = 'random' | 'matched';

export interface WheelSettings {
  mode: 'single' | 'dual';
  rounds: 1 | 2 | 3;
  spinDuration: 3 | 4 | 5; // seconds
  soundEnabled: boolean;
  avoidRepeat: boolean;
  dualSpinMode?: DualSpinMode; // 'random' (independent) or 'matched' (paired logic)
}

export interface RoomData {
  id: string;
  roomName: string;
  question: string;
  mode: 'single' | 'dual';
  settings: WheelSettings;
  wheel1: WheelConfig;
  wheel2: WheelConfig;
  matchedPairs?: Record<string, string[]>; // wheel1ItemId -> array of valid wheel2ItemIds
  updatedAt: number;
}

export interface CurrentGameState {
  activeRoomId: string | null;
  roomName: string;
  question: string;
  mode: 'single' | 'dual';
  settings: WheelSettings;
  wheel1: WheelConfig;
  wheel2: WheelConfig;
  matchedPairs?: Record<string, string[]>;
}

export const SECTION_COUNT_PRESETS = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20,
] as const;

export const WHEEL_COLOR_PALETTE = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#10B981', // Emerald Green
  '#F59E0B', // Amber Yellow
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#84CC16', // Lime
  '#6366F1', // Indigo
  '#F43F5E', // Rose
];

export const SPEAKING_PROMPT_SUGGESTIONS = [
  'What is this activity?\nThis is ........',
  'What is your favorite animal?\nMy favorite animal is ........',
  'What did you do yesterday?\nYesterday, I ........',
  'Describe your best friend.\nMy best friend is ........',
  'What can you see?\nI can see ........',
  'What do you like doing?\nI like ........',
  'Tell me about your family.\nThere are ........ people in my family.',
  'What is your favorite food?\nMy favorite food is ........',
  'What fruit do you like?\nI like eating ........',
  'Where would you like to travel?\nI want to travel to ........',
  'What do you want to be when you grow up?\nI want to be a/an ........',
];
