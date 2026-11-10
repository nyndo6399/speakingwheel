// Curated classroom sticker illustrations for SpeakSpin
// All items are self-contained SVG data URIs, 100% offline, cross-origin safe

export interface ClassroomSticker {
  id: string;
  name: string;
  category: 'animals' | 'food' | 'school' | 'sports' | 'transport' | 'rewards';
  emoji: string;
  bgColor: string;
  dataUrl: string;
}

function makeStickerSvg(bgColor: string, emoji: string, label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <defs>
      <radialGradient id="grad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="65%" stop-color="${bgColor}" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="${bgColor}" stop-opacity="1"/>
      </radialGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.25"/>
      </filter>
    </defs>
    <rect width="160" height="160" rx="36" fill="url(#grad)"/>
    <circle cx="80" cy="72" r="50" fill="#ffffff" fill-opacity="0.92" stroke="#ffffff" stroke-width="4" filter="url(#shadow)"/>
    <text x="80" y="80" font-size="64" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    <rect x="16" y="122" width="128" height="26" rx="13" fill="rgba(15, 23, 42, 0.85)"/>
    <text x="80" y="136" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="12" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">${label.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const CLASSROOM_CATEGORIES = [
  { id: 'animals', label: '🦁 Động vật (Animals)' },
  { id: 'food', label: '🍎 Đồ ăn & Trái cây (Food)' },
  { id: 'school', label: '🎒 Trường học (School)' },
  { id: 'sports', label: '⚽ Thể thao (Sports)' },
  { id: 'transport', label: '🚗 Xe cộ (Vehicles)' },
  { id: 'rewards', label: '⭐ Khen thưởng (Rewards)' },
] as const;

