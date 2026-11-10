import React, { useState } from 'react';
import {
  X,
  FolderOpen,
  PlusCircle,
  Download,
  Upload,
  Copy,
  Edit2,
  Trash2,
  Check,
  Save,
  Archive,
} from 'lucide-react';
import { CurrentGameState, RoomData } from '../types/game';
import {
  exportRoomToJson,
  exportAllRoomsToJson,
  parseImportedAllRoomsJson,
} from '../utils/storage';

interface RoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGame: CurrentGameState;
  savedRooms: RoomData[];
  onOpenRoom: (room: RoomData) => void;
  onCreateNewRoom: (roomName: string) => void;
  onUpdateActiveRoom: () => void;
  onRenameRoom: (roomId: string, newName: string) => void;
  onDuplicateRoom: (room: RoomData) => void;
  onRequestDeleteRoom: (room: RoomData) => void;
  onImportRoom: (room: RoomData) => void;
  onImportMultipleRooms?: (rooms: RoomData[]) => void;
  onOpenSaveModal?: () => void;
  onCreateBlankClass?: () => void;
}

export const RoomsModal: React.FC<RoomsModalProps> = ({
  isOpen,
  onClose,
  currentGame,
  savedRooms,
  onOpenRoom,
  onCreateNewRoom,
  onUpdateActiveRoom,
  onRenameRoom,
  onDuplicateRoom,
  onRequestDeleteRoom,
  onImportRoom,
  onImportMultipleRooms = () => {},
  onOpenSaveModal,
  onCreateBlankClass,
}) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const showTempBanner = (type: 'success' | 'error', text: string) => {
    setStatusBanner({ type, text });
    setTimeout(() => {
      setStatusBanner((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newRoomName.trim() || `Classroom Set ${savedRooms.length + 1}`;
    onCreateNewRoom(trimmed);
    setNewRoomName('');
    showTempBanner('success', `Saved new class "${trimmed}"!`);
  };

  const handleImportFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const importedList = parseImportedAllRoomsJson(reader.result as string);
        if (importedList.length === 1) {
          onImportRoom(importedList[0]);
          showTempBanner('success', `Imported class "${importedList[0].roomName}"!`);
        } else if (importedList.length > 1) {
          onImportMultipleRooms(importedList);
          showTempBanner('success', `Imported ${importedList.length} classes from backup!`);
        }
      } catch (err) {
        showTempBanner(
          'error',
          err instanceof Error ? err.message : 'Failed to import JSON file.'
        );
      }
    };
    reader.onerror = () => {
      showTempBanner('error', 'Failed to read file.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <aside
        aria-label="My Classes and Data Storage"
        className="relative z-50 w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            <h2 className="font-display text-xl font-bold text-slate-900">
              MY CLASSES & ROOMS
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Rooms Panel"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-7">
          {statusBanner && (
            <div
              className={`p-3.5 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-between ${
                statusBanner.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <span>{statusBanner.text}</span>
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                className="ml-2 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Current Active Class */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Active Class Data
              </h3>
              <span className="text-xs text-slate-500 font-semibold">
                {currentGame.mode === 'dual'
                  ? `2 Wheels (${currentGame.wheel1.items.length} + ${currentGame.wheel2.items.length} items)`
                  : `1 Wheel (${currentGame.wheel1.items.length} items)`}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    Current Class Name
                  </p>
                  <p className="font-display text-lg font-bold text-slate-900">
                    {currentGame.roomName || 'Unsaved Class'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateActiveRoom();
                    showTempBanner('success', `Saved changes to "${currentGame.roomName}"!`);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>

              <p className="text-xs text-slate-600">
                Question:{' '}
                <span className="font-semibold text-slate-900 whitespace-pre-line">
                  {currentGame.question || 'No question set'}
                </span>
              </p>

              <div className="pt-2 border-t border-blue-200/70 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => exportRoomToJson(currentGame)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export Active Class</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportAllRoomsToJson(savedRooms)}
                  title="Backup all classes in one file"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Archive className="w-3.5 h-3.5 text-purple-600" />
                  <span>Backup All Classes</span>
                </button>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap">
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Import JSON File</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleImportFile(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Create New Class Form */}
            <form
              onSubmit={handleCreateSubmit}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="new-room-name-input"
                  className="block font-display text-sm font-bold text-slate-800"
                >
                  Save Current Setup As New Class
                </label>
                {onOpenSaveModal && (
                  <button
                    type="button"
                    onClick={onOpenSaveModal}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                  >
                    Open Save Dialog...
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="new-room-name-input"
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. Class 3A - Unit 4"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Save New Class</span>
                </button>
              </div>

              {onCreateBlankClass && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Want to start fresh from scratch?</span>
                  <button
                    type="button"
                    onClick={onCreateBlankClass}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>+ New Blank Class</span>
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* Saved Classes List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-display text-lg font-bold text-slate-900">
                All Saved Classes ({savedRooms.length})
              </h3>
              <span className="text-xs text-slate-500 font-medium">Stored safely in browser</span>
            </div>

            <div className="space-y-3">
              {savedRooms.map((room) => {
                const isActive = currentGame.activeRoomId === room.id;
                const isRenaming = renamingId === room.id;

                return (
                  <div
                    key={room.id}
                    className={`p-4 rounded-2xl border transition-colors ${
                      isActive
                        ? 'bg-blue-50/50 border-blue-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                      {isRenaming ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-blue-400 text-sm font-bold text-slate-900 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (renameValue.trim()) {
                                onRenameRoom(room.id, renameValue.trim());
                              }
                              setRenamingId(null);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRenamingId(null)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-display text-base font-bold text-slate-900">
                              {room.roomName}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                room.mode === 'dual'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {room.mode === 'dual' ? '2 Wheels' : '1 Wheel'}
                            </span>
                            {room.mode === 'dual' && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  room.settings?.dualSpinMode === 'matched'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {room.settings?.dualSpinMode === 'matched' ? '🔗 Cặp hợp lý' : '🎲 Ngẫu nhiên'}
                              </span>
                            )}
                            {isActive && (
                              <span className="text-xs font-bold text-blue-600">
                                · Current
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {(room.question ? room.question.replace(/\n/g, ' ↵ ') : 'No question prompt')} ·{' '}
                            {room.mode === 'dual'
                              ? `${room.wheel1.items.length} & ${room.wheel2.items.length} items`
                              : `${room.wheel1.items.length} items`}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Preview of items */}
                    <div className="flex flex-wrap items-center gap-1.5 my-2.5 text-xs text-slate-600">
                      {room.wheel1.items.slice(0, 5).map((it, idx) => (
                        <React.Fragment key={it.id}>
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: it.color }}
                            />
                            {it.emoji ? `${it.emoji} ` : ''}
                            {it.text}
                          </span>
                          {idx < Math.min(room.wheel1.items.length, 5) - 1 && (
                            <span aria-hidden="true" className="text-slate-300">
                              ·
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                      {room.mode === 'dual' && (
                        <>
                          <span className="text-slate-400">|</span>
                          <span className="text-slate-500 font-bold">
                            + {room.wheel2.title} ({room.wheel2.items.length})
                          </span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            onOpenRoom(room);
                            showTempBanner('success', `Loaded "${room.roomName}"`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Open</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRenamingId(room.id);
                            setRenameValue(room.roomName);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Rename</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onDuplicateRoom(room);
                            showTempBanner('success', `Duplicated "${room.roomName}"`);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Duplicate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => exportRoomToJson(room)}
                          title="Export this class as JSON"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRequestDeleteRoom(room)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
};
