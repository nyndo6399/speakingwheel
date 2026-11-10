import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Upload,
  ImageOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Settings,
  Layers,
  Disc,
  Save,
  Camera,
  Image as ImageIcon,
  Link2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  SECTION_COUNT_PRESETS,
  WHEEL_COLOR_PALETTE,
  WheelConfig,
  WheelItem,
  WheelSettings,
} from '../types/game';
import { processUploadedImageFile } from '../utils/storage';

interface WheelEditorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  wheelMode: 'single' | 'dual';
  activeWheelTab: 'wheel-1' | 'wheel-2';
  onChangeWheelTab: (tab: 'wheel-1' | 'wheel-2') => void;
  wheel1: WheelConfig;
  wheel2: WheelConfig;
  settings: WheelSettings;
  activeRoomName?: string;
  onOpenSaveModal?: () => void;
  onOpenSlotImageModal?: (wheelId: 'wheel-1' | 'wheel-2', index: number) => void;
  onOpenPairMatchingModal?: () => void;
  onOpenCsvImport?: (wheelId: 'wheel-1' | 'wheel-2') => void;
  onUpdateSettings: (partial: Partial<WheelSettings>) => void;
  onUpdateWheelTitle: (wheelId: 'wheel-1' | 'wheel-2', title: string) => void;
  onSetSectionCount: (wheelId: 'wheel-1' | 'wheel-2', count: number) => void;
  onAddItem: (wheelId: 'wheel-1' | 'wheel-2') => void;
  onUpdateItem: (wheelId: 'wheel-1' | 'wheel-2', itemId: string, partial: Partial<WheelItem>) => void;
  onDeleteItem: (wheelId: 'wheel-1' | 'wheel-2', itemId: string) => void;
  onMoveItem: (wheelId: 'wheel-1' | 'wheel-2', index: number, direction: 'up' | 'down') => void;
  onResetHistory: (wheelId: 'wheel-1' | 'wheel-2') => void;
  onRequestClearAll: (wheelId: 'wheel-1' | 'wheel-2') => void;
}

