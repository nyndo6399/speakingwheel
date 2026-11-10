import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Settings,
  FolderOpen,
  RotateCcw,
  Trash2,
  Play,
  Plus,
  Download,
  Upload,
  Disc,
  Save,
  Camera,
  Maximize,
  Minimize,
  Link2,
  Shuffle,
  SlidersHorizontal,
} from 'lucide-react';
import {
  CurrentGameState,
  DualSpinMode,
  RoomData,
  SECTION_COUNT_PRESETS,
  WheelConfig,
  WheelItem,
  WheelSettings,
} from './types/game';
import { DEFAULT_ROOMS, createDefaultItem, createEmptyWheel } from './utils/defaultRooms';
import {
  exportRoomToJson,
  loadCurrentGameState,
  loadSavedRooms,
  parseImportedRoomJson,
  saveAllRooms,
  saveCurrentGameState,
} from './utils/storage';
import {
  calculateSpinRotation,
  easeWheelSpin,
  getSliceIndexAtRotation,
  selectRandomWinner,
} from './utils/wheelMath';
import { getValidTargetsForWinner, isPairMatching } from './utils/pairMatching';
import { soundEngine } from './utils/soundEngine';
import { TopBar } from './components/TopBar';
import { QuestionBox } from './components/QuestionBox';
import { SpinWheelCanvas } from './components/SpinWheelCanvas';
import { WheelEditorPanel } from './components/WheelEditorPanel';
import { RoomsModal } from './components/RoomsModal';
import { SaveClassModal } from './components/SaveClassModal';
import { WinnerModal } from './components/WinnerModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SlotImageModal } from './components/SlotImageModal';
import { PairMatchingModal } from './components/PairMatchingModal';
import { CsvImportModal } from './components/CsvImportModal';

