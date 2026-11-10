import React from 'react';
import { Volume2, VolumeX, Save, Disc, Maximize, Minimize, Download } from 'lucide-react';

interface TopBarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  wheelMode: 'single' | 'dual';
  onToggleWheelMode: (mode: 'single' | 'dual') => void;
  onOpenEditor: () => void;
  onOpenRooms: () => void;
  onResetGame: () => void;
  onQuickSaveRoom: () => void;
  onOpenSaveModal: () => void;
  onOpenDownloadModal?: () => void;
  currentClassName: string;
  activeDrawer: 'none' | 'editor' | 'rooms';
  onCloseDrawers: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  soundEnabled,
  onToggleSound,
  wheelMode,
  onToggleWheelMode,
  onOpenEditor,
  onOpenRooms,
  onResetGame,
  onQuickSaveRoom,
  onOpenSaveModal,
  onOpenDownloadModal,
  currentClassName,
  activeDrawer,
  onCloseDrawers,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#wheel-stage"
        onClick={(e) => {
          e.preventDefault();
          onCloseDrawers();
        }}
        className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900 hover:text-blue-600 transition-colors whitespace-nowrap"
      >
        SPEAKING WHEEL
      </a>

      {/* Zone 2: Clean navigation links */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
        <button
          type="button"
          onClick={onCloseDrawers}
          className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
            activeDrawer === 'none'
              ? 'text-blue-600 border-blue-600'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          Wheel Stage
        </button>
        <button
          type="button"
          onClick={onOpenEditor}
          className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
            activeDrawer === 'editor'
              ? 'text-blue-600 border-blue-600'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          Wheel Editor
        </button>
        <button
          type="button"
          onClick={onOpenRooms}
          className={`py-1 transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
            activeDrawer === 'rooms'
              ? 'text-blue-600 border-blue-600'
              : 'border-transparent hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          My Classes
        </button>
        <button
          type="button"
          onClick={onOpenSaveModal}
          className="py-1 border-b-2 border-transparent hover:text-emerald-700 hover:border-emerald-500 transition-colors whitespace-nowrap cursor-pointer text-emerald-600 font-bold flex items-center gap-1"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Class</span>
        </button>
        {onOpenDownloadModal && (
          <button
            type="button"
            onClick={onOpenDownloadModal}
            className="py-1 border-b-2 border-transparent hover:text-amber-600 hover:border-amber-500 transition-colors whitespace-nowrap cursor-pointer text-amber-700 font-bold flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Code / Game</span>
          </button>
        )}
        <button
          type="button"
          onClick={onResetGame}
          className="py-1 border-b-2 border-transparent hover:text-slate-900 hover:border-slate-300 transition-colors whitespace-nowrap cursor-pointer"
        >
          Reset Game
        </button>
      </nav>

      {/* Zone 3: Primary Actions (Single/Dual Mode, Sound, Save, Download) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Single / Dual Wheel Selector */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => onToggleWheelMode('single')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              wheelMode === 'single'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1 Wheel
          </button>
          <button
            type="button"
            onClick={() => onToggleWheelMode('dual')}
            title="Add a 2nd wheel placed side-by-side"
            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              wheelMode === 'dual'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>2 Wheels (Side-by-Side)</span>
          </button>
        </div>

        {/* Sound toggle */}
        <button
          type="button"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute classroom sound effects' : 'Unmute classroom sound effects'}
          aria-label={soundEnabled ? 'Sound ON' : 'Sound OFF'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
            soundEnabled
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Sound ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="hidden sm:inline">Sound OFF</span>
            </>
          )}
        </button>

        {/* Fullscreen toggle */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Thu nhỏ màn hình (Esc)' : 'Mở toàn màn hình (Full screen)'}
          aria-label={isFullscreen ? 'Thu nhỏ màn hình' : 'Mở toàn màn hình'}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 border cursor-pointer ${
            isFullscreen
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 shadow-xs'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          {isFullscreen ? (
            <>
              <Minimize className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline">Thu nhỏ</span>
            </>
          ) : (
            <>
              <Maximize className="w-4 h-4 text-slate-600 shrink-0" />
              <span className="hidden sm:inline">Toàn màn hình</span>
            </>
          )}
        </button>

        {/* Save Class */}
        <button
          type="button"
          onClick={onOpenSaveModal}
          title={`Save class "${currentClassName || 'Class'}" and all created wheel data`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95"
        >
          <Save className="w-3.5 h-3.5 shrink-0" />
          <span>Save Class</span>
        </button>

        {/* Tải Code / Game */}
        {onOpenDownloadModal && (
          <button
            type="button"
            onClick={onOpenDownloadModal}
            title="Tải toàn bộ file mã nguồn (.zip) hoặc game offline (.html) về máy tính"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95 border border-amber-500/30"
          >
            <Download className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            <span className="hidden sm:inline">Tải Code / Game</span>
            <span className="sm:hidden">Tải Code</span>
          </button>
        )}
      </div>
    </header>
  );
};