export const CLASSROOM_STICKERS: ClassroomSticker[] = [
  // ANIMALS
  { id: 'stk-dog', name: 'Chó (Dog)', category: 'animals', emoji: '🐶', bgColor: '#EF4444', dataUrl: makeStickerSvg('#EF4444', '🐶', 'DOG') },
  { id: 'stk-cat', name: 'Mèo (Cat)', category: 'animals', emoji: '🐱', bgColor: '#F97316', dataUrl: makeStickerSvg('#F97316', '🐱', 'CAT') },
  { id: 'stk-lion', name: 'Sư tử (Lion)', category: 'animals', emoji: '🦁', bgColor: '#F59E0B', dataUrl: makeStickerSvg('#F59E0B', '🦁', 'LION') },
  { id: 'stk-tiger', name: 'Hổ (Tiger)', category: 'animals', emoji: '🐯', bgColor: '#F97316', dataUrl: makeStickerSvg('#F97316', '🐯', 'TIGER') },
  { id: 'stk-elephant', name: 'Voi (Elephant)', category: 'animals', emoji: '🐘', bgColor: '#3B82F6', dataUrl: makeStickerSvg('#3B82F6', '🐘', 'ELEPHANT') },
  { id: 'stk-monkey', name: 'Khỉ (Monkey)', category: 'animals', emoji: '🐵', bgColor: '#84CC16', dataUrl: makeStickerSvg('#84CC16', '🐵', 'MONKEY') },
  { id: 'stk-panda', name: 'Gấu trúc (Panda)', category: 'animals', emoji: '🐼', bgColor: '#10B981', dataUrl: makeStickerSvg('#10B981', '🐼', 'PANDA') },
  { id: 'stk-rabbit', name: 'Thỏ (Rabbit)', category: 'animals', emoji: '🐰', bgColor: '#EC4899', dataUrl: makeStickerSvg('#EC4899', '🐰', 'RABBIT') },
  { id: 'stk-bear', name: 'Gấu (Bear)', category: 'animals', emoji: '🐻', bgColor: '#F59E0B', dataUrl: makeStickerSvg('#F59E0B', '🐻', 'BEAR') },
  { id: 'stk-frog', name: 'Ếch (Frog)', category: 'animals', emoji: '🐸', bgColor: '#10B981', dataUrl: makeStickerSvg('#10B981', '🐸', 'FROG') },
  { id: 'stk-dolphin', name: 'Cá heo (Dolphin)', category: 'animals', emoji: '🐬', bgColor: '#06B6D4', dataUrl: makeStickerSvg('#06B6D4', '🐬', 'DOLPHIN') },
  { id: 'stk-penguin', name: 'Chim cánh cụt (Penguin)', category: 'animals', emoji: '🐧', bgColor: '#6366F1', dataUrl: makeStickerSvg('#6366F1', '🐧', 'PENGUIN') },

  // FOOD
  { id: 'stk-apple', name: 'Táo (Apple)', category: 'food', emoji: '🍎', bgColor: '#EF4444', dataUrl: makeStickerSvg('#EF4444', '🍎', 'APPLE') },
  { id: 'stk-banana', name: 'Chuối (Banana)', category: 'food', emoji: '🍌', bgColor: '#F59E0B', dataUrl: makeStickerSvg('#F59E0B', '🍌', 'BANANA') },
  { id: 'stk-orange', name: 'Cam (Orange)', category: 'food', emoji: '🍊', bgColor: '#F97316', dataUrl: makeStickerSvg('#F97316', '🍊', 'ORANGE') },
  { id: 'stk-watermelon', name: 'Dưa hấu (Watermelon)', category: 'food', emoji: '🍉', bgColor: '#10B981', dataUrl: makeStickerSvg('#10B981', '🍉', 'WATERMELON') },
  { id: 'stk-strawberry', name: 'Dâu tây (Strawberry)', category: 'food', emoji: '🍓', bgColor: '#F43F5E', dataUrl: makeStickerSvg('#F43F5E', '🍓', 'STRAWBERRY') },
  { id: 'stk-pizza', name: 'Pizza', category: 'food', emoji: '🍕', bgColor: '#F97316', dataUrl: makeStickerSvg('#F97316', '🍕', 'PIZZA') },
  { id: 'stk-burger', name: 'Burger', category: 'food', emoji: '🍔', bgColor: '#F59E0B', dataUrl: makeStickerSvg('#F59E0B', '🍔', 'BURGER') },
  { id: 'stk-icecream', name: 'Kem (Ice Cream)', category: 'food', emoji: '🍦', bgColor: '#EC4899', dataUrl: makeStickerSvg('#EC4899', '🍦', 'ICE CREAM') },
  { id: 'stk-donut', name: 'Bánh Donut', category: 'food', emoji: '🍩', bgColor: '#8B5CF6', dataUrl: makeStickerSvg('#8B5CF6', '🍩', 'DONUT') },
  { id: 'stk-cake', name: 'Bánh kem (Cake)', category: 'food', emoji: '🎂', bgColor: '#EC4899', dataUrl: makeStickerSvg('#EC4899', '🎂', 'CAKE') },
  { id: 'stk-cookie', name: 'Bánh quy (Cookie)', category: 'food', emoji: '🍪', bgColor: '#F59E0B', dataUrl: makeStickerSvg('#F59E0B', '🍪', 'COOKIE') },

  // SCHOOL
  { id: 'stk-book', name: 'Sách (Book)', category: 'school', emoji: '📖', bgColor: '#3B82F6', dataUrl: makeStickerSvg('#3B82F6', '📖', 'BOOK') },
  { id: 'stk-backpack', name: 'Balo (Backpack)', category: 'school', emoji: '🎒', bgColor: '#EC4899', dataUrl: makeStickerSvg('#EC4899', '🎒', 'BACKPACK') },
  { id: 'stk-pencil', name: 'Bút chì (Pencil)', category: 'school', emoji: '✏️', bgColor: '#F59E0B', dataUrl: makeStickerSvg('#F59E0B', '✏️', 'PENCIL') },
  { id: 'stk-ruler', name: 'Thước kẻ (Ruler)', category: 'school', emoji: '📏', bgColor: '#10B981', dataUrl: makeStickerSvg('#10B981', '📏', 'RULER') },
  { id: 'stk-palette', name: 'Màu vẽ (Art Palette)', category: 'school', emoji: '🎨', bgColor: '#8B5CF6', dataUrl: makeStickerSvg('#8B5CF6', '🎨', 'ART') },
  { id: 'stk-globe', name: 'Địa cầu (Globe)', category: 'school', emoji: '🌍', bgColor: '#06B6D4', dataUrl: makeStickerSvg('#06B6D4', '🌍', 'GLOBE') },
  { id: 'stk-microscope', name: 'Kính hiển vi (Science)', category: 'school', emoji: '🔬', bgColor: '#14B8A6', dataUrl: makeStickerSvg('#14B8A6', '🔬', 'SCIENCE') },
  { id: 'stk-laptop', name: 'Máy tính (Laptop)', category: 'school', emoji: '💻', bgColor: '#3B82F6', dataUrl: makeStickerSvg('#3B82F6', '💻', 'COMPUTER') },
  { id: 'stk-bell', name: 'Chuông (School Bell)', category: 'school', emoji: '🔔', bgColor: '#F59E0B', dataUrl: makeStickerSvg('#F59E0B', '🔔', 'BELL') },

  // SPORTS & ACTIVITIES
  { id: 'stk-soccer', name: 'Bóng đá (Soccer)', category: 'sports', emoji: '⚽', bgColor: '#10B981', dataUrl: makeStickerSvg('#10B981', '⚽', 'SOCCER') },
  { id: 'stk-basketball', name: 'Bóng rổ (Basketball)', category: 'sports', emoji: '🏀', bgColor: '#F97316', dataUrl: makeStickerSvg('#F97316', '🏀', 'BASKETBALL') },
  { id: 'stk-tennis', name: 'Quần vợt (Tennis)', category: 'sports', emoji: '🎾', bgColor: '#84CC16', dataUrl: makeStickerSvg('#84CC16', '🎾', 'TENNIS') },
  { id: 'stk-swimming', name: 'Bơi lội (Swimming)', category: 'sports', emoji: '🏊', bgColor: '#06B6D4', dataUrl: makeStickerSvg('#06B6D4', '🏊', 'SWIMMING') },
  { id: 'stk-bicycle', name: 'Đi xe đạp (Cycling)', category: 'sports', emoji: '🚴', bgColor: '#3B82F6', dataUrl: makeStickerSvg('#3B82F6', '🚴', 'CYCLING') },
  { id: 'stk-music', name: 'Âm nhạc (Music)', category: 'sports', emoji: '🎵', bgColor: '#EC4899', dataUrl: makeStickerSvg('#EC4899', '🎵', 'MUSIC') },
  { id: 'stk-sing', name: 'Ca hát (Singing)', category: 'sports', emoji: '🎤', bgColor: '#8B5CF6', dataUrl: makeStickerSvg('#8B5CF6', '🎤', 'SINGING') },
  { id: 'stk-dance', name: 'Nhảy múa (Dancing)', category: 'sports', emoji: '💃', bgColor: '#F43F5E', dataUrl: makeStickerSvg('#F43F5E', '💃', 'DANCING') },

  // VEHICLES
  { id: 'stk-car', name: 'Ô tô (Car)', category: 'transport', emoji: '🚗', bgColor: '#EF4444', dataUrl: makeStickerSvg('#EF4444', '🚗', 'CAR') },
  { id: 'stk-bus', name: 'Xe buýt (School Bus)', category: 'transport', emoji: '🚌', bgColor: '#F59E0B', dataUrl: makeStickerSvg('#F59E0B', '🚌', 'BUS') },
  { id: 'stk-plane', name: 'Máy bay (Airplane)', category: 'transport', emoji: '✈️', bgColor: '#3B82F6', dataUrl: makeStickerSvg('#3B82F6', '✈️', 'AIRPLANE') },
  { id: 'stk-rocket', name: 'Tên lửa (Rocket)', category: 'transport', emoji: '🚀', bgColor: '#8B5CF6', dataUrl: makeStickerSvg('#8B5CF6', '🚀', 'ROCKET') },
  { id: 'stk-train', name: 'Tàu hỏa (Train)', category: 'transport', emoji: '🚂', bgColor: '#10B981', dataUrl: makeStickerSvg('#10B981', '🚂', 'TRAIN') },
  { id: 'stk-ship', name: 'Tàu thủy (Ship)', category: 'transport', emoji: '🚢', bgColor: '#06B6D4', dataUrl: makeStickerSvg('#06B6D4', '🚢', 'SHIP') },

  // REWARDS
  { id: 'stk-trophy', name: 'Cúp vàng (Trophy)', category: 'rewards', emoji: '🏆', bgColor: '#F59E0B', dataUrl: makeStickerSvg('#F59E0B', '🏆', 'WINNER') },
  { id: 'stk-star', name: 'Ngôi sao (Star)', category: 'rewards', emoji: '⭐', bgColor: '#FBBF24', dataUrl: makeStickerSvg('#FBBF24', '⭐', 'STAR') },
  { id: 'stk-medal', name: 'Huy chương (Medal)', category: 'rewards', emoji: '🥇', bgColor: '#F59E0B', dataUrl: makeStickerSvg('#F59E0B', '🥇', '1ST PLACE') },
  { id: 'stk-crown', name: 'Vương miện (Crown)', category: 'rewards', emoji: '👑', bgColor: '#F59E0B', dataUrl: makeStickerSvg('#F59E0B', '👑', 'CHAMPION') },
  { id: 'stk-heart', name: 'Trái tim (Heart)', category: 'rewards', emoji: '💖', bgColor: '#EC4899', dataUrl: makeStickerSvg('#EC4899', '💖', 'LOVE') },
  { id: 'stk-cool', name: 'Siêu ngầu (Cool)', category: 'rewards', emoji: '😎', bgColor: '#3B82F6', dataUrl: makeStickerSvg('#3B82F6', '😎', 'AWESOME') },
  { id: 'stk-fire', name: 'Tuyệt đỉnh (Fire)', category: 'rewards', emoji: '🔥', bgColor: '#F97316', dataUrl: makeStickerSvg('#F97316', '🔥', 'ON FIRE') },
];

export const POPULAR_EMOJIS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅',
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑',
  '🍕', '🍔', '🍟', '🌭', '🍿', '🧁', '🍦', '🍩', '🍪', '🎂',
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏊', '🚴', '🧗', '🏆',
  '⭐', '🌟', '✨', '⚡', '💖', '🎉', '🎁', '👑', '🚀', '🔥'
];