export default function App() {
  const initialRoom = DEFAULT_ROOMS[0];

  const [savedRooms, setSavedRooms] = useState<RoomData[]>(DEFAULT_ROOMS);
  const [currentGame, setCurrentGame] = useState<CurrentGameState>({
    activeRoomId: initialRoom.id,
    roomName: initialRoom.roomName,
    question: initialRoom.question,
    mode: initialRoom.mode,
    settings: { ...initialRoom.settings },
    wheel1: { ...initialRoom.wheel1, items: initialRoom.wheel1.items.map((it) => ({ ...it })) },
    wheel2: { ...initialRoom.wheel2, items: initialRoom.wheel2.items.map((it) => ({ ...it })) },
    matchedPairs: initialRoom.matchedPairs ? { ...initialRoom.matchedPairs } : {},
  });

  const [isStorageReady, setIsStorageReady] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isPairMatchingOpen, setIsPairMatchingOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [csvTargetWheel, setCsvTargetWheel] = useState<'wheel-1' | 'wheel-2'>('wheel-1');
  const [slotImageModal, setSlotImageModal] = useState<{
    isOpen: boolean;
    wheelId: 'wheel-1' | 'wheel-2';
    slotIndex: number;
  }>({
    isOpen: false,
    wheelId: 'wheel-1',
    slotIndex: 0,
  });

  // Wheel 1 Spin state
  const [rot1, setRot1] = useState(0);
  const [isSpinning1, setIsSpinning1] = useState(false);
  const [winIndex1, setWinIndex1] = useState<number | null>(null);
  const [pointerKick1, setPointerKick1] = useState(false);
  const [lastWinId1, setLastWinId1] = useState<string | null>(null);

  // Wheel 2 Spin state
  const [rot2, setRot2] = useState(0);
  const [isSpinning2, setIsSpinning2] = useState(false);
  const [winIndex2, setWinIndex2] = useState<number | null>(null);
  const [pointerKick2, setPointerKick2] = useState(false);
  const [lastWinId2, setLastWinId2] = useState<string | null>(null);

  // Winner Modal display
  const [modalWinner1, setModalWinner1] = useState<WheelItem | null>(null);
  const [modalWinner2, setModalWinner2] = useState<WheelItem | null>(null);

  // Drawers & Modals
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'editor' | 'rooms'>('none');
  const [activeWheelTab, setActiveWheelTab] = useState<'wheel-1' | 'wheel-2'>('wheel-1');
  const [roomToDelete, setRoomToDelete] = useState<RoomData | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmClearAllOpen, setConfirmClearAllOpen] = useState(false);
  const [clearAllTarget, setClearAllTarget] = useState<'wheel-1' | 'wheel-2'>('wheel-1');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const animRef1 = useRef<number | null>(null);
  const animRef2 = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  // Listen for fullscreen state changes across vendors
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element;
        mozFullScreenElement?: Element;
        msFullscreenElement?: Element;
      };
      const isCurrentlyFullscreen = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    try {
      const doc = document as Document & {
        webkitFullscreenElement?: Element;
        mozFullScreenElement?: Element;
        msFullscreenElement?: Element;
        exitFullscreen: () => Promise<void>;
        webkitExitFullscreen?: () => Promise<void>;
        mozCancelFullScreen?: () => Promise<void>;
        msExitFullscreen?: () => Promise<void>;
      };
      const docEl = document.documentElement as HTMLElement & {
        requestFullscreen: () => Promise<void>;
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };

      const isCurrentlyFullscreen = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
      showToast('Không thể chuyển toàn màn hình tự động (nhấn F11 trên bàn phím để mở full).');
    }
  }, [showToast]);

  // Load from IndexedDB / localStorage on startup
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [loadedRooms, loadedCurrent] = await Promise.all([
        loadSavedRooms(),
        loadCurrentGameState(),
      ]);
      if (!mounted) return;
      setSavedRooms(loadedRooms);
      if (loadedCurrent) {
        setCurrentGame(loadedCurrent);
        soundEngine.setEnabled(loadedCurrent.settings.soundEnabled);
      } else if (loadedRooms.length > 0) {
        const first = loadedRooms[0];
        setCurrentGame({
          activeRoomId: first.id,
          roomName: first.roomName,
          question: first.question,
          mode: first.mode,
          settings: { ...first.settings },
          wheel1: { ...first.wheel1, items: first.wheel1.items.map((it) => ({ ...it })) },
          wheel2: { ...first.wheel2, items: first.wheel2.items.map((it) => ({ ...it })) },
        });
        soundEngine.setEnabled(first.settings.soundEnabled);
      }
      setIsStorageReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-save currentGame
  useEffect(() => {
    if (!isStorageReady) return;
    saveCurrentGameState(currentGame);
    soundEngine.setEnabled(currentGame.settings.soundEnabled);
  }, [currentGame, isStorageReady]);

  // Clean animation frames
  useEffect(() => {
    return () => {
      if (animRef1.current) cancelAnimationFrame(animRef1.current);
      if (animRef2.current) cancelAnimationFrame(animRef2.current);
    };
  }, []);

  // Spin Wheel 1
  const spinWheel1 = useCallback(
    (onComplete?: (winner: WheelItem) => void, forcedWinningIndex?: number) => {
      if (isSpinning1 || currentGame.wheel1.items.length < 2) return;

      setIsSpinning1(true);
      setWinIndex1(null);

      let winningIndex: number;
      let winningItem: WheelItem;
      let updatedHistoryIds: string[];

      if (
        typeof forcedWinningIndex === 'number' &&
        forcedWinningIndex >= 0 &&
        forcedWinningIndex < currentGame.wheel1.items.length
      ) {
        winningIndex = forcedWinningIndex;
        winningItem = currentGame.wheel1.items[winningIndex];
        updatedHistoryIds = [...currentGame.wheel1.selectedHistoryIds, winningItem.id];
      } else {
        const rand = selectRandomWinner(
          currentGame.wheel1.items,
          currentGame.settings.avoidRepeat,
          currentGame.wheel1.selectedHistoryIds,
          lastWinId1
        );
        winningIndex = rand.winningIndex;
        winningItem = rand.winningItem;
        updatedHistoryIds = rand.updatedHistoryIds;
      }

      const startRot = rot1;
      const { finalRotationDeg, deltaRotationDeg } = calculateSpinRotation(
        startRot,
        winningIndex,
        currentGame.wheel1.items.length,
        currentGame.settings.rounds
      );

      const durationMs = currentGame.settings.spinDuration * 1000;
      const startTime = performance.now();
      let lastSlice = getSliceIndexAtRotation(startRot, currentGame.wheel1.items.length);

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / durationMs);
        const eased = easeWheelSpin(t);
        const curRot = startRot + deltaRotationDeg * eased;
        setRot1(curRot);

        const curSlice = getSliceIndexAtRotation(curRot, currentGame.wheel1.items.length);
        if (curSlice !== lastSlice) {
          lastSlice = curSlice;
          soundEngine.playTick(t, 0);
          setPointerKick1(true);
          setTimeout(() => setPointerKick1(false), 60);
        }

        if (t < 1) {
          animRef1.current = requestAnimationFrame(step);
        } else {
          setRot1(finalRotationDeg);
          setIsSpinning1(false);
          setWinIndex1(winningIndex);
          setLastWinId1(winningItem.id);
          setCurrentGame((prev) => ({
            ...prev,
            wheel1: {
              ...prev.wheel1,
              selectedHistoryIds: updatedHistoryIds,
            },
          }));
          if (onComplete) onComplete(winningItem);
        }
      };

      animRef1.current = requestAnimationFrame(step);
    },
    [
      isSpinning1,
      currentGame.wheel1.items,
      currentGame.wheel1.selectedHistoryIds,
      currentGame.settings.avoidRepeat,
      currentGame.settings.rounds,
      currentGame.settings.spinDuration,
      lastWinId1,
      rot1,
    ]
  );

  // Spin Wheel 2
  const spinWheel2 = useCallback(
    (onComplete?: (winner: WheelItem) => void, forcedWinningIndex?: number) => {
      if (isSpinning2 || currentGame.wheel2.items.length < 2) return;

      setIsSpinning2(true);
      setWinIndex2(null);

      let winningIndex: number;
      let winningItem: WheelItem;
      let updatedHistoryIds: string[];

      if (
        typeof forcedWinningIndex === 'number' &&
        forcedWinningIndex >= 0 &&
        forcedWinningIndex < currentGame.wheel2.items.length
      ) {
        winningIndex = forcedWinningIndex;
        winningItem = currentGame.wheel2.items[winningIndex];
        updatedHistoryIds = [...currentGame.wheel2.selectedHistoryIds, winningItem.id];
      } else {
        const rand = selectRandomWinner(
          currentGame.wheel2.items,
          currentGame.settings.avoidRepeat,
          currentGame.wheel2.selectedHistoryIds,
          lastWinId2
        );
        winningIndex = rand.winningIndex;
        winningItem = rand.winningItem;
        updatedHistoryIds = rand.updatedHistoryIds;
      }

      const startRot = rot2;
      const { finalRotationDeg, deltaRotationDeg } = calculateSpinRotation(
        startRot,
        winningIndex,
        currentGame.wheel2.items.length,
        currentGame.settings.rounds
      );

      const durationMs = currentGame.settings.spinDuration * 1000;
      const startTime = performance.now();
      let lastSlice = getSliceIndexAtRotation(startRot, currentGame.wheel2.items.length);

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / durationMs);
        const eased = easeWheelSpin(t);
        const curRot = startRot + deltaRotationDeg * eased;
        setRot2(curRot);

        const curSlice = getSliceIndexAtRotation(curRot, currentGame.wheel2.items.length);
        if (curSlice !== lastSlice) {
          lastSlice = curSlice;
          soundEngine.playTick(t, 60); // slightly different pitch so dual ticks are distinguishable
          setPointerKick2(true);
          setTimeout(() => setPointerKick2(false), 60);
        }

        if (t < 1) {
          animRef2.current = requestAnimationFrame(step);
        } else {
          setRot2(finalRotationDeg);
          setIsSpinning2(false);
          setWinIndex2(winningIndex);
          setLastWinId2(winningItem.id);
          setCurrentGame((prev) => ({
            ...prev,
            wheel2: {
              ...prev.wheel2,
              selectedHistoryIds: updatedHistoryIds,
            },
          }));
          if (onComplete) onComplete(winningItem);
        }
      };

      animRef2.current = requestAnimationFrame(step);
    },
    [
      isSpinning2,
      currentGame.wheel2.items,
      currentGame.wheel2.selectedHistoryIds,
      currentGame.settings.avoidRepeat,
      currentGame.settings.rounds,
      currentGame.settings.spinDuration,
      lastWinId2,
      rot2,
    ]
  );

  // Spin All Active Wheels (Single or Dual)
  const handleSpinMaster = useCallback(() => {
    if (currentGame.mode === 'single') {
      if (isSpinning1 || currentGame.wheel1.items.length < 2) return;
      setModalWinner1(null);
      setModalWinner2(null);
      soundEngine.playSpinStart();
      spinWheel1((winner1) => {
        soundEngine.playWinnerFanfare();
        setTimeout(() => setModalWinner1(winner1), 300);
      });
    } else {
      // Dual wheel spin
      if (
        isSpinning1 ||
        isSpinning2 ||
        currentGame.wheel1.items.length < 2 ||
        currentGame.wheel2.items.length < 2
      ) {
        return;
      }
      setModalWinner1(null);
      setModalWinner2(null);
      soundEngine.playSpinStart();

      let w1: WheelItem | null = null;
      let w2: WheelItem | null = null;

      const checkBothDone = () => {
        if (w1 && w2) {
          soundEngine.playWinnerFanfare();
          setTimeout(() => {
            setModalWinner1(w1);
            setModalWinner2(w2);
          }, 320);
        }
      };

      // Check if paired spin mode is active
      if (currentGame.settings.dualSpinMode === 'matched') {
        // 1. Choose winner for wheel 1
        const pick1 = selectRandomWinner(
          currentGame.wheel1.items,
          currentGame.settings.avoidRepeat,
          currentGame.wheel1.selectedHistoryIds,
          lastWinId1
        );

        // 2. Resolve matching candidate items in wheel 2
        const validCandidates = getValidTargetsForWinner(
          pick1.winningItem,
          currentGame.wheel2.items,
          currentGame.matchedPairs
        );

        let targetIndex2: number;
        if (validCandidates.length > 0) {
          const chosenTarget = validCandidates[Math.floor(Math.random() * validCandidates.length)];
          targetIndex2 = currentGame.wheel2.items.findIndex((it) => it.id === chosenTarget.id);
          if (targetIndex2 < 0) {
            targetIndex2 = Math.floor(Math.random() * currentGame.wheel2.items.length);
          }
        } else {
          // Fallback to random pick for wheel 2 if no pair configured for this item
          const pick2 = selectRandomWinner(
            currentGame.wheel2.items,
            currentGame.settings.avoidRepeat,
            currentGame.wheel2.selectedHistoryIds,
            lastWinId2
          );
          targetIndex2 = pick2.winningIndex;
        }

        spinWheel1((item1) => {
          w1 = item1;
          checkBothDone();
        }, pick1.winningIndex);

        spinWheel2((item2) => {
          w2 = item2;
          checkBothDone();
        }, targetIndex2);
      } else {
        // Pure random dual spin
        spinWheel1((item1) => {
          w1 = item1;
          checkBothDone();
        });

        spinWheel2((item2) => {
          w2 = item2;
          checkBothDone();
        });
      }
    }
  }, [
    currentGame.mode,
    currentGame.wheel1.items,
    currentGame.wheel1.selectedHistoryIds,
    currentGame.wheel2.items,
    currentGame.wheel2.selectedHistoryIds,
    currentGame.settings.avoidRepeat,
    currentGame.settings.dualSpinMode,
    currentGame.matchedPairs,
    isSpinning1,
    isSpinning2,
    lastWinId1,
    lastWinId2,
    spinWheel1,
    spinWheel2,
  ]);

  // Spacebar shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (
        activeDrawer !== 'none' ||
        modalWinner1 ||
        roomToDelete ||
        confirmResetOpen ||
        confirmClearAllOpen
      ) {
        return;
      }
      e.preventDefault();
      handleSpinMaster();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handleSpinMaster,
    activeDrawer,
    modalWinner1,
    roomToDelete,
    confirmResetOpen,
    confirmClearAllOpen,
  ]);

  // Mode switcher (Single vs Dual Wheel)
  const handleToggleWheelMode = (mode: 'single' | 'dual') => {
    soundEngine.playUiClick();
    setCurrentGame((prev) => ({
      ...prev,
      mode,
      settings: {
        ...prev.settings,
        mode,
      },
    }));
    showToast(
      mode === 'dual'
        ? 'Dual Wheels enabled: 2 wheels placed side-by-side!'
        : 'Single Wheel enabled'
    );
  };

  // Wheel settings & items handlers
  const handleUpdateSettings = (partial: Partial<WheelSettings>) => {
    soundEngine.playUiClick();
    setCurrentGame((prev) => {
      const nextSettings = {
        ...prev.settings,
        ...partial,
      };
      if (partial.dualSpinMode) {
        showToast(
          partial.dualSpinMode === 'matched'
            ? 'Đã bật: 🔗 Sắp xếp cặp theo ý muốn'
            : 'Đã bật: 🎲 Quay ngẫu nhiên độc lập'
        );
      }
      return {
        ...prev,
        settings: nextSettings,
      };
    });
  };

  const handleUpdateMatchedPairs = async (pairs: Record<string, string[]>) => {
    soundEngine.playUiClick();
    setCurrentGame((prev) => ({
      ...prev,
      matchedPairs: pairs,
    }));

    if (currentGame.activeRoomId) {
      const updatedRooms = savedRooms.map((r) =>
        r.id === currentGame.activeRoomId
          ? { ...r, matchedPairs: pairs, updatedAt: Date.now() }
          : r
      );
      setSavedRooms(updatedRooms);
      await saveAllRooms(updatedRooms);
    }
    showToast('Đã lưu cấu hình ghép cặp 2 vòng thành công!');
  };

  const handleUpdateWheelTitle = (wheelId: 'wheel-1' | 'wheel-2', title: string) => {
    setCurrentGame((prev) => ({
      ...prev,
      [wheelId === 'wheel-1' ? 'wheel1' : 'wheel2']: {
        ...prev[wheelId === 'wheel-1' ? 'wheel1' : 'wheel2'],
        title,
      },
    }));
  };

  const handleSetSectionCount = (wheelId: 'wheel-1' | 'wheel-2', targetCount: number) => {
    const clamped = Math.max(2, Math.min(30, targetCount));
    soundEngine.playUiClick();
    const key = wheelId === 'wheel-1' ? 'wheel1' : 'wheel2';

    if (wheelId === 'wheel-1') setWinIndex1(null);
    else setWinIndex2(null);

    setCurrentGame((prev) => {
      const items = [...prev[key].items];
      if (clamped > items.length) {
        for (let i = items.length; i < clamped; i++) {
          items.push(createDefaultItem(i, prev[key].title || 'Topic'));
        }
      } else if (clamped < items.length) {
        items.length = clamped;
      }
      return {
        ...prev,
        [key]: {
          ...prev[key],
          items,
        },
      };
    });
  };

  const handleAddItem = (wheelId: 'wheel-1' | 'wheel-2') => {
    soundEngine.playUiClick();
    const key = wheelId === 'wheel-1' ? 'wheel1' : 'wheel2';
    if (wheelId === 'wheel-1') setWinIndex1(null);
    else setWinIndex2(null);

    setCurrentGame((prev) => {
      const newItem = createDefaultItem(prev[key].items.length, prev[key].title || 'Topic');
      return {
        ...prev,
        [key]: {
          ...prev[key],
          items: [...prev[key].items, newItem],
        },
      };
    });
  };

  const handleUpdateItem = (
    wheelId: 'wheel-1' | 'wheel-2',
    itemId: string,
    partial: Partial<WheelItem>
  ) => {
    const key = wheelId === 'wheel-1' ? 'wheel1' : 'wheel2';
    setCurrentGame((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        items: prev[key].items.map((it) => (it.id === itemId ? { ...it, ...partial } : it)),
      },
    }));
  };

  const handleOpenSlotImageModal = (wheelId: 'wheel-1' | 'wheel-2', slotIndex = 0) => {
    soundEngine.playUiClick();
    const wheel = wheelId === 'wheel-1' ? currentGame.wheel1 : currentGame.wheel2;
    const clampedIndex = Math.max(0, Math.min(slotIndex, Math.max(0, wheel.items.length - 1)));
    setSlotImageModal({
      isOpen: true,
      wheelId,
      slotIndex: clampedIndex,
    });
  };

  const handleCloseSlotImageModal = () => {
    setSlotImageModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleOpenCsvImport = (wheelId: 'wheel-1' | 'wheel-2' = 'wheel-1') => {
    soundEngine.playUiClick();
    setCsvTargetWheel(wheelId);
    setIsCsvImportOpen(true);
  };

  const handleImportCsvItems = (
    targetWheel: 'wheel-1' | 'wheel-2',
    newItems: WheelItem[],
    mode: 'replace' | 'append'
  ) => {
    soundEngine.playUiClick();
    const key = targetWheel === 'wheel-1' ? 'wheel1' : 'wheel2';
    if (targetWheel === 'wheel-1') setWinIndex1(null);
    else setWinIndex2(null);

    setCurrentGame((prev) => {
      const finalItems =
        mode === 'replace'
          ? newItems
          : [...prev[key].items, ...newItems];

      return {
        ...prev,
        [key]: {
          ...prev[key],
          items: finalItems,
          selectedHistoryIds: [],
        },
      };
    });

    const wheelTitle =
      targetWheel === 'wheel-1'
        ? currentGame.wheel1.title || 'Vòng 1'
        : currentGame.wheel2.title || 'Vòng 2';
    showToast(
      `Đã ${mode === 'replace' ? 'thay thế' : 'thêm'} thành công ${newItems.length} ô vào ${wheelTitle}!`
    );
  };

  const handleDeleteItem = (wheelId: 'wheel-1' | 'wheel-2', itemId: string) => {
    soundEngine.playUiClick();
    const key = wheelId === 'wheel-1' ? 'wheel1' : 'wheel2';
    if (wheelId === 'wheel-1') setWinIndex1(null);
    else setWinIndex2(null);

    setCurrentGame((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        items: prev[key].items.filter((it) => it.id !== itemId),
        selectedHistoryIds: prev[key].selectedHistoryIds.filter((id) => id !== itemId),
      },
    }));
  };

  const handleMoveItem = (
    wheelId: 'wheel-1' | 'wheel-2',
    index: number,
    direction: 'up' | 'down'
  ) => {
    soundEngine.playUiClick();
    const key = wheelId === 'wheel-1' ? 'wheel1' : 'wheel2';
    if (wheelId === 'wheel-1') setWinIndex1(null);
    else setWinIndex2(null);

    setCurrentGame((prev) => {
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= prev[key].items.length) return prev;
      const copy = [...prev[key].items];
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      return {
        ...prev,
        [key]: {
          ...prev[key],
          items: copy,
        },
      };
    });
  };

  const handleResetHistory = (wheelId: 'wheel-1' | 'wheel-2') => {
    soundEngine.playUiClick();
    const key = wheelId === 'wheel-1' ? 'wheel1' : 'wheel2';
    setCurrentGame((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        selectedHistoryIds: [],
      },
    }));
    showToast(`Reset spin history for ${currentGame[key].title || wheelId}`);
  };

  // Rooms management
  const handleOpenRoom = (room: RoomData) => {
    soundEngine.playUiClick();
    setWinIndex1(null);
    setWinIndex2(null);
    setModalWinner1(null);
    setModalWinner2(null);
    setRot1(0);
    setRot2(0);

    setCurrentGame({
      activeRoomId: room.id,
      roomName: room.roomName,
      question: room.question,
      mode: room.mode,
      settings: { ...room.settings },
      wheel1: { ...room.wheel1, items: room.wheel1.items.map((it) => ({ ...it })) },
      wheel2: { ...room.wheel2, items: room.wheel2.items.map((it) => ({ ...it })) },
      matchedPairs: room.matchedPairs ? { ...room.matchedPairs } : {},
    });
  };

  const handleCreateNewRoom = async (roomName: string) => {
    soundEngine.playUiClick();
    const newRoom: RoomData = {
      id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      roomName,
      question: currentGame.question,
      mode: currentGame.mode,
      updatedAt: Date.now(),
      settings: { ...currentGame.settings },
      wheel1: { ...currentGame.wheel1, items: currentGame.wheel1.items.map((it) => ({ ...it })) },
      wheel2: { ...currentGame.wheel2, items: currentGame.wheel2.items.map((it) => ({ ...it })) },
      matchedPairs: currentGame.matchedPairs ? { ...currentGame.matchedPairs } : {},
    };

    const updated = [newRoom, ...savedRooms];
    setSavedRooms(updated);
    await saveAllRooms(updated);
    setCurrentGame((prev) => ({
      ...prev,
      activeRoomId: newRoom.id,
      roomName: newRoom.roomName,
    }));
    showToast(`Created & saved new class "${roomName}"!`);
  };

  const handleSaveClass = async (name: string, isNew: boolean) => {
    soundEngine.playUiClick();
    const finalName = name.trim() || 'My Classroom Class';
    const isUpdatingExisting = !isNew && Boolean(currentGame.activeRoomId);
    const classId = isUpdatingExisting
      ? currentGame.activeRoomId!
      : `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const roomData: RoomData = {
      id: classId,
      roomName: finalName,
      question: currentGame.question,
      mode: currentGame.mode,
      updatedAt: Date.now(),
      settings: { ...currentGame.settings },
      wheel1: {
        ...currentGame.wheel1,
        items: currentGame.wheel1.items.map((it) => ({ ...it })),
      },
      wheel2: {
        ...currentGame.wheel2,
        items: currentGame.wheel2.items.map((it) => ({ ...it })),
      },
      matchedPairs: currentGame.matchedPairs ? { ...currentGame.matchedPairs } : {},
    };

    let updatedList: RoomData[];
    const existingIndex = savedRooms.findIndex((r) => r.id === classId);
    if (!isNew && existingIndex >= 0) {
      updatedList = [...savedRooms];
      updatedList[existingIndex] = roomData;
    } else {
      updatedList = [roomData, ...savedRooms.filter((r) => r.id !== classId)];
    }

    setSavedRooms(updatedList);
    await saveAllRooms(updatedList);

    setCurrentGame((prev) => ({
      ...prev,
      activeRoomId: classId,
      roomName: finalName,
    }));

    setIsSaveModalOpen(false);
    showToast(`Saved class "${finalName}" with all created data!`);
  };

  const handleUpdateActiveRoom = async () => {
    soundEngine.playUiClick();
    const idx = savedRooms.findIndex((r) => r.id === currentGame.activeRoomId);
    if (idx >= 0) {
      const updatedRoom: RoomData = {
        ...savedRooms[idx],
        roomName: currentGame.roomName,
        question: currentGame.question,
        mode: currentGame.mode,
        updatedAt: Date.now(),
        settings: { ...currentGame.settings },
        wheel1: { ...currentGame.wheel1, items: currentGame.wheel1.items.map((it) => ({ ...it })) },
        wheel2: { ...currentGame.wheel2, items: currentGame.wheel2.items.map((it) => ({ ...it })) },
        matchedPairs: currentGame.matchedPairs ? { ...currentGame.matchedPairs } : {},
      };
      const updated = [...savedRooms];
      updated[idx] = updatedRoom;
      setSavedRooms(updated);
      await saveAllRooms(updated);
      showToast(`Updated "${updatedRoom.roomName}"!`);
    } else {
      setIsSaveModalOpen(true);
    }
  };

  // Ctrl+S / Cmd+S shortcut to save active class
  useEffect(() => {
    const onSaveKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleUpdateActiveRoom();
      }
    };
    window.addEventListener('keydown', onSaveKey);
    return () => window.removeEventListener('keydown', onSaveKey);
  }, [handleUpdateActiveRoom]);

  const handleCreateBlankClass = async () => {
    soundEngine.playUiClick();
    const newName = `Class ${savedRooms.length + 1} - New Topic`;
    const newId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const blankRoom: RoomData = {
      id: newId,
      roomName: newName,
      question: '',
      mode: 'single',
      updatedAt: Date.now(),
      settings: {
        mode: 'single',
        rounds: 2,
        spinDuration: 4,
        soundEnabled: currentGame.settings.soundEnabled,
        avoidRepeat: true,
      },
      wheel1: {
        id: 'wheel-1',
        title: 'Topics',
        items: [
          createDefaultItem(0, 'Topic 1'),
          createDefaultItem(1, 'Topic 2'),
          createDefaultItem(2, 'Topic 3'),
          createDefaultItem(3, 'Topic 4'),
        ],
        selectedHistoryIds: [],
        rounds: 2,
      },
      wheel2: createEmptyWheel('wheel-2', 'Wheel 2'),
    };

    const updated = [blankRoom, ...savedRooms];
    setSavedRooms(updated);
    await saveAllRooms(updated);
    handleOpenRoom(blankRoom);
    showToast(`Created blank class "${newName}"!`);
  };

  const handleRenameRoom = async (roomId: string, newName: string) => {
    soundEngine.playUiClick();
    const updated = savedRooms.map((r) =>
      r.id === roomId ? { ...r, roomName: newName, updatedAt: Date.now() } : r
    );
    setSavedRooms(updated);
    await saveAllRooms(updated);
    if (currentGame.activeRoomId === roomId) {
      setCurrentGame((prev) => ({ ...prev, roomName: newName }));
    }
    showToast(`Renamed to "${newName}"`);
  };

  const handleDuplicateRoom = async (room: RoomData) => {
    soundEngine.playUiClick();
    const dup: RoomData = {
      ...room,
      id: `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      roomName: `${room.roomName} (Copy)`,
      updatedAt: Date.now(),
      wheel1: {
        ...room.wheel1,
        items: room.wheel1.items.map((it) => ({ ...it, id: `${it.id}-copy-${Date.now()}` })),
      },
      wheel2: {
        ...room.wheel2,
        items: room.wheel2.items.map((it) => ({ ...it, id: `${it.id}-copy-${Date.now()}` })),
      },
    };
    const updated = [dup, ...savedRooms];
    setSavedRooms(updated);
    await saveAllRooms(updated);
    showToast(`Duplicated "${room.roomName}"!`);
  };

  const handleConfirmDeleteRoom = async () => {
    if (!roomToDelete) return;
    soundEngine.playUiClick();
    const name = roomToDelete.roomName;
    const updated = savedRooms.filter((r) => r.id !== roomToDelete.id);
    setSavedRooms(updated);
    await saveAllRooms(updated);

    if (currentGame.activeRoomId === roomToDelete.id) {
      if (updated.length > 0) {
        handleOpenRoom(updated[0]);
      }
    }
    setRoomToDelete(null);
    showToast(`Deleted room "${name}"`);
  };

  const handleImportRoom = async (imported: RoomData) => {
    soundEngine.playUiClick();
    const updated = [imported, ...savedRooms.filter((r) => r.id !== imported.id)];
    setSavedRooms(updated);
    await saveAllRooms(updated);
    handleOpenRoom(imported);
    showToast(`Imported class "${imported.roomName}"!`);
  };

  const handleImportMultipleRooms = async (rooms: RoomData[]) => {
    soundEngine.playUiClick();
    const importedIds = new Set(rooms.map((r) => r.id));
    const updated = [...rooms, ...savedRooms.filter((r) => !importedIds.has(r.id))];
    setSavedRooms(updated);
    await saveAllRooms(updated);
    if (rooms.length > 0) {
      handleOpenRoom(rooms[0]);
    }
    showToast(`Imported ${rooms.length} classes!`);
  };

  const handleConfirmResetGame = () => {
    soundEngine.playUiClick();
    setRot1(0);
    setRot2(0);
    setWinIndex1(null);
    setWinIndex2(null);
    setModalWinner1(null);
    setModalWinner2(null);

    const activeSaved = savedRooms.find((r) => r.id === currentGame.activeRoomId);
    if (activeSaved) {
      setCurrentGame({
        activeRoomId: activeSaved.id,
        roomName: activeSaved.roomName,
        question: activeSaved.question,
        mode: activeSaved.mode,
        settings: { ...activeSaved.settings },
        wheel1: { ...activeSaved.wheel1, items: activeSaved.wheel1.items.map((it) => ({ ...it })) },
        wheel2: { ...activeSaved.wheel2, items: activeSaved.wheel2.items.map((it) => ({ ...it })) },
        matchedPairs: activeSaved.matchedPairs ? { ...activeSaved.matchedPairs } : {},
      });
    }
    setConfirmResetOpen(false);
    showToast('Current wheels have been reset.');
  };

  const handleConfirmClearAll = () => {
    soundEngine.playUiClick();
    const key = clearAllTarget === 'wheel-1' ? 'wheel1' : 'wheel2';
    if (clearAllTarget === 'wheel-1') {
      setRot1(0);
      setWinIndex1(null);
    } else {
      setRot2(0);
      setWinIndex2(null);
    }
    setCurrentGame((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        items: [],
        selectedHistoryIds: [],
      },
    }));
    setConfirmClearAllOpen(false);
    showToast(`Cleared items in ${currentGame[key].title || clearAllTarget}.`);
  };

  const isDual = currentGame.mode === 'dual';
  const anySpinning = isSpinning1 || isSpinning2;
  const canSpinMaster =
    !anySpinning &&
    currentGame.wheel1.items.length >= 2 &&
    (!isDual || currentGame.wheel2.items.length >= 2);

  return (
    <div className="min-h-screen flex flex-col text-slate-900 relative">
      {/* High-definition, sharp background layer */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://i.postimg.cc/T2sjpPZF/Thiet-ke-chua-co-ten-(1).jpg')",
            imageRendering: '-webkit-optimize-contrast',
            transform: 'translate3d(0, 0, 0)',
            WebkitTransform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            filter: 'contrast(1.12) saturate(1.08) brightness(1.01)',
            WebkitFilter: 'contrast(1.12) saturate(1.08) brightness(1.01)',
          }}
        />
      </div>

      <TopBar
        soundEnabled={currentGame.settings.soundEnabled}
        onToggleSound={() =>
          handleUpdateSettings({ soundEnabled: !currentGame.settings.soundEnabled })
        }
        wheelMode={currentGame.mode}
        onToggleWheelMode={handleToggleWheelMode}
        onOpenEditor={() => setActiveDrawer((prev) => (prev === 'editor' ? 'none' : 'editor'))}
        onOpenRooms={() => setActiveDrawer((prev) => (prev === 'rooms' ? 'none' : 'rooms'))}
        onResetGame={() => setConfirmResetOpen(true)}
        onQuickSaveRoom={handleUpdateActiveRoom}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        currentClassName={currentGame.roomName}
        activeDrawer={activeDrawer}
        onCloseDrawers={() => setActiveDrawer('none')}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-lg text-xs sm:text-sm font-semibold animate-pop-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      <main
        id="wheel-stage"
        className="flex-1 w-full max-w-7xl mx-auto px-4 pb-8 flex flex-col items-center justify-between"
      >
        {/* Speaking Question Prompt */}
        <QuestionBox
          question={currentGame.question}
          onChangeQuestion={(newQuestion) =>
            setCurrentGame((prev) => ({ ...prev, question: newQuestion }))
          }
          roomName={currentGame.roomName}
          onRenameRoom={(newName) => handleRenameRoom(currentGame.activeRoomId || '', newName)}
          mode={currentGame.mode}
          savedRooms={savedRooms}
          activeRoomId={currentGame.activeRoomId}
          onSelectRoom={handleOpenRoom}
          onOpenSaveModal={() => setIsSaveModalOpen(true)}
          onOpenRoomsPanel={() => setActiveDrawer('rooms')}
        />

        {/* Wheel Stage Area: Single Wheel OR Dual Wheels Side-by-Side */}
        <div className="w-full my-1 flex items-center justify-center">
          {isDual ? (
            /* DUAL WHEELS SIDE-BY-SIDE (HORIZONTAL IN THE SAME ROW ON DESKTOP/TABLET) */
            <div className="w-full max-w-[1600px] px-2 flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-10 xl:gap-14">
              {/* Wheel 1 */}
              <div className="flex flex-col items-center">
                <SpinWheelCanvas
                  wheelId="wheel-1"
                  title={currentGame.wheel1.title || 'Vòng 1'}
                  items={currentGame.wheel1.items}
                  rotationDeg={rot1}
                  isSpinning={isSpinning1}
                  winningIndex={winIndex1}
                  pointerKick={pointerKick1}
                  sizeVariant="compact"
                  onSpinClick={() => {
                    soundEngine.playSpinStart();
                    spinWheel1((item) => {
                      soundEngine.playWinnerFanfare();
                      setTimeout(() => setModalWinner1(item), 300);
                    });
                  }}
                  onAddFirstItem={() => {
                    handleAddItem('wheel-1');
                    handleAddItem('wheel-1');
                    setActiveWheelTab('wheel-1');
                    setActiveDrawer('editor');
                  }}
                  onSlotClick={(idx) => handleOpenSlotImageModal('wheel-1', idx)}
                  onOpenChangeImages={() => handleOpenSlotImageModal('wheel-1', 0)}
                  onOpenCsvImport={() => handleOpenCsvImport('wheel-1')}
                  onOpenPairMatching={() => setIsPairMatchingOpen(true)}
                  dualSpinMode={currentGame.settings.dualSpinMode}
                  showIndividualSpinButton
                />
              </div>

              {/* Wheel 2 (Side-by-side with Wheel 1) */}
              <div className="flex flex-col items-center">
                <SpinWheelCanvas
                  wheelId="wheel-2"
                  title={currentGame.wheel2.title || 'Vòng 2'}
                  items={currentGame.wheel2.items}
                  rotationDeg={rot2}
                  isSpinning={isSpinning2}
                  winningIndex={winIndex2}
                  pointerKick={pointerKick2}
                  sizeVariant="compact"
                  onSpinClick={() => {
                    soundEngine.playSpinStart();
                    spinWheel2((item) => {
                      soundEngine.playWinnerFanfare();
                      setTimeout(() => setModalWinner2(item), 300);
                    });
                  }}
                  onAddFirstItem={() => {
                    handleAddItem('wheel-2');
                    handleAddItem('wheel-2');
                    setActiveWheelTab('wheel-2');
                    setActiveDrawer('editor');
                  }}
                  onSlotClick={(idx) => handleOpenSlotImageModal('wheel-2', idx)}
                  onOpenChangeImages={() => handleOpenSlotImageModal('wheel-2', 0)}
                  onOpenCsvImport={() => handleOpenCsvImport('wheel-2')}
                  onOpenPairMatching={() => setIsPairMatchingOpen(true)}
                  dualSpinMode={currentGame.settings.dualSpinMode}
                  showIndividualSpinButton
                />
              </div>
            </div>
          ) : (
            /* SINGLE WHEEL (CENTERED) */
            <div className="flex flex-col items-center">
              <SpinWheelCanvas
                wheelId="wheel-1"
                title={currentGame.wheel1.title || ''}
                items={currentGame.wheel1.items}
                rotationDeg={rot1}
                isSpinning={isSpinning1}
                winningIndex={winIndex1}
                pointerKick={pointerKick1}
                sizeVariant="normal"
                onSpinClick={handleSpinMaster}
                onAddFirstItem={() => {
                  handleAddItem('wheel-1');
                  handleAddItem('wheel-1');
                  setActiveWheelTab('wheel-1');
                  setActiveDrawer('editor');
                }}
                onSlotClick={(idx) => handleOpenSlotImageModal('wheel-1', idx)}
                onOpenChangeImages={() => handleOpenSlotImageModal('wheel-1', 0)}
                onOpenCsvImport={() => handleOpenCsvImport('wheel-1')}
              />
            </div>
          )}
        </div>

        {/* Central Controls: Master SPIN button & Modes */}
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-3 mt-1">
          {/* Dual Wheel 2-Mode Selector (Quay Ngẫu Nhiên vs Quay Theo Cặp Hợp Lý) */}
          {isDual && (
            <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xs rounded-2xl border-2 sm:border-3 border-amber-300 shadow-md p-3 sm:p-4 animate-pop-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* 2 Mode Toggle Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wide shrink-0">
                    Chế độ:
                  </span>
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs w-full sm:w-auto">
                    <button
                      type="button"
                      disabled={anySpinning}
                      onClick={() => handleUpdateSettings({ dualSpinMode: 'random' })}
                      className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg font-display text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        currentGame.settings.dualSpinMode !== 'matched'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>🎲 Ngẫu Nhiên</span>
                    </button>

                    <button
                      type="button"
                      disabled={anySpinning}
                      onClick={() => handleUpdateSettings({ dualSpinMode: 'matched' })}
                      className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg font-display text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        currentGame.settings.dualSpinMode === 'matched'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>SẮP XẾP CẶP THEO Ý MUỐN</span>
                    </button>
                  </div>
                </div>

                {/* Setup Pairs Button */}
                <button
                  type="button"
                  disabled={anySpinning}
                  onClick={() => setIsPairMatchingOpen(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>
                    Cài đặt cặp (
                    {
                      currentGame.wheel1.items.filter(
                        (w1) => Boolean(currentGame.matchedPairs?.[w1.id]?.length)
                      ).length
                    }
                    /{currentGame.wheel1.items.length})
                  </span>
                </button>
              </div>

              {/* Explanatory description banner */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {currentGame.settings.dualSpinMode === 'matched' ? (
                  <p className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    <span>
                      Đang bật <strong>Sắp xếp cặp theo ý muốn</strong>: Vòng 2 sẽ tự động quay đúng hình/nơi tương ứng với Vòng 1.
                    </span>
                  </p>
                ) : (
                  <p className="text-blue-800 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    <span>
                      Đang bật <strong>Quay ngẫu nhiên</strong>: Cả 2 vòng xoay quay ngẫu nhiên độc lập tự do.
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Main SPIN Button */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              disabled={!canSpinMaster}
              onClick={handleSpinMaster}
              className={`inline-flex items-center justify-center gap-3 px-12 sm:px-16 py-3.5 sm:py-4 rounded-2xl font-display text-2xl sm:text-3xl font-bold tracking-wide shadow-lg transition-all whitespace-nowrap ${
                canSpinMaster
                  ? currentGame.settings.dualSpinMode === 'matched' && isDual
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white active:scale-95 cursor-pointer shadow-emerald-500/20'
                    : 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
              <span>
                {anySpinning
                  ? 'SPINNING...'
                  : isDual
                  ? 'SPIN BOTH WHEELS'
                  : 'SPIN'}
              </span>
            </button>

            {!canSpinMaster && !anySpinning && (
              <p className="mt-2 text-xs sm:text-sm font-semibold text-amber-700">
                {isDual
                  ? 'Both wheels need at least 2 items to spin together.'
                  : 'Please add at least 2 items to spin the wheel.'}
              </p>
            )}
          </div>

          {/* Multiple Spin Modes: [1 ROUND] [2 ROUNDS] [3 ROUNDS] */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <div
              role="group"
              aria-label="Select spin rounds"
              className="inline-flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs"
            >
              {([1, 2, 3] as const).map((r) => {
                const active = currentGame.settings.rounds === r;
                return (
                  <button
                    key={r}
                    type="button"
                    disabled={anySpinning}
                    onClick={() => handleUpdateSettings({ rounds: r })}
                    className={`px-4 sm:px-5 py-1.5 rounded-xl font-display text-xs sm:text-sm font-bold transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 ${
                      active
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {r === 1 ? '1 ROUND' : `${r} ROUNDS`}
                  </button>
                );
              })}
            </div>

            {/* Quick Sections selector */}
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
              <label
                htmlFor="quick-sections-select"
                className="text-xs font-semibold text-slate-600 whitespace-nowrap"
              >
                {isDual ? 'Wheel 1 Count:' : 'Sections:'}
              </label>
              <select
                id="quick-sections-select"
                disabled={anySpinning}
                value={
                  SECTION_COUNT_PRESETS.includes(
                    currentGame.wheel1.items.length as (typeof SECTION_COUNT_PRESETS)[number]
                  )
                    ? String(currentGame.wheel1.items.length)
                    : 'custom'
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setActiveWheelTab('wheel-1');
                    setActiveDrawer('editor');
                  } else {
                    handleSetSectionCount('wheel-1', Number(val));
                  }
                }}
                className="text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {SECTION_COUNT_PRESETS.map((n) => (
                  <option key={n} value={String(n)}>
                    {n} sections
                  </option>
                ))}
                <option value="custom">Custom ({currentGame.wheel1.items.length})</option>
              </select>
            </div>
          </div>

          {/* Bottom Toolbar */}
          <div className="w-full pt-1 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleUpdateSettings({
                  soundEnabled: !currentGame.settings.soundEnabled,
                })
              }
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              {currentGame.settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {currentGame.settings.soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveWheelTab('wheel-1');
                setActiveDrawer('editor');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Settings className="w-4 h-4 text-blue-600" />
              <span>⚙ Wheel Editor</span>
            </button>

            {/* Quick Change Images Button */}
            <button
              type="button"
              onClick={() => handleOpenSlotImageModal(activeWheelTab, 0)}
              title="Thay ảnh vào từng ô của vòng xoay"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>🖼️ Đổi ảnh các ô</span>
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Thu nhỏ màn hình (Esc)' : 'Mở toàn màn hình (F11)'}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isFullscreen
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-800'
              }`}
            >
              {isFullscreen ? (
                <>
                  <Minimize className="w-4 h-4 text-indigo-600" />
                  <span>Thu nhỏ</span>
                </>
              ) : (
                <>
                  <Maximize className="w-4 h-4 text-indigo-600" />
                  <span>Toàn màn hình</span>
                </>
              )}
            </button>

            {/* Save Class Primary Action */}
            <button
              type="button"
              onClick={() => setIsSaveModalOpen(true)}
              title={`Save class "${currentGame.roomName}" and created wheel data`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>SAVE CLASS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDrawer('rooms')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <FolderOpen className="w-4 h-4 text-amber-600" />
              <span>📁 My Classes ({savedRooms.length})</span>
            </button>

            <button
              type="button"
              onClick={() => exportRoomToJson(currentGame)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>EXPORT</span>
            </button>

            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>IMPORT</span>
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        const imp = parseImportedRoomJson(reader.result as string);
                        handleImportRoom(imp);
                        showToast(`Imported room "${imp.roomName}"!`);
                      } catch (err) {
                        showToast(err instanceof Error ? err.message : 'Invalid JSON room file.');
                      }
                    };
                    reader.readAsText(file);
                  }
                  e.target.value = '';
                }}
              />
            </label>

            <button
              type="button"
              disabled={anySpinning}
              onClick={() => setConfirmResetOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 text-slate-600" />
              <span>RESET</span>
            </button>
          </div>
        </div>
      </main>

      {/* Slide-in Wheel Editor Panel */}
      <WheelEditorPanel
        isOpen={activeDrawer === 'editor'}
        onClose={() => setActiveDrawer('none')}
        wheelMode={currentGame.mode}
        activeWheelTab={activeWheelTab}
        onChangeWheelTab={setActiveWheelTab}
        wheel1={currentGame.wheel1}
        wheel2={currentGame.wheel2}
        settings={currentGame.settings}
        activeRoomName={currentGame.roomName}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenSlotImageModal={(wId, idx) => handleOpenSlotImageModal(wId, idx)}
        onOpenPairMatchingModal={() => setIsPairMatchingOpen(true)}
        onOpenCsvImport={handleOpenCsvImport}
        onUpdateSettings={handleUpdateSettings}
        onUpdateWheelTitle={handleUpdateWheelTitle}
        onSetSectionCount={handleSetSectionCount}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onMoveItem={handleMoveItem}
        onResetHistory={handleResetHistory}
        onRequestClearAll={(target) => {
          setClearAllTarget(target);
          setConfirmClearAllOpen(true);
        }}
      />

      {/* Slide-in My Rooms & Classes Panel */}
      <RoomsModal
        isOpen={activeDrawer === 'rooms'}
        onClose={() => setActiveDrawer('none')}
        currentGame={currentGame}
        savedRooms={savedRooms}
        onOpenRoom={handleOpenRoom}
        onCreateNewRoom={handleCreateNewRoom}
        onUpdateActiveRoom={handleUpdateActiveRoom}
        onRenameRoom={handleRenameRoom}
        onDuplicateRoom={handleDuplicateRoom}
        onRequestDeleteRoom={(room) => setRoomToDelete(room)}
        onImportRoom={handleImportRoom}
        onImportMultipleRooms={handleImportMultipleRooms}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onCreateBlankClass={handleCreateBlankClass}
      />

      {/* Dedicated Save Class & Wheel Data Modal */}
      <SaveClassModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentGame={currentGame}
        savedRooms={savedRooms}
        onSaveClass={handleSaveClass}
      />

      {/* Dedicated Slot Image & Content Customizer Modal */}
      <SlotImageModal
        isOpen={slotImageModal.isOpen}
        onClose={handleCloseSlotImageModal}
        wheelId={slotImageModal.wheelId}
        wheelTitle={
          currentGame[slotImageModal.wheelId === 'wheel-1' ? 'wheel1' : 'wheel2'].title ||
          (slotImageModal.wheelId === 'wheel-1' ? 'Vòng 1' : 'Vòng 2')
        }
        items={currentGame[slotImageModal.wheelId === 'wheel-1' ? 'wheel1' : 'wheel2'].items}
        currentIndex={slotImageModal.slotIndex}
        onSelectIndex={(idx) =>
          setSlotImageModal((prev) => ({ ...prev, slotIndex: idx }))
        }
        onUpdateItem={handleUpdateItem}
      />

      {/* Pair Matching Modal for Dual Wheels */}
      <PairMatchingModal
        isOpen={isPairMatchingOpen}
        onClose={() => setIsPairMatchingOpen(false)}
        wheel1Title={currentGame.wheel1.title || 'Vòng 1'}
        wheel2Title={currentGame.wheel2.title || 'Vòng 2'}
        wheel1Items={currentGame.wheel1.items}
        wheel2Items={currentGame.wheel2.items}
        matchedPairs={currentGame.matchedPairs || {}}
        onSaveMatchedPairs={handleUpdateMatchedPairs}
        dualSpinMode={currentGame.settings.dualSpinMode || 'random'}
        onChangeDualSpinMode={(mode) => handleUpdateSettings({ dualSpinMode: mode })}
      />

      {/* Bulk CSV / Excel Import Modal */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        wheelMode={currentGame.mode}
        wheel1Title={currentGame.wheel1.title || 'Vòng 1'}
        wheel2Title={currentGame.wheel2.title || 'Vòng 2'}
        wheel1Count={currentGame.wheel1.items.length}
        wheel2Count={currentGame.wheel2.items.length}
        initialTargetWheel={csvTargetWheel}
        onImportItems={handleImportCsvItems}
      />

      {/* Celebration Winner Modal (Single or Dual) */}
      <WinnerModal
        winner1={modalWinner1}
        winner2={modalWinner2}
        wheel1Title={currentGame.wheel1.title || 'Wheel 1'}
        wheel2Title={currentGame.wheel2.title || 'Wheel 2'}
        isDual={isDual && Boolean(modalWinner2)}
        question={currentGame.question}
        dualSpinMode={currentGame.settings.dualSpinMode}
        isMatchedPair={isPairMatching(
          modalWinner1,
          modalWinner2,
          currentGame.wheel2.items,
          currentGame.matchedPairs
        )}
        onClose={() => {
          setModalWinner1(null);
          setModalWinner2(null);
        }}
        onSpinAgain={() => {
          setModalWinner1(null);
          setModalWinner2(null);
          setTimeout(() => handleSpinMaster(), 60);
        }}
      />

      {/* Delete Room Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(roomToDelete)}
        title="Delete Saved Room"
        message="Are you sure you want to delete this room?"
        confirmLabel="DELETE"
        cancelLabel="CANCEL"
        variant="danger"
        onConfirm={handleConfirmDeleteRoom}
        onCancel={() => setRoomToDelete(null)}
      />

      {/* Reset Current Game Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        title="Reset Current Wheels"
        message="Reset the wheel rotation, spin history, and active edits back to the saved room state? Your saved rooms will not be deleted."
        confirmLabel="RESET WHEELS"
        cancelLabel="CANCEL"
        variant="warning"
        onConfirm={handleConfirmResetGame}
        onCancel={() => setConfirmResetOpen(false)}
      />

      {/* Clear All Items in Selected Wheel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmClearAllOpen}
        title="Clear Wheel Items"
        message={`Are you sure you want to remove all items from ${
          currentGame[clearAllTarget === 'wheel-1' ? 'wheel1' : 'wheel2'].title || clearAllTarget
        }? Your saved rooms will remain safe.`}
        confirmLabel="CLEAR ITEMS"
        cancelLabel="CANCEL"
        variant="danger"
        onConfirm={handleConfirmClearAll}
        onCancel={() => setConfirmClearAllOpen(false)}
      />
    </div>
  );
}
