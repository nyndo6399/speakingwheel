import React from 'react';
import {
  X,
  Download,
  FileCode,
  Globe,
  Archive,
  CheckCircle2,
  Terminal,
  ExternalLink,
  Laptop,
} from 'lucide-react';

interface DownloadCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadCodeModal: React.FC<DownloadCodeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-50 w-full max-w-2xl bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl border-4 border-blue-400 p-6 sm:p-8 animate-pop-in max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900">
              TẢI MÃ NGUỒN & GAME VỀ MÁY
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Bạn có thể tải toàn bộ mã nguồn hoàn chỉnh hoặc tải bản HTML chạy offline
            </p>
          </div>
        </div>

        {/* 2 Main Download Cards */}
        <div className="space-y-4 my-5">
          {/* Card 1: Full Source Code ZIP */}
          <div className="p-5 rounded-2xl border-2 border-blue-200 bg-blue-50/50 hover:border-blue-400 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>Trọn Bộ Mã Nguồn Dự Án (.ZIP)</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      ~1.6 MB
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Bao gồm toàn bộ file mã nguồn React + TypeScript, Vite, Tailwind CSS, components, âm thanh, thuật toán quay và hướng dẫn cài đặt.
                  </p>
                </div>
              </div>

              <a
                href="/speakspin-game-source.zip"
                download="speakspin-game-source.zip"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>TẢI FILE .ZIP</span>
              </a>
            </div>
          </div>

          {/* Card 2: Standalone Single File Offline HTML */}
          <div className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>Bản Game Tự Chạy Offline (.HTML)</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Chạy ngay
                    </span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Chỉ <strong>1 file duy nhất (.html)</strong>. Tải về và nhấp đúp là chơi được ngay trên bất kỳ máy tính, TV hoặc màn hình tương tác mà không cần cài đặt gì.
                  </p>
                </div>
              </div>

              <a
                href="/speakspin-game-offline.html"
                download="speakspin-game-offline.html"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>TẢI FILE .HTML</span>
              </a>
            </div>
          </div>
        </div>

        {/* Quick Instructions */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-slate-600" />
            <span>Hướng dẫn chạy mã nguồn trên máy tính:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] sm:text-xs">
            <li>
              Giải nén file <strong className="text-blue-700">speakspin-game-source.zip</strong> vừa tải.
            </li>
            <li>
              Mở thư mục bằng phần mềm mã nguồn (như VS Code) hoặc mở cửa sổ Terminal/Command Prompt.
            </li>
            <li>
              Chạy lệnh: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">npm install</code> để cài thư viện.
            </li>
            <li>
              Chạy lệnh: <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">npm run dev</code> để mở game trên trình duyệt máy bạn!
            </li>
          </ol>
        </div>

        {/* Close Button Footer */}
        <div className="mt-5 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-display text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
