import React, { useState, useEffect } from 'react';
import { X, Save, PlusCircle, CheckCircle2, Disc } from 'lucide-react';
import { CurrentGameState, RoomData } from '../types/game';

interface SaveClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGame: CurrentGameState;
  savedRooms: RoomData[];
  onSaveClass: (name: string, isNew: boolean) => void;
}

export const SaveClassModal: React.FC<SaveClassModalProps> = ({
  isOpen,
  onClose,
  currentGame,
  savedRooms,
  onSaveClass,
}) => {
  const [className, setClassName] = useState('');
  const activeExisting = savedRooms.find((r) => r.id === currentGame.activeRoomId);
  const [saveAsNew, setSaveAsNew] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setClassName(currentGame.roomName || 'My Classroom Class');
      setSaveAsNew(!activeExisting);
    }
  }, [isOpen, currentGame.roomName, activeExisting]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = className.trim() || 'My Classroom Class';
    onSaveClass(finalName, saveAsNew);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-class-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 animate-pop-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="save-class-modal-title"
                className="font-display text-xl font-bold text-slate-900"
              >
                Save Class & Wheel Data
              </h2>
              <p className="text-xs text-slate-500">
                Save your created wheels, topics, and images
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close save dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Class Name input */}
          <div>
            <label
              htmlFor="class-name-input"
              className="block font-display text-sm font-bold text-slate-800 mb-1.5"
            >
              Class / Room Name
            </label>
            <input
              id="class-name-input"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. Class 3A, Grade 4 - Animals, Unit 5"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 shadow-xs"
            />
          </div>

          {/* If an existing class is loaded, let user choose Update vs Save As New */}
          {activeExisting && (
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-600">
                Save Destination:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSaveAsNew(false)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    !saveAsNew
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <CheckCircle2 className={`w-4 h-4 ${!saveAsNew ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>Update Current Class</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    Overwrite &ldquo;{activeExisting.roomName}&rdquo;
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSaveAsNew(true)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    saveAsNew
                      ? 'border-blue-600 bg-blue-50/70 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <PlusCircle className={`w-4 h-4 ${saveAsNew ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>Save as New Class</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Keep current and create another
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Summary Preview of data being saved */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>Configuration:</span>
              <span className="text-slate-900 font-bold">
                {currentGame.mode === 'dual' ? 'Dual Wheels (2 Wheels)' : 'Single Wheel (1 Wheel)'}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-500 font-semibold">
              <span>Question Prompt:</span>
              <span className="text-slate-900 font-bold max-w-[240px] truncate text-right">
                {currentGame.question.replace(/\n/g, ' ↵ ') || 'No prompt set'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1 font-semibold">
                <Disc className="w-3.5 h-3.5 text-blue-600" />
                {currentGame.wheel1.title || 'Wheel 1'}:
              </span>
              <span className="font-bold text-slate-900">
                {currentGame.wheel1.items.length} items
              </span>
            </div>

            {currentGame.mode === 'dual' && (
              <>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1 font-semibold">
                    <Disc className="w-3.5 h-3.5 text-amber-600" />
                    {currentGame.wheel2.title || 'Wheel 2'}:
                  </span>
                  <span className="font-bold text-slate-900">
                    {currentGame.wheel2.items.length} items
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="font-semibold">Chế độ quay:</span>
                  <span className="font-bold text-slate-900">
                    {currentGame.settings.dualSpinMode === 'matched' ? '🔗 Cặp hợp lý (Matched)' : '🎲 Ngẫu nhiên (Random)'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs sm:text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saveAsNew ? 'Save as New Class' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
