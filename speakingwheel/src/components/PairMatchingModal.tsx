import React, { useState, useEffect } from 'react';
import {
  X,
  Link2,
  Shuffle,
  Sparkles,
  Check,
  CheckCircle2,
  Trash2,
  Zap,
  Info,
} from 'lucide-react';
import { WheelItem, DualSpinMode } from '../types/game';
import { suggestSmartPairs, autoPairByOrder } from '../utils/pairMatching';

interface PairMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  wheel1Title: string;
  wheel2Title: string;
  wheel1Items: WheelItem[];
  wheel2Items: WheelItem[];
  matchedPairs: Record<string, string[]>;
  onSaveMatchedPairs: (pairs: Record<string, string[]>) => void;
  dualSpinMode: DualSpinMode;
  onChangeDualSpinMode: (mode: DualSpinMode) => void;
}

export const PairMatchingModal: React.FC<PairMatchingModalProps> = ({
  isOpen,
  onClose,
  wheel1Title,
  wheel2Title,
  wheel1Items,
  wheel2Items,
  matchedPairs,
  onSaveMatchedPairs,
  dualSpinMode,
  onChangeDualSpinMode,
}) => {
  const [localPairs, setLocalPairs] = useState<Record<string, string[]>>({});
  const [localMode, setLocalMode] = useState<DualSpinMode>(dualSpinMode);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLocalPairs(matchedPairs ? { ...matchedPairs } : {});
      setLocalMode(dualSpinMode);
      setStatusNotice(null);
    }
  }, [isOpen, matchedPairs, dualSpinMode]);

  if (!isOpen) return null;

  // Toggle pairing between item1 and item2
  const handleTogglePair = (item1Id: string, item2Id: string) => {
    setLocalPairs((prev) => {
      const currentTargets = prev[item1Id] || [];
      const exists = currentTargets.includes(item2Id);
      const updatedTargets = exists
        ? currentTargets.filter((id) => id !== item2Id)
        : [...currentTargets, item2Id];

      return {
        ...prev,
        [item1Id]: updatedTargets,
      };
    });
  };

  // Select all items of wheel2 for item1
  const handleSelectAllFor = (item1Id: string) => {
    setLocalPairs((prev) => ({
      ...prev,
      [item1Id]: wheel2Items.map((w2) => w2.id),
    }));
  };

  // Clear all selections for item1
  const handleClearFor = (item1Id: string) => {
    setLocalPairs((prev) => {
      const copy = { ...prev };
      delete copy[item1Id];
      return copy;
    });
  };

  // Smart suggestion
  const handleApplySmartSuggestions = () => {
    const suggested = suggestSmartPairs(wheel1Items, wheel2Items);
    setLocalPairs(suggested);
    setStatusNotice('Đã áp dụng gợi ý cặp ghép thông minh theo ngữ nghĩa hoạt động & địa điểm!');
  };

  // Auto 1-to-1 order
  const handleApplyOrderAutoPair = () => {
    const ordered = autoPairByOrder(wheel1Items, wheel2Items);
    setLocalPairs(ordered);
    setStatusNotice('Đã ghép tự động 1-1 theo thứ tự các ô!');
  };

  // Clear all
  const handleClearAllPairs = () => {
    setLocalPairs({});
    setStatusNotice('Đã xóa tất cả các cặp liên kết.');
  };

  const handleSaveAndClose = (activateMatched = false) => {
    onSaveMatchedPairs(localPairs);
    if (activateMatched) {
      onChangeDualSpinMode('matched');
    } else {
      onChangeDualSpinMode(localMode);
    }
    onClose();
  };

  // Count how many items in wheel 1 have at least one paired item in wheel 2
  const pairedCount = wheel1Items.filter(
    (w1) => (localPairs[w1.id] && localPairs[w1.id].length > 0)
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-50 w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl border-2 sm:border-4 border-amber-300 overflow-hidden animate-pop-in">
        {/* Header */}
        <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-amber-50/80 via-white to-blue-50/80 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-amber-500 text-white shadow-xs">
                <Link2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <div>
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-black text-slate-900">
                  SẮP XẾP CẶP THEO Ý MUỐN
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Ghép từng ô của <strong className="text-blue-700">{wheel1Title || 'Vòng 1'}</strong> với hình phù hợp của <strong className="text-amber-700">{wheel2Title || 'Vòng 2'}</strong>
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Selector & Quick Actions Strip */}
        <div className="px-5 sm:px-8 py-3.5 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Dual Spin Mode Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Chế độ quay:
            </span>
            <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setLocalMode('random')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  localMode === 'random'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>🎲 Ngẫu Nhiên</span>
              </button>

              <button
                type="button"
                onClick={() => setLocalMode('matched')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  localMode === 'matched'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>SẮP XẾP CẶP THEO Ý MUỐN</span>
              </button>
            </div>
          </div>

          {/* Quick Helper Actions */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleApplySmartSuggestions}
              title="Tự động nhận diện từ khóa (Cooking ➔ Kitchen, Eating ➔ Dining Room...)"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all cursor-pointer border border-amber-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>✨ Gợi ý thông minh</span>
            </button>

            <button
              type="button"
              onClick={handleApplyOrderAutoPair}
              title="Ghép 1-1 theo thứ tự từ trên xuống"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>⚡ Ghép 1-1</span>
            </button>

            <button
              type="button"
              onClick={handleClearAllPairs}
              title="Xóa tất cả các cặp ghép"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Xóa hết</span>
            </button>
          </div>
        </div>

        {/* Notice banner if any */}
        {statusNotice && (
          <div className="px-6 py-2 bg-emerald-50 text-emerald-800 text-xs font-semibold border-b border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Explanation Note */}
        <div className="px-6 py-2.5 bg-blue-50/60 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-900 font-medium">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Cách thức hoạt động:</strong> Nhấp vào các ô của <span className="font-bold">{wheel2Title}</span> để chọn ghép với từng ô của <span className="font-bold">{wheel1Title}</span>. Bạn có thể chọn 1 hoặc nhiều ô hợp lý!
          </span>
        </div>

        {/* Main Mapping List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {wheel1Items.length === 0 || wheel2Items.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-semibold">
              Cả 2 vòng xoay cần có ít nhất 1 ô để thực hiện ghép đôi.
            </div>
          ) : (
            wheel1Items.map((item1, idx1) => {
              const selectedTargets = localPairs[item1.id] || [];
              const hasPair = selectedTargets.length > 0;

              return (
                <div
                  key={item1.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    hasPair
                      ? 'bg-white border-emerald-300 shadow-xs'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Left: Wheel 1 Item Display */}
                    <div className="flex items-center gap-3 shrink-0 lg:w-64">
                      <div className="text-xs font-black text-slate-400 w-6">
                        #{idx1 + 1}
                      </div>

                      {/* Item thumbnail */}
                      <div
                        className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center border-2 border-slate-200 bg-white p-1 shrink-0 shadow-inner"
                        style={{ borderColor: item1.color }}
                      >
                        {item1.image ? (
                          <img
                            src={item1.image}
                            alt={item1.text}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-2xl">{item1.emoji || '⭐'}</span>
                        )}
                      </div>

                      <div className="truncate">
                        <div className="font-display text-base font-black text-slate-900 truncate">
                          {item1.text || `Ô ${idx1 + 1}`}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500">
                          {wheel1Title}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Arrow indicator */}
                    <div className="hidden lg:flex items-center text-slate-400 shrink-0 px-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-lg">
                        Ghép với ➔
                      </span>
                    </div>

                    {/* Right: Wheel 2 Candidates Chips */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-600">
                          Chọn các ô hợp lý của {wheel2Title}:
                        </span>
                        <div className="flex items-center gap-2 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleSelectAllFor(item1.id)}
                            className="text-blue-600 hover:underline font-semibold cursor-pointer"
                          >
                            Chọn tất cả
                          </button>
                          <span className="text-slate-300">·</span>
                          <button
                            type="button"
                            onClick={() => handleClearFor(item1.id)}
                            className="text-slate-500 hover:text-red-600 font-semibold cursor-pointer"
                          >
                            Bỏ chọn
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {wheel2Items.map((item2) => {
                          const isSelected = selectedTargets.includes(item2.id);

                          return (
                            <button
                              key={item2.id}
                              type="button"
                              onClick={() => handleTogglePair(item1.id, item2.id)}
                              className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                              }`}
                            >
                              {/* Thumbnail */}
                              <div
                                className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center border border-black/10 shrink-0 bg-white"
                                style={{ backgroundColor: item2.color }}
                              >
                                {item2.image ? (
                                  <img
                                    src={item2.image}
                                    alt={item2.text}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs">{item2.emoji || '⭐'}</span>
                                )}
                              </div>

                              <span className="max-w-[120px] sm:max-w-[160px] truncate">
                                {item2.text}
                              </span>

                              {isSelected ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                              ) : (
                                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 group-hover:border-blue-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Status hint for this item */}
                      <div className="mt-1.5 text-[11px]">
                        {hasPair ? (
                          <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Đã ghép {selectedTargets.length} ô hợp lý
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">
                            Chưa ghép cụ thể (sẽ quay ngẫu nhiên nếu vòng 1 vào ô này)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-8 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-semibold text-center sm:text-left">
            <span>Tiến độ ghép: </span>
            <strong className="text-slate-900 font-black">
              {pairedCount}/{wheel1Items.length} ô
            </strong>{' '}
            của Vòng 1 đã được cài đặt cặp.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndClose(false)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              Lưu Cặp Ghép
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndClose(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Lưu & Bật Sắp Xếp Cặp Theo Ý Muốn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
