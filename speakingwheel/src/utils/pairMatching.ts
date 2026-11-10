import { WheelItem } from '../types/game';

// Semantic keywords map for activities and places or common classroom topics
const ACTIVITY_PLACE_KEYWORDS: Array<{
  activityWords: string[];
  placeWords: string[];
}> = [
  {
    activityWords: ['cook', 'cooking', 'bake', 'baking', 'fry', 'frying', 'make food', 'kitchen'],
    placeWords: ['kitchen', 'in the kitchen', 'cookhouse'],
  },
  {
    activityWords: ['eat', 'eating', 'dine', 'dining', 'breakfast', 'lunch', 'dinner', 'snack', 'drink', 'drinking', 'set the table', 'setting the table'],
    placeWords: ['dining room', 'in the dining room', 'dining', 'kitchen', 'in the kitchen', 'canteen', 'cafeteria', 'restaurant'],
  },
  {
    activityWords: ['sleep', 'sleeping', 'wake up', 'waking up', 'dream', 'dreaming', 'rest', 'bed', 'lie down'],
    placeWords: ['bedroom', 'in the bedroom', 'bed room', 'dormitory'],
  },
  {
    activityWords: ['shower', 'showering', 'bath', 'bathing', 'wash', 'washing', 'brush', 'brushing', 'toilet'],
    placeWords: ['bathroom', 'in the bathroom', 'restroom', 'washroom'],
  },
  {
    activityWords: ['watch tv', 'watching tv', 'television', 'relax', 'relaxing', 'sofa', 'chat', 'chatting', 'living'],
    placeWords: ['living room', 'in the living room', 'sitting room', 'hall'],
  },
  {
    activityWords: ['study', 'studying', 'read', 'reading', 'homework', 'learn', 'write', 'writing'],
    placeWords: ['study room', 'in the study', 'study', 'library', 'in the library', 'classroom', 'in the classroom', 'bedroom'],
  },
  {
    activityWords: ['play', 'playing', 'soccer', 'football', 'run', 'running', 'exercise', 'skip', 'skipping'],
    placeWords: ['park', 'in the park', 'playground', 'in the playground', 'garden', 'in the garden', 'yard', 'in the yard', 'gym'],
  },
  {
    activityWords: ['swim', 'swimming', 'dive', 'diving'],
    placeWords: ['pool', 'swimming pool', 'in the pool', 'beach', 'in the beach'],
  },
  {
    activityWords: ['buy', 'buying', 'shop', 'shopping'],
    placeWords: ['supermarket', 'market', 'store', 'in the supermarket', 'grocery'],
  },
];

/**
 * Normalizes text for matching comparison
 */
function cleanText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Suggests smart logical pairings based on activity-location semantics or topic keywords.
 */
export function suggestSmartPairs(
  wheel1Items: WheelItem[],
  wheel2Items: WheelItem[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  if (wheel1Items.length === 0 || wheel2Items.length === 0) {
    return result;
  }

  wheel1Items.forEach((item1, idx) => {
    const text1 = cleanText(item1.text);
    const matchedTargets: string[] = [];

    // 1. Try keyword matching from predefined semantics
    for (const rule of ACTIVITY_PLACE_KEYWORDS) {
      const activityMatches = rule.activityWords.some((w) => text1.includes(cleanText(w)));
      if (activityMatches) {
        wheel2Items.forEach((item2) => {
          const text2 = cleanText(item2.text);
          const placeMatches = rule.placeWords.some((pw) => text2.includes(cleanText(pw)));
          if (placeMatches && !matchedTargets.includes(item2.id)) {
            matchedTargets.push(item2.id);
          }
        });
      }
    }

    // 2. Direct word overlap check
    if (matchedTargets.length === 0) {
      const words1 = text1.split(/\s+/).filter((w) => w.length > 2);
      wheel2Items.forEach((item2) => {
        const text2 = cleanText(item2.text);
        if (words1.some((w) => text2.includes(w))) {
          if (!matchedTargets.includes(item2.id)) {
            matchedTargets.push(item2.id);
          }
        }
      });
    }

    // 3. Fallback to 1-to-1 sequential mapping if no smart match was found
    if (matchedTargets.length === 0) {
      const fallbackTarget = wheel2Items[idx % wheel2Items.length];
      if (fallbackTarget) {
        matchedTargets.push(fallbackTarget.id);
      }
    }

    result[item1.id] = matchedTargets;
  });

  return result;
}

/**
 * Creates a sequential 1-to-1 mapping (Item 1 -> Item 1, Item 2 -> Item 2, etc.)
 */
export function autoPairByOrder(
  wheel1Items: WheelItem[],
  wheel2Items: WheelItem[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  if (wheel2Items.length === 0) return result;

  wheel1Items.forEach((item1, idx) => {
    const target = wheel2Items[idx % wheel2Items.length];
    result[item1.id] = target ? [target.id] : [];
  });

  return result;
}

/**
 * Resolves the valid WheelItem candidates from Wheel 2 for a given Wheel 1 winner.
 */
export function getValidTargetsForWinner(
  winner1: WheelItem,
  wheel2Items: WheelItem[],
  matchedPairs?: Record<string, string[]>
): WheelItem[] {
  if (!matchedPairs || Object.keys(matchedPairs).length === 0) {
    return [];
  }

  // 1. Direct ID match
  let targetIds = matchedPairs[winner1.id];

  // 2. Text match fallback if IDs were re-created
  if (!targetIds || targetIds.length === 0) {
    const winnerText = cleanText(winner1.text);
    for (const [key, ids] of Object.entries(matchedPairs)) {
      if (cleanText(key) === winnerText) {
        targetIds = ids;
        break;
      }
    }
  }

  if (!targetIds || targetIds.length === 0) {
    return [];
  }

  // Filter existing items in wheel2Items that match targetIds (by id or text)
  const valid = wheel2Items.filter((item2) => {
    if (targetIds?.includes(item2.id)) return true;
    const cleanT2 = cleanText(item2.text);
    return targetIds?.some((tid) => cleanText(tid) === cleanT2);
  });

  return valid;
}

/**
 * Checks if a combination of winner1 and winner2 matches the configured pairs
 */
export function isPairMatching(
  winner1: WheelItem | null,
  winner2: WheelItem | null,
  wheel2Items: WheelItem[],
  matchedPairs?: Record<string, string[]>
): boolean {
  if (!winner1 || !winner2 || !matchedPairs) return false;
  const validTargets = getValidTargetsForWinner(winner1, wheel2Items, matchedPairs);
  return validTargets.some((t) => t.id === winner2.id || cleanText(t.text) === cleanText(winner2.text));
}