export const WheelEditorPanel: React.FC<WheelEditorPanelProps> = ({
  isOpen,
  onClose,
  wheelMode,
  activeWheelTab,
  onChangeWheelTab,
  wheel1,
  wheel2,
  settings,
  activeRoomName,
  onOpenSaveModal,
  onOpenSlotImageModal,
  onOpenPairMatchingModal,
  onOpenCsvImport,
  onUpdateSettings,
  onUpdateWheelTitle,
  onSetSectionCount,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onMoveItem,
  onResetHistory,
  onRequestClearAll,
}) => {
  const currentWheel = activeWheelTab === 'wheel-1' ? wheel1 : wheel2;
  const [customCountInput, setCustomCountInput] = useState<string>(String(currentWheel.items.length || 6));
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = async (itemId: string, file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    try {
      const dataUrl = await processUploadedImageFile(file);
      onUpdateItem(activeWheelTab, itemId, { image: dataUrl });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not upload image.');
    }
  };

  const isPresetCount = SECTION_COUNT_PRESETS.includes(
    currentWheel.items.length as (typeof SECTION_COUNT_PRESETS)[number]
  );

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <aside
        aria-label="Wheel Settings and Item Editor"
        className="relative z-50 w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden"
      >
        {/* Panel Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="font-display text-xl font-bold text-slate-900">
              Wheel Settings & Editor
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Wheel Editor"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Class Quick-Save Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 text-xs shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-blue-900 truncate">
            <span>Class:</span>
            <span className="font-bold underline truncate max-w-[200px]">
              {activeRoomName || 'Active Classroom'}
            </span>
          </div>
          {onOpenSaveModal && (
            <button
              type="button"
              onClick={onOpenSaveModal}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Class</span>
            </button>
          )}
        </div>

        {/* Dual Wheel Tabs Switcher (when in dual wheel mode) */}
        {wheelMode === 'dual' && (
          <div className="flex border-b border-slate-200 bg-slate-100/70 p-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onChangeWheelTab('wheel-1');
                setCustomCountInput(String(wheel1.items.length || 6));
              }}
              className={`flex-1 py-2 px-3 rounded-xl font-display text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeWheelTab === 'wheel-1'
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Disc className="w-3.5 h-3.5 text-blue-600" />
              <span>Wheel 1: {wheel1.title || 'Left Wheel'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onChangeWheelTab('wheel-2');
                setCustomCountInput(String(wheel2.items.length || 6));
              }}
              className={`flex-1 py-2 px-3 rounded-xl font-display text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeWheelTab === 'wheel-2'
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Disc className="w-3.5 h-3.5 text-amber-600" />
              <span>Wheel 2: {wheel2.title || 'Right Wheel'}</span>
            </button>
          </div>
        )}

        {/* Dual Wheel Paired Mode Shortcut Banner */}
        {wheelMode === 'dual' && onOpenPairMatchingModal && (
          <div className="mx-4 mt-2 mb-1 p-2.5 rounded-2xl bg-amber-50/90 border border-amber-300 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-500 text-white shadow-2xs">
                <Link2 className="w-3.5 h-3.5" />
              </span>
              <div>
                <div className="text-xs font-black text-amber-950">
                  {settings.dualSpinMode === 'matched'
                    ? 'Chế độ: 🔗 Sắp Xếp Cặp Theo Ý Muốn (Đang BẬT)'
                    : 'Chế độ: 🎲 Quay Ngẫu Nhiên'}
                </div>
                <div className="text-[11px] text-amber-800 font-medium">
                  {settings.dualSpinMode === 'matched'
                    ? 'Vòng 2 tự động quay đúng hình đã ghép với Vòng 1'
                    : '2 vòng quay độc lập tự do'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenPairMatchingModal}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap active:scale-95"
            >
              Cài cặp ➔
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7">
          {/* SECTION 1: WHEEL SETTINGS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-display text-lg font-bold text-slate-900">
                1. {wheelMode === 'dual' ? `${currentWheel.title} Settings` : 'Wheel Settings'}
              </h3>
              <span className="text-xs text-slate-500 tabular-nums">
                Active Sections: {currentWheel.items.length}
              </span>
            </div>

            {/* Editable Wheel Title */}
            <div>
              <label
                htmlFor="wheel-title-input"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Wheel Label / Title
              </label>
              <input
                id="wheel-title-input"
                type="text"
                value={currentWheel.title}
                onChange={(e) => onUpdateWheelTitle(activeWheelTab, e.target.value)}
                placeholder="e.g. Student Name, Animal, Subject..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Number of Sections Preset */}
              <div>
                <label
                  htmlFor="section-count-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Number of sections
                </label>
                <select
                  id="section-count-select"
                  value={isPresetCount ? String(currentWheel.items.length) : 'custom'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== 'custom') {
                      const num = parseInt(val, 10);
                      setCustomCountInput(String(num));
                      onSetSectionCount(activeWheelTab, num);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {SECTION_COUNT_PRESETS.map((num) => (
                    <option key={num} value={String(num)}>
                      {num} sections
                    </option>
                  ))}
                  <option value="custom">Custom count ({currentWheel.items.length})</option>
                </select>
              </div>

              {/* Custom Number Input */}
              <div>
                <label
                  htmlFor="custom-section-count"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Custom count (2–30)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="custom-section-count"
                    type="number"
                    min={2}
                    max={30}
                    value={customCountInput}
                    onChange={(e) => setCustomCountInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 tabular-nums focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = parseInt(customCountInput, 10);
                      if (!Number.isNaN(parsed)) {
                        const clamped = Math.max(2, Math.min(30, parsed));
                        setCustomCountInput(String(clamped));
                        onSetSectionCount(activeWheelTab, clamped);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Spin Duration */}
              <div>
                <label
                  htmlFor="spin-duration-select"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Spin duration
                </label>
                <select
                  id="spin-duration-select"
                  value={settings.spinDuration}
                  onChange={(e) =>
                    onUpdateSettings({
                      spinDuration: Number(e.target.value) as 3 | 4 | 5,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value={3}>3 seconds (Fast)</option>
                  <option value={4}>4 seconds (Standard)</option>
                  <option value={5}>5 seconds (Suspenseful)</option>
                </select>
              </div>

              {/* Spin Rounds */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Spin rounds
                </span>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {([1, 2, 3] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onUpdateSettings({ rounds: r })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        settings.rounds === r
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {r} {r === 1 ? 'ROUND' : 'ROUNDS'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Avoid Repeat */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.avoidRepeat}
                  onChange={(e) => onUpdateSettings({ avoidRepeat: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-900 block">
                    Avoid Repeat
                  </span>
                  <span className="text-xs text-slate-500 block">
                    Do not select the same item twice until all items are picked ({currentWheel.selectedHistoryIds.length}/{currentWheel.items.length} picked)
                  </span>
                </div>
              </label>

              <button
                type="button"
                onClick={() => onResetHistory(activeWheelTab)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset History</span>
              </button>
            </div>
          </section>

          {/* SECTION 2: ITEM EDITOR */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="font-display text-lg font-bold text-slate-900">
                  2. Items for {currentWheel.title || activeWheelTab}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {onOpenCsvImport && (
                  <button
                    type="button"
                    onClick={() => onOpenCsvImport(activeWheelTab)}
                    title="Nhập danh sách từ và ảnh đồng loạt từ file CSV hoặc Excel"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nhập CSV</span>
                  </button>
                )}
                {currentWheel.items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onRequestClearAll(activeWheelTab)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>CLEAR ALL</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onAddItem(activeWheelTab)}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ ADD ITEM</span>
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center justify-between">
                <span>{uploadError}</span>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="text-red-800 font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {currentWheel.items.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
                <p className="font-display text-lg font-bold text-slate-700 mb-1">
                  No items yet
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => onAddItem(activeWheelTab)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ ADD ITEM</span>
                  </button>
                  {onOpenCsvImport && (
                    <button
                      type="button"
                      onClick={() => onOpenCsvImport(activeWheelTab)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer shadow-xs"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Nhập từ file CSV</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {currentWheel.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 transition-colors hover:border-slate-300"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-display text-sm font-bold text-slate-800 tabular-nums">
                          ITEM {idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => onMoveItem(activeWheelTab, idx, 'up')}
                          title="Move item up"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === currentWheel.items.length - 1}
                          onClick={() => onMoveItem(activeWheelTab, idx, 'down')}
                          title="Move item down"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(activeWheelTab, item.id)}
                          title="Delete item"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Text
                        </label>
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) =>
                            onUpdateItem(activeWheelTab, item.id, { text: e.target.value })
                          }
                          placeholder={`Item ${idx + 1} text...`}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Emoji / Icon
                        </label>
                        <input
                          type="text"
                          value={item.emoji || ''}
                          onChange={(e) =>
                            onUpdateItem(activeWheelTab, item.id, { emoji: e.target.value })
                          }
                          placeholder="🍎"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-center focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                          Color
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={item.color}
                            onChange={(e) =>
                              onUpdateItem(activeWheelTab, item.id, { color: e.target.value })
                            }
                            className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                          />
                          <div className="flex flex-wrap gap-1">
                            {WHEEL_COLOR_PALETTE.slice(0, 4).map((swatch) => (
                              <button
                                key={swatch}
                                type="button"
                                onClick={() =>
                                  onUpdateItem(activeWheelTab, item.id, { color: swatch })
                                }
                                className="w-4 h-4 rounded-full border border-black/15 cursor-pointer"
                                style={{ backgroundColor: swatch }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Image Controls for Slot */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 bg-white p-2.5 rounded-xl border border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        {item.image ? (
                          <div className="relative group">
                            <img
                              src={item.image}
                              alt={item.text || `Item ${idx + 1}`}
                              referrerPolicy="no-referrer"
                              className="w-11 h-11 rounded-xl object-cover bg-slate-50 border border-slate-300 shadow-2xs shrink-0"
                            />
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />
                          </div>
                        ) : (
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 shrink-0"
                            style={{ backgroundColor: `${item.color}15` }}
                          >
                            <span>{item.emoji || '🖼️'}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Full Image Picker Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenSlotImageModal) {
                                onOpenSlotImageModal(activeWheelTab, idx);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{item.image ? 'Thay ảnh' : 'Chọn ảnh'}</span>
                          </button>

                          {/* Quick PC Upload */}
                          <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer transition-colors whitespace-nowrap">
                            <Upload className="w-3 h-3 text-slate-500" />
                            <span>Tải từ máy</span>
                            <input
                              type="file"
                              accept=".png,.jpg,.jpeg,.webp,.gif,.svg,image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                handleImageUpload(item.id, file);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {item.image && (
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateItem(activeWheelTab, item.id, { image: undefined })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <ImageOff className="w-3.5 h-3.5" />
                          <span>Xóa ảnh</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => onAddItem(activeWheelTab)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-display font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ ADD ITEM</span>
              </button>

              {onOpenSaveModal && (
                <button
                  type="button"
                  onClick={onOpenSaveModal}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE CLASS & WHEEL DATA</span>
                </button>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
};
