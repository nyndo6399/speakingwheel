import { CurrentGameState, RoomData, WheelConfig, WheelItem } from '../types/game';
import { DEFAULT_ROOMS, createEmptyWheel } from './defaultRooms';

const DB_NAME = 'SpeakSpinClassroomDB';
const DB_VERSION = 2;
const STORE_ROOMS = 'rooms';
const STORE_STATE = 'game_state';
const CURRENT_GAME_KEY = 'current_game_v2';
const LS_ROOMS_BACKUP_KEY = 'speakspin_rooms_backup_v2';
const LS_CURRENT_BACKUP_KEY = 'speakspin_current_backup_v2';
const LS_INIT_KEY = 'speakspin_initialized_v2';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_ROOMS)) {
        db.createObjectStore(STORE_ROOMS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_STATE)) {
        db.createObjectStore(STORE_STATE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB blocked'));
  });
}

export function normalizeRoom(raw: any): RoomData {
  const mode = raw.mode === 'dual' ? 'dual' : 'single';
  let wheel1: WheelConfig;
  let wheel2: WheelConfig;

  if (raw.wheel1 && Array.isArray(raw.wheel1.items)) {
    wheel1 = {
      id: 'wheel-1',
      title: raw.wheel1.title || (mode === 'dual' ? 'Wheel 1' : 'Topics'),
      items: raw.wheel1.items,
      selectedHistoryIds: Array.isArray(raw.wheel1.selectedHistoryIds) ? raw.wheel1.selectedHistoryIds : [],
      rounds: raw.wheel1.rounds || 2,
    };
  } else if (Array.isArray(raw.items)) {
    wheel1 = {
      id: 'wheel-1',
      title: 'Topics',
      items: raw.items,
      selectedHistoryIds: [],
      rounds: raw.settings?.rounds || 2,
    };
  } else {
    wheel1 = createEmptyWheel('wheel-1', 'Wheel 1');
  }

  if (raw.wheel2 && Array.isArray(raw.wheel2.items)) {
    wheel2 = {
      id: 'wheel-2',
      title: raw.wheel2.title || 'Wheel 2',
      items: raw.wheel2.items,
      selectedHistoryIds: Array.isArray(raw.wheel2.selectedHistoryIds) ? raw.wheel2.selectedHistoryIds : [],
      rounds: raw.wheel2.rounds || 2,
    };
  } else {
    wheel2 = createEmptyWheel('wheel-2', 'Wheel 2');
  }

  return {
    id: raw.id || `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    roomName: raw.roomName || 'Classroom Class',
    question: raw.question || '',
    mode,
    updatedAt: raw.updatedAt || Date.now(),
    settings: {
      mode,
      rounds: raw.settings?.rounds || 2,
      spinDuration: raw.settings?.spinDuration || 4,
      soundEnabled: typeof raw.settings?.soundEnabled === 'boolean' ? raw.settings.soundEnabled : true,
      avoidRepeat: typeof raw.settings?.avoidRepeat === 'boolean' ? raw.settings.avoidRepeat : true,
      dualSpinMode: raw.settings?.dualSpinMode === 'matched' ? 'matched' : 'random',
    },
    wheel1,
    wheel2,
    matchedPairs:
      raw.matchedPairs && typeof raw.matchedPairs === 'object' && !Array.isArray(raw.matchedPairs)
        ? raw.matchedPairs
        : {},
  };
}

export async function loadSavedRooms(): Promise<RoomData[]> {
  // 1. Try loading from IndexedDB
  try {
    const db = await openDatabase();
    const rooms = await new Promise<any[]>((resolve, reject) => {
      const tx = db.transaction(STORE_ROOMS, 'readonly');
      const store = tx.objectStore(STORE_ROOMS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (Array.isArray(rooms) && rooms.length > 0) {
      return rooms.map(normalizeRoom).sort((a, b) => b.updatedAt - a.updatedAt);
    }
  } catch (err) {
    console.warn('IndexedDB load rooms error, trying localStorage fallback', err);
  }

  // 2. Try loading from localStorage backup
  try {
    const raw = localStorage.getItem(LS_ROOMS_BACKUP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const normalized = parsed.map(normalizeRoom).sort((a, b) => b.updatedAt - a.updatedAt);
        // Sync back to IndexedDB asynchronously
        saveAllRoomsToIndexedDB(normalized).catch(() => {});
        return normalized;
      }
    }
  } catch (err) {
    console.warn('localStorage load rooms error', err);
  }

  // 3. Fallback: Seed DEFAULT_ROOMS if no saved rooms found
  await saveAllRooms(DEFAULT_ROOMS);
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_INIT_KEY, 'true');
  }
  return DEFAULT_ROOMS;
}

async function saveAllRoomsToIndexedDB(rooms: RoomData[]): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_ROOMS, 'readwrite');
    const store = tx.objectStore(STORE_ROOMS);
    store.clear();
    for (const room of rooms) {
      store.put(room);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(new Error('Transaction aborted'));
  });
}

export async function saveSingleRoom(room: RoomData): Promise<RoomData[]> {
  const allRooms = await loadSavedRooms();
  const idx = allRooms.findIndex((r) => r.id === room.id);
  let updated: RoomData[];
  if (idx >= 0) {
    updated = [...allRooms];
    updated[idx] = room;
  } else {
    updated = [room, ...allRooms];
  }
  await saveAllRooms(updated);
  return updated;
}

export async function saveAllRooms(rooms: RoomData[]): Promise<void> {
  // Always mark initialized
  try {
    localStorage.setItem(LS_INIT_KEY, 'true');
  } catch {
    // Ignore
  }

  // 1. Save to IndexedDB
  try {
    await saveAllRoomsToIndexedDB(rooms);
  } catch (err) {
    console.warn('Could not save to IndexedDB', err);
  }

  // 2. Save to localStorage backup (with quota protection)
  try {
    localStorage.setItem(LS_ROOMS_BACKUP_KEY, JSON.stringify(rooms));
  } catch {
    // If quota exceeded due to large images, save metadata and smaller images
    try {
      const lightweight = rooms.map((r) => ({
        ...r,
        wheel1: {
          ...r.wheel1,
          items: r.wheel1.items.map((it) => ({
            ...it,
            image: it.image && it.image.length > 15000 ? undefined : it.image,
          })),
        },
        wheel2: {
          ...r.wheel2,
          items: r.wheel2.items.map((it) => ({
            ...it,
            image: it.image && it.image.length > 15000 ? undefined : it.image,
          })),
        },
      }));
      localStorage.setItem(LS_ROOMS_BACKUP_KEY, JSON.stringify(lightweight));
    } catch {
      // Ignore
    }
  }
}

export async function saveCurrentGameState(state: CurrentGameState): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_STATE, 'readwrite');
      const store = tx.objectStore(STORE_STATE);
      store.put(state, CURRENT_GAME_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }

  try {
    localStorage.setItem(LS_CURRENT_BACKUP_KEY, JSON.stringify(state));
  } catch {
    try {
      const lightweight = {
        ...state,
        wheel1: {
          ...state.wheel1,
          items: state.wheel1.items.map((it) => ({
            ...it,
            image: it.image && it.image.length > 15000 ? undefined : it.image,
          })),
        },
        wheel2: {
          ...state.wheel2,
          items: state.wheel2.items.map((it) => ({
            ...it,
            image: it.image && it.image.length > 15000 ? undefined : it.image,
          })),
        },
      };
      localStorage.setItem(LS_CURRENT_BACKUP_KEY, JSON.stringify(lightweight));
    } catch {
      // Ignore
    }
  }
}

export async function loadCurrentGameState(): Promise<CurrentGameState | null> {
  try {
    const db = await openDatabase();
    const state = await new Promise<any>((resolve, reject) => {
      const tx = db.transaction(STORE_STATE, 'readonly');
      const store = tx.objectStore(STORE_STATE);
      const req = store.get(CURRENT_GAME_KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (state && (state.wheel1 || state.items)) {
      const norm = normalizeRoom(state);
      return {
        activeRoomId: state.activeRoomId || norm.id,
        roomName: norm.roomName,
        question: norm.question,
        mode: norm.mode,
        settings: norm.settings,
        wheel1: norm.wheel1,
        wheel2: norm.wheel2,
        matchedPairs: norm.matchedPairs,
      };
    }
  } catch {
    // Fallback
  }

  try {
    const raw = localStorage.getItem(LS_CURRENT_BACKUP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.wheel1 || parsed.items)) {
        const norm = normalizeRoom(parsed);
        return {
          activeRoomId: parsed.activeRoomId || norm.id,
          roomName: norm.roomName,
          question: norm.question,
          mode: norm.mode,
          settings: norm.settings,
          wheel1: norm.wheel1,
          wheel2: norm.wheel2,
          matchedPairs: norm.matchedPairs,
        };
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

export function processUploadedImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
    const isExtensionValid = /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);

    if (!validTypes.includes(file.type) && !isExtensionValid) {
      reject(new Error('Unsupported image format. Please upload PNG, JPG, JPEG, WEBP, or GIF.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (file.type === 'image/gif' || file.type === 'image/svg+xml' || /\.gif$/i.test(file.name)) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        const maxDim = 400;
        if (img.width <= maxDim && img.height <= maxDim) {
          resolve(dataUrl);
          return;
        }
        const scale = Math.min(maxDim / img.width, maxDim / img.height);
        const targetW = Math.round(img.width * scale);
        const targetH = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const outputType = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
        resolve(canvas.toDataURL(outputType, 0.88));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function exportRoomToJson(room: {
  roomName: string;
  question: string;
  mode?: 'single' | 'dual';
  settings: CurrentGameState['settings'];
  wheel1?: WheelConfig;
  wheel2?: WheelConfig;
  items?: WheelItem[];
  matchedPairs?: Record<string, string[]>;
}) {
  const norm = normalizeRoom(room);
  const exportPayload = {
    roomName: norm.roomName,
    question: norm.question,
    mode: norm.mode,
    settings: norm.settings,
    wheel1: norm.wheel1,
    wheel2: norm.wheel2,
    matchedPairs: norm.matchedPairs,
    items: norm.wheel1.items,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const safeFileName =
    (norm.roomName || 'Classroom_Class')
      .trim()
      .replace(/[^a-z0-9_-]+/gi, '_')
      .replace(/^_+|_+$/g, '') || 'Classroom_Class';

  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeFileName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAllRoomsToJson(rooms: RoomData[]) {
  const exportPayload = {
    app: 'SpeakSpin',
    exportedAt: Date.now(),
    version: 2,
    rooms: rooms.map(normalizeRoom),
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `SpeakSpin_All_Classes_Backup.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseImportedRoomJson(jsonText: string): RoomData {
  const raw = JSON.parse(jsonText);
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid JSON structure.');
  }
  // Check if it's an all-classes backup
  if (Array.isArray(raw.rooms) && raw.rooms.length > 0) {
    return normalizeRoom(raw.rooms[0]);
  }
  return normalizeRoom(raw);
}

export function parseImportedAllRoomsJson(jsonText: string): RoomData[] {
  const raw = JSON.parse(jsonText);
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid JSON structure.');
  }
  if (Array.isArray(raw.rooms)) {
    return raw.rooms.map(normalizeRoom);
  }
  if (Array.isArray(raw)) {
    return raw.map(normalizeRoom);
  }
  return [normalizeRoom(raw)];
}
