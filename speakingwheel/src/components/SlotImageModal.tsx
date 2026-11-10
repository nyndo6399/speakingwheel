import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  Smile,
  AlertCircle,
} from 'lucide-react';
import { WheelItem, WHEEL_COLOR_PALETTE } from '../types/game';
import { processUploadedImageFile } from '../utils/storage';
import {
  CLASSROOM_CATEGORIES,
  CLASSROOM_STICKERS,
  POPULAR_EMOJIS,
  ClassroomSticker,
} from '../utils/classroomLibrary';

interface SlotImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  wheelId: 'wheel-1' | 'wheel-2';
  wheelTitle: string;
  items: WheelItem[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onUpdateItem: (wheelId: 'wheel-1' | 'wheel-2', itemId: string, partial: Partial<WheelItem>) => void;
}

type TabType = 'library' | 'upload' | 'url' | 'emoji';

export const SlotImageModal: React.FC<SlotImageModalProps> = ({
  isOpen,
  onClose,
  wheelId,
  wheelTitle,
  items,
  currentIndex,
  onSelectIndex,
  onUpdateItem,
}) => {
  const currentItem = items[currentIndex];

  const [activeTab, setActiveTab] = useState<TabType>('library');
  const [selectedCategory, setSelectedCategory] = useState<string>('animals');
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlLoading, setUrlLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset transient messages when changing item
  useEffect(() => {
    setErrorMessage(null);
    setSuccessNotice(null);
    setUrlInput('');
  }, [currentIndex]);

  if (!isOpen || !currentItem) return null;

  const showFeedback = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 2500);
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setErrorMessage(null);
    try {
      const dataUrl = await processUploadedImageFile(file);
      onUpdateItem(wheelId, currentItem.id, { image: dataUrl });
      showFeedback('Đã cập nhật ảnh từ máy tính!');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể tải ảnh lên.');
    }
  };

  const handleApplyUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage('Vui lòng nhập đường link ảnh hợp lệ.');
      return;
    }
    setErrorMessage(null);
    setUrlLoading(true);

    try {
      // Validate image by loading it in memory
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Không thể tải ảnh từ liên kết này. Vui lòng kiểm tra lại URL.'));
        img.src = trimmed;
      });

      onUpdateItem(wheelId, currentItem.id, { image: trimmed });
      showFeedback('Đã áp dụng ảnh từ liên kết URL!');
      setUrlInput('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi khi tải ảnh từ đường dẫn.');
    } finally {
      setUrlLoading(false);
    }
  };

  const handlePickSticker = (sticker: ClassroomSticker) => {
    setErrorMessage(null);
    const updates: Partial<WheelItem> = {
      image: sticker.dataUrl,
      emoji: sticker.emoji,
    };
    // If current item has default or empty text, update with sticker label
    if (!currentItem.text || currentItem.text.startsWith('Item') || currentItem.text.startsWith('Ô ')) {
      updates.text = sticker.name.split(' (')[0];
    }
    onUpdateItem(wheelId, currentItem.id, updates);
    showFeedback(`Đã chọn ảnh: ${sticker.name}`);
  };

  const handlePickEmoji = (emoji: string) => {
    setErrorMessage(null);
    // Create an inline sticker SVG from the chosen emoji
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
      <defs>
        <radialGradient id="g" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
          <stop offset="65%" stop-color="${currentItem.color || '#3B82F6'}" stop-opacity="0.75"/>
          <stop offset="100%" stop-color="${currentItem.color || '#3B82F6'}" stop-opacity="1"/>
        </radialGradient>
      </defs>
      <rect width="160" height="160" rx="36" fill="url(#g)"/>
      <circle cx="80" cy="74" r="50" fill="#ffffff" fill-opacity="0.92" stroke="#ffffff" stroke-width="4"/>
      <text x="80" y="84" font-size="70" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
    </svg>`;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    onUpdateItem(wheelId, currentItem.id, {
      image: dataUrl,
      emoji,
    });
    showFeedback(`Đã tạo sticker biểu tượng ${emoji}!`);
  };

  const handleRemoveImage = () => {
    onUpdateItem(wheelId, currentItem.id, { image: undefined });
    showFeedback('Đã xóa ảnh khỏi ô này.');
  };

  const filteredStickers = CLASSROOM_STICKERS.filter((s) => s.category === selectedCategory);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slot-image-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-pop-in">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 id="slot-image-modal-title" className="font-display text-lg sm:text-xl font-bold text-slate-900">
                Thay Ảnh Vào Từng Ô Vòng Xoay
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                {wheelTitle || (wheelId === 'wheel-1' ? 'Vòng quay 1' : 'Vòng quay 2')} • Ô số{' '}
                <span className="font-bold text-blue-700">#{currentIndex + 1}</span> ({items.length} ô)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white/80 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slot Selector & Navigation Ribbon */}
        <div className="px-5 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => onSelectIndex(currentIndex - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Ô trước</span>
          </button>

          {/* Quick slot pills */}
          <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto py-1 px-1">
            {items.map((it, idx) => (
              <button
                key={it.id}
                type="button"
                onClick={() => onSelectIndex(idx)}
                title={`Ô ${idx + 1}: ${it.text || 'Chưa đặt tên'}`}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  idx === currentIndex
                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                  style={{ backgroundColor: it.color }}
                />
                <span>Ô {idx + 1}</span>
                {it.image && <span className="text-[10px] text-emerald-400">●</span>}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={currentIndex === items.length - 1}
            onClick={() => onSelectIndex(currentIndex + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 transition-all cursor-pointer"
          >
            <span className="hidden sm:inline">Ô sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Top Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Badge Preview */}
              <div className="relative shrink-0">
                <div
                  className="w-20 h-20 rounded-2xl border-3 border-white shadow-md flex items-center justify-center overflow-hidden transition-transform"
                  style={{ backgroundColor: currentItem.color }}
                >
                  {currentItem.image ? (
                    <img
                      src={currentItem.image}
                      alt={currentItem.text || `Ô ${currentIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{currentItem.emoji || '⭐'}</span>
                  )}
                </div>
                {currentItem.image && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Slot Info & Quick Edits */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Nội dung ô #{currentIndex + 1}
                  </span>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-lg text-white"
                    style={{ backgroundColor: currentItem.color }}
                  >
                    Màu sắc ô
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={currentItem.text}
                    onChange={(e) =>
                      onUpdateItem(wheelId, currentItem.id, { text: e.target.value })
                    }
                    placeholder={`Nhập tên cho ô ${currentIndex + 1}...`}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="color"
                    value={currentItem.color}
                    onChange={(e) =>
                      onUpdateItem(wheelId, currentItem.id, { color: e.target.value })
                    }
                    title="Chọn màu nền cho ô"
                    className="w-8 h-8 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0"
                  />
                </div>
                {/* Color swatches */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] text-slate-500 font-medium mr-1">Màu nhanh:</span>
                  {WHEEL_COLOR_PALETTE.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onUpdateItem(wheelId, currentItem.id, { color: c })}
                      className="w-4 h-4 rounded-full border border-black/15 transition-transform hover:scale-110 cursor-pointer"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Remove Image Action */}
            {currentItem.image && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa ảnh hiện tại</span>
              </button>
            )}
          </div>

          {/* Toast / Status messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`flex-1 py-2 px-2.5 rounded-xl font-display text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'library'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Thư Viện Ảnh Đẹp</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 px-2.5 rounded-xl font-display text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Tải Từ Máy Tính</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 px-2.5 rounded-xl font-display text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dán Link (URL)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('emoji')}
                className={`flex-1 py-2 px-2.5 rounded-xl font-display text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'emoji'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smile className="w-3.5 h-3.5 text-amber-600" />
                <span>Biểu Tượng Emoji</span>
              </button>
            </div>
          </div>

          {/* TAB 1: CLASSROOM STICKER LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {CLASSROOM_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Stickers Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {filteredStickers.map((sticker) => {
                  const isCurrent = currentItem.image === sticker.dataUrl;
                  return (
                    <button
                      key={sticker.id}
                      type="button"
                      onClick={() => handlePickSticker(sticker)}
                      className={`relative p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105 cursor-pointer bg-white ${
                        isCurrent
                          ? 'border-blue-600 shadow-md ring-2 ring-blue-300'
                          : 'border-slate-200 hover:border-blue-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center p-1">
                        <img
                          src={sticker.dataUrl}
                          alt={sticker.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 text-center line-clamp-1">
                        {sticker.name.split(' (')[0]}
                      </span>
                      {isCurrent && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD FROM COMPUTER */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileUpload(file);
                }}
                className="p-8 rounded-3xl border-2 border-dashed border-blue-300 bg-blue-50/40 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="font-display text-base font-bold text-slate-900 mb-1">
                  Nhấp để chọn ảnh hoặc kéo thả ảnh vào đây
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Hỗ trợ định dạng PNG, JPG, JPEG, WEBP, GIF, SVG. Hệ thống tự động căn chỉnh và tối ưu kích thước ảnh cho vòng xoay.
                </p>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn ảnh từ máy tính</span>
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.gif,.svg,image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: IMAGE URL */}
          {activeTab === 'url' && (
            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <label
                  htmlFor="img-url-input"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Dán đường link ảnh từ Internet (Google Images, Wikimedia,...)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="img-url-input"
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/image.png"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={urlLoading || !urlInput.trim()}
                    onClick={handleApplyUrl}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {urlLoading ? (
                      <span>Đang tải...</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Áp dụng ảnh</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Mẹo: Bạn có thể nhấp chuột phải vào bất kỳ hình ảnh nào trên Google rồi chọn "Sao chép địa chỉ hình ảnh" (Copy image address) và dán vào đây!
              </p>
            </div>
          )}

          {/* TAB 4: EMOJI STICKERS */}
          {activeTab === 'emoji' && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-600">
                Nhấp vào bất kỳ biểu tượng Emoji nào để tạo nhãn dán sticker màu sắc cho ô này:
              </p>
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 max-h-60 overflow-y-auto">
                {POPULAR_EMOJIS.map((em, i) => (
                  <button
                    key={`${em}-${i}`}
                    type="button"
                    onClick={() => handlePickEmoji(em)}
                    className="w-10 h-10 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-2xl flex items-center justify-center transition-transform hover:scale-115 cursor-pointer shadow-xs"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            💡 Ảnh sau khi chọn sẽ tự động lưu và hiển thị trực tiếp trên vòng xoay!
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display text-sm font-bold shadow-md cursor-pointer transition-all"
          >
            Hoàn tất & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
