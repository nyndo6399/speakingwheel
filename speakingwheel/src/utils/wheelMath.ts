import { WheelItem } from '../types/game';

export function selectRandomWinner(
  items: WheelItem[],
  avoidRepeat: boolean,
  selectedHistoryIds: string[],
  lastWinnerId: string | null
): {
  winningIndex: number;
  winningItem: WheelItem;
  updatedHistoryIds: string[];
  historyWasReset: boolean;
} {
  if (items.length === 0) {
    throw new Error('Cannot select a winner from an empty wheel.');
  }
  if (items.length === 1) {
    return {
      winningIndex: 0,
      winningItem: items[0],
      updatedHistoryIds: [items[0].id],
      historyWasReset: false,
    };
  }

  let historyWasReset = false;
  let activeHistory = [...selectedHistoryIds];

  if (avoidRepeat) {
    let remainingIndices = items
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => !activeHistory.includes(item.id));

    if (remainingIndices.length === 0) {
      activeHistory = [];
      historyWasReset = true;
      remainingIndices = items.map((item, idx) => ({ item, idx }));

      if (lastWinnerId && remainingIndices.length > 1) {
        const withoutLast = remainingIndices.filter(({ item }) => item.id !== lastWinnerId);
        if (withoutLast.length > 0) {
          remainingIndices = withoutLast;
        }
      }
    }

    const randomPick = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
    return {
      winningIndex: randomPick.idx,
      winningItem: randomPick.item,
      updatedHistoryIds: [...activeHistory, randomPick.item.id],
      historyWasReset,
    };
  } else {
    let candidateIndices = items.map((item, idx) => ({ item, idx }));
    if (lastWinnerId && candidateIndices.length > 1) {
      const filtered = candidateIndices.filter(({ item }) => item.id !== lastWinnerId);
      if (filtered.length > 0 && Math.random() < 0.85) {
        candidateIndices = filtered;
      }
    }

    const randomPick = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
    return {
      winningIndex: randomPick.idx,
      winningItem: randomPick.item,
      updatedHistoryIds: activeHistory,
      historyWasReset: false,
    };
  }
}

export function calculateSpinRotation(
  currentRotationDeg: number,
  winningIndex: number,
  totalItems: number,
  rounds: 1 | 2 | 3
): {
  finalRotationDeg: number;
  deltaRotationDeg: number;
  sectionAngleDeg: number;
} {
  const sectionAngleDeg = 360 / totalItems;
  const winningCenterOnWheel = (winningIndex * sectionAngleDeg) % 360;
  const targetMod = (360 - winningCenterOnWheel) % 360;

  const currentMod = ((currentRotationDeg % 360) + 360) % 360;
  const additionalRotation = (targetMod - currentMod + 360) % 360;

  const deltaRotationDeg = rounds * 360 + additionalRotation;
  const finalRotationDeg = currentRotationDeg + deltaRotationDeg;

  return {
    finalRotationDeg,
    deltaRotationDeg,
    sectionAngleDeg,
  };
}

export function getSliceIndexAtRotation(rotationDeg: number, totalItems: number): number {
  if (totalItems <= 0) return 0;
  const sectionAngle = 360 / totalItems;
  const normalizedRotation = ((rotationDeg % 360) + 360) % 360;
  const pointerAngleOnWheel = (360 - normalizedRotation) % 360;
  const shifted = (pointerAngleOnWheel + sectionAngle / 2) % 360;
  return Math.floor(shifted / sectionAngle) % totalItems;
}

export function easeWheelSpin(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.pow(1 - t, 3.8);
}
