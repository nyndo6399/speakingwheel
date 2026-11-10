import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  FileText,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Camera,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { WheelItem, WHEEL_COLOR_PALETTE } from '../types/game';
import {
  parseCsvText,
  processCsvToWheelItems,
  downloadSampleCsvTemplate,
  ParsedCsvRow,
} from '../utils/csvImport';
import { processUploadedImageFile } from '../utils/storage';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  wheelMode: 'single' | 'dual';
  wheel1Title: string;
  wheel2Title: string;
  wheel1Count: number;
  wheel2Count: number;
  initialTargetWheel?: 'wheel-1' | 'wheel-2';
  onImportItems: (
    targetWheel: 'wheel-1' | 'wheel-2',
    items: WheelItem[],
    mode: 'replace' | 'append'
  ) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  wheelMode,
  wheel1Title,
  wheel2Title,
  wheel1Count,
  wheel2Count,
  initialTargetWheel = 'wheel-1',
  onImportItems,
}) => {
  const [targetWheel, setTargetWheel] = useState<'wheel-1' | 'wheel-2'>(initialTargetWheel);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');

  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedCsvRow[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rowImageInputRef = useRef<HTMLInputElement | null>(null);
  const [activeRowForImage, setActiveRowForImage] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleParseContent = (content: string, name?: string) => {
    setErrorMsg(null);
    try {
      const matrix = parseCsvText(content);
      if (matrix.length === 0) {
        setErrorMsg('Không tìm thấy dữ liệu hợp lệ trong file hoặc văn bản CSV.');
        setParsedItems([]);
        return;
      }

      const existingCount = importMode === 'append' ? (targetWheel === 'wheel-1' ? wheel1Count : wheel2Count) : 0;
      const items = processCsvToWheelItems(matrix, existingCount);

      if (items.length === 0) {
        setErrorMsg('Các dòng trong file CSV không có nội dung chữ hoặc hình ảnh hợp lệ.');
        setParsedItems([]);
        return;
      }

      setParsedItems(items);
      if (name) setFileName(name);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Lỗi khi đọc file CSV.');
      setParsedItems([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      handleParseContent(content, file.name);
    };
    reader.onerror = () => {
      setErrorMsg('Không thể đọc file đã chọn.');
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      handleParseContent(content, file.name);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    setFileName(null);
    if (val.trim()) {
      handleParseContent(val);
    } else {
      setParsedItems([]);
    }
  };

  const handleUpdateItemRow = (index: number, partial: Partial<ParsedCsvRow>) => {
    setParsedItems((prev) =>
      prev.map((it, idx) => (idx === index ? { ...it, ...partial } : it))
    );
  };

  const handleDeleteItemRow = (index: number) => {
    setParsedItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleAddEmptyRow = () => {
    const nextIdx = parsedItems.length;
    const color = WHEEL_COLOR_PALETTE[nextIdx % WHEEL_COLOR_PALETTE.length];
    setParsedItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${nextIdx}`,
        text: `Item ${nextIdx + 1}`,
        color,
        emoji: '⭐',
      },
    ]);
  };

  const handleRowImageUpload = async (file: File | undefined) => {
    if (!file || activeRowForImage === null) return;
    try {
      const dataUrl = await processUploadedImageFile(file);
      handleUpdateItemRow(activeRowForImage, { image: dataUrl });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Không thể tải ảnh cho dòng này.');
    } finally {
      setActiveRowForImage(null);
    }
  };

  const handleConfirmImport = () => {
    if (parsedItems.length === 0) return;

    // Convert parsed rows into clean WheelItem objects
    const finalItems: WheelItem[] = parsedItems.map((it, idx) => ({
      id: it.id || `item-${Date.now()}-${idx}`,
      text: it.text.trim() || `Item ${idx + 1}`,
      image: it.image,
      emoji: it.emoji || (it.image ? undefined : '⭐'),
      color: it.color || WHEEL_COLOR_PALETTE[idx % WHEEL_COLOR_PALETTE.length],
    }));

    onImportItems(targetWheel, finalItems, importMode);
    onClose();
  };

  const targetTitle =
    targetWheel === 'wheel-1' ? wheel1Title || 'Vòng 1' : wheel2Title || 'Vòng 2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Hidden file input for individual row image change */}
      <input
        type="file"
        ref={rowImageInputRef}
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => {
          handleRowImageUpload(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {/* Hidden file input for main CSV */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv,.txt,text/csv,text/plain"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Dialog */}
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-pop-in">
        {/* Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-slate-200/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-black text-slate-900">
                NHẬP TỪ & ẢNH ĐỒNG LOẠT TỪ CSV
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Tự động tạo nhiều ô vòng xoay cùng lúc kèm hình ảnh, emoji và màu sắc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadSampleCsvTemplate()}
              title="Tải file CSV mẫu chuẩn về máy tính"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Tải file CSV mẫu</span>
              <span className="sm:hidden">Mẫu</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Options Bar: Target Wheel & Replace vs Append */}
        <div className="px-5 sm:px-7 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Target wheel selection in dual mode */}
          {wheelMode === 'dual' ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">Nhập vào:</span>
              <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setTargetWheel('wheel-1')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    targetWheel === 'wheel-1'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {wheel1Title || 'Vòng 1'} ({wheel1Count} ô)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetWheel('wheel-2')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    targetWheel === 'wheel-2'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {wheel2Title || 'Vòng 2'} ({wheel2Count} ô)
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-700 font-semibold">
              Đang nhập cho: <strong className="text-blue-700">{wheel1Title || 'Vòng xoay'}</strong>
            </div>
          )}

          {/* Import mode: Replace vs Append */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Cách nhập:</span>
            <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  importMode === 'replace'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Thay thế toàn bộ
              </button>
              <button
                type="button"
                onClick={() => setImportMode('append')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  importMode === 'append'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                + Thêm nối tiếp
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          {/* Tab Selector: Upload File or Direct Paste */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'file'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Tải file CSV (.csv)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Dán nội dung CSV trực tiếp</span>
            </button>
          </div>

          {/* TAB 1: File Upload / Drag & Drop */}
          {activeTab === 'file' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
                  : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/30'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <p className="font-display text-base sm:text-lg font-bold text-slate-800 mb-1">
                {fileName ? `File đã chọn: ${fileName}` : 'Kéo thả file CSV vào đây hoặc Nhấp để chọn file'}
              </p>
              <p className="text-xs text-slate-500 max-w-md">
                Hỗ trợ định dạng <strong>.csv</strong> hoặc <strong>.txt</strong> (các cột gồm: <em>text, image, emoji, color</em>). UTF-8 hiển thị hoàn hảo tiếng Việt có dấu.
              </p>
              <button
                type="button"
                className="mt-3.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
              >
                {fileName ? 'Chọn file khác' : 'Chọn file từ máy tính'}
              </button>
            </div>
          ) : (
            /* TAB 2: Direct Textarea Paste */
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span>Dán các dòng CSV vào ô dưới đây (mỗi dòng 1 ô):</span>
                <button
                  type="button"
                  onClick={() => {
                    const sample =
`text,image,emoji,color
cooking,https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=300,👩‍🍳,#EF4444
eating,https://images.unsplash.com/photo-1544025162-d76694265947?w=300,🍽️,#F97316
drinking,https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300,🥤,#10B981
reading,https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300,📖,#F59E0B`;
                    setRawText(sample);
                    handleParseContent(sample);
                  }}
                  className="text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  Dán mẫu thử nghiệm
                </button>
              </div>
              <textarea
                value={rawText}
                onChange={handleTextareaChange}
                rows={5}
                placeholder="text,image,emoji,color&#10;cooking,https://...,👩‍🍳,#EF4444&#10;eating,https://...,🍽️,#F97316"
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 font-mono text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500 bg-white shadow-inner resize-y"
              />
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview Table of Parsed Items */}
          {parsedItems.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <h3 className="font-display text-sm sm:text-base font-bold text-slate-900">
                    Xem trước kết quả ({parsedItems.length} ô hợp lệ):
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleAddEmptyRow}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm dòng</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">#</th>
                        <th className="py-2.5 px-3 w-20 text-center">Ảnh</th>
                        <th className="py-2.5 px-3">Từ vựng / Chữ</th>
                        <th className="py-2.5 px-3 w-16 text-center">Emoji</th>
                        <th className="py-2.5 px-3 w-20 text-center">Màu</th>
                        <th className="py-2.5 px-3 w-10 text-center">Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 text-center text-slate-400 font-bold">
                            {idx + 1}
                          </td>

                          {/* Image preview & change */}
                          <td className="py-2 px-3 text-center">
                            <div className="relative inline-block group">
                              <div
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center shadow-2xs mx-auto"
                                style={{ backgroundColor: item.color }}
                              >
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.text}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-base">{item.emoji || '⭐'}</span>
                                )}
                              </div>
                              <button
                                type="button"
                                title="Thay ảnh cho ô này từ máy tính"
                                onClick={() => {
                                  setActiveRowForImage(idx);
                                  rowImageInputRef.current?.click();
                                }}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs cursor-pointer opacity-80 group-hover:opacity-100 transition-opacity"
                              >
                                <Camera className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </td>

                          {/* Text input */}
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.text}
                              onChange={(e) =>
                                handleUpdateItemRow(idx, { text: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                            />
                            {item.image && (
                              <span className="text-[10px] text-slate-400 block truncate max-w-xs mt-0.5">
                                {item.image.startsWith('data:') ? 'Ảnh đính kèm' : item.image}
                              </span>
                            )}
                          </td>

                          {/* Emoji input */}
                          <td className="py-2 px-3 text-center">
                            <input
                              type="text"
                              value={item.emoji || ''}
                              maxLength={4}
                              onChange={(e) =>
                                handleUpdateItemRow(idx, { emoji: e.target.value })
                              }
                              placeholder="⭐"
                              className="w-12 text-center px-1.5 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-500 bg-white"
                            />
                          </td>

                          {/* Color picker */}
                          <td className="py-2 px-3 text-center">
                            <input
                              type="color"
                              value={item.color || '#3B82F6'}
                              onChange={(e) =>
                                handleUpdateItemRow(idx, { color: e.target.value })
                              }
                              className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                            />
                          </td>

                          {/* Delete */}
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteItemRow(idx)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 sm:px-7 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={parsedItems.length === 0}
            onClick={handleConfirmImport}
            className={`px-6 py-2.5 rounded-xl font-display text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              parsedItems.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>
              {importMode === 'replace' ? 'Thay thế bằng' : 'Thêm'}{' '}
              {parsedItems.length > 0 ? `${parsedItems.length} ô` : 'các ô'} vào {targetTitle}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
