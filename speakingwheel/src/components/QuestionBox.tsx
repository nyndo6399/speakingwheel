import React, { useRef, useState, useEffect } from 'react';
import {
  Edit3,
  Sparkles,
  ChevronDown,
  FolderOpen,
  Save,
  PlusCircle,
  Check,
  CornerDownLeft,
} from 'lucide-react';
import { RoomData, SPEAKING_PROMPT_SUGGESTIONS } from '../types/game';

interface QuestionBoxProps {
  question: string;
  onChangeQuestion: (newQuestion: string) => void;
  roomName: string;
  onRenameRoom?: (newName: string) => void;
  mode: 'single' | 'dual';
  savedRooms?: RoomData[];
  activeRoomId?: string | null;
  onSelectRoom?: (room: RoomData) => void;
  onOpenSaveModal?: () => void;
  onOpenRoomsPanel?: () => void;
}

export const QuestionBox: React.FC<QuestionBoxProps> = ({
  question,
  onChangeQuestion,
  roomName,
  onRenameRoom = () => {},
  mode,
  savedRooms = [],
  activeRoomId = null,
  onSelectRoom = () => {},
  onOpenSaveModal = () => {},
  onOpenRoomsPanel = () => {},
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);
  const [isEditingClassName, setIsEditingClassName] = useState(false);
  const [tempClassName, setTempClassName] = useState(roomName);

  // Auto-resize textarea height as content changes or newlines are entered
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(52, textareaRef.current.scrollHeight)}px`;
    }
  }, [question]);

  const handleEditClick = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  };

  const handleSaveClassName = () => {
    if (tempClassName.trim()) {
      onRenameRoom(tempClassName.trim());
    }
    setIsEditingClassName(false);
  };

  return (
    <section
      aria-label="Speaking Question Prompt"
      className="w-full max-w-4xl mx-auto px-4 pt-3 pb-1"
    >
      {/* Top Metadata Row: Class Selector & Prompts */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5 px-1">
        {/* Class Selector / Name */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700">
          <span className="text-slate-500 font-semibold">Class:</span>

          {isEditingClassName ? (
            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-blue-400">
              <input
                type="text"
                value={tempClassName}
                onChange={(e) => setTempClassName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveClassName();
                  if (e.key === 'Escape') setIsEditingClassName(false);
                }}
                autoFocus
                className="text-xs sm:text-sm font-bold text-slate-900 bg-transparent focus:outline-none w-32 sm:w-44"
              />
              <button
                type="button"
                onClick={handleSaveClassName}
                className="text-emerald-600 hover:text-emerald-700 p-0.5 cursor-pointer"
                title="Save class name"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowClassDropdown((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-900 font-bold border border-slate-200 shadow-xs cursor-pointer transition-all"
                title="Click to switch or load a saved class"
              >
                <span className="truncate max-w-[160px] sm:max-w-[220px]">
                  {roomName || 'Select Class'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Class Dropdown */}
              {showClassDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowClassDropdown(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30 max-h-72 overflow-y-auto">
                    <div className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                      <span>Saved Classes ({savedRooms.length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowClassDropdown(false);
                          onOpenSaveModal();
                        }}
                        className="text-blue-600 hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>Save Current</span>
                      </button>
                    </div>

                    {savedRooms.map((room) => (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => {
                          onSelectRoom(room);
                          setShowClassDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm transition-colors hover:bg-blue-50 cursor-pointer flex items-center justify-between ${
                          activeRoomId === room.id
                            ? 'bg-blue-50/70 text-blue-700 font-bold'
                            : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate">{room.roomName}</span>
                        <span className="text-[10px] text-slate-400 font-normal ml-2 shrink-0">
                          {room.mode === 'dual' ? '2 Wheels' : '1 Wheel'}
                        </span>
                      </button>
                    ))}

                    <div className="pt-1.5 mt-1 border-t border-slate-100 px-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowClassDropdown(false);
                          onOpenRoomsPanel();
                        }}
                        className="w-full py-1.5 text-center text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Manage All Classes</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setTempClassName(roomName);
              setIsEditingClassName(true);
            }}
            title="Rename active class"
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-white/60 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
            {mode === 'dual' ? 'Dual Wheels' : 'Single Wheel'}
          </span>
        </div>

        {/* Action Buttons: Save Class & Sample Prompts */}
        <div className="flex items-center gap-2">
          {/* Quick Save Class Button */}
          <button
            type="button"
            onClick={onOpenSaveModal}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
            title="Save this class and its wheel data"
          >
            <Save className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Save Class</span>
          </button>

          {/* Sample Prompts */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSuggestions((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap py-1 px-2 rounded-lg hover:bg-blue-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Prompts</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            </button>

            {showSuggestions && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowSuggestions(false)}
                />
                <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-30 max-h-72 overflow-y-auto">
                  <div className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 border-b border-slate-100">
                    Choose a Speaking Question
                  </div>
                  {SPEAKING_PROMPT_SUGGESTIONS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        onChangeQuestion(prompt);
                        setShowSuggestions(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs sm:text-sm transition-colors hover:bg-blue-50 hover:text-blue-700 cursor-pointer whitespace-pre-line border-b border-slate-50 last:border-0 ${
                        question === prompt
                          ? 'bg-blue-50/70 text-blue-700 font-semibold'
                          : 'text-slate-700'
                      }`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Question Box */}
      <div className="relative flex items-start bg-white rounded-2xl border-2 border-blue-200 focus-within:border-blue-500 shadow-sm transition-all px-4 sm:px-6 py-3 min-h-[64px]">
        <textarea
          ref={textareaRef}
          value={question}
          rows={1}
          onChange={(e) => onChangeQuestion(e.target.value)}
          placeholder={'Nhập câu hỏi tại đây... (Nhấn Enter để xuống dòng)\nVí dụ:\nWhat is this activity?\nThis is........'}
          aria-label="Type your question or speaking prompt here"
          className="w-full bg-transparent font-display text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none text-center sm:text-left pr-20 resize-none whitespace-pre-wrap leading-relaxed overflow-hidden transition-[height] duration-75"
        />

        <button
          type="button"
          onClick={handleEditClick}
          title="Click to edit speaking question"
          className="absolute top-3.5 right-3 sm:right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5 shrink-0" />
          <span>EDIT</span>
        </button>
      </div>

      {/* Bottom Hint for Line Break */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 px-2 pt-1.5 text-[11px] sm:text-xs text-slate-500">
        <div className="flex items-center gap-1.5 font-medium">
          <CornerDownLeft className="w-3 h-3 text-blue-500 shrink-0" />
          <span>
            Nhấn <strong className="text-slate-800 font-bold">Enter</strong> trong ô để xuống dòng (giúp câu hỏi và mẫu trả lời hiển thị 2 dòng to & đẹp mắt).
          </span>
        </div>
        {question.includes('\n') ? (
          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            ✓ Đã ngắt {question.split('\n').length} dòng
          </span>
        ) : (
          question.trim() && (
            <button
              type="button"
              onClick={() => {
                if (question.includes('This is')) {
                  onChangeQuestion(question.replace('This is', '\nThis is'));
                } else {
                  onChangeQuestion(`${question.trim()}\nThis is........`);
                }
              }}
              className="text-blue-600 hover:text-blue-800 hover:underline font-bold cursor-pointer"
            >
              + Xuống dòng thêm "This is........"
            </button>
          )
        )}
      </div>
    </section>
  );
};
