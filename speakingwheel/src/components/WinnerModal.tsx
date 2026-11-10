import React, { useEffect, useRef, useState } from 'react';
import { RotateCw, X, MessageCircle, CheckCircle2, Shuffle, Link2 } from 'lucide-react';
import { WheelItem, DualSpinMode } from '../types/game';

interface WinnerModalProps {
  winner1: WheelItem | null;
  winner2?: WheelItem | null;
  wheel1Title?: string;
  wheel2Title?: string;
  isDual: boolean;
  question: string;
  dualSpinMode?: DualSpinMode;
  isMatchedPair?: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner1,
  winner2,
  wheel1Title = 'Wheel 1',
  wheel2Title = 'Wheel 2',
  isDual,
  question,
  dualSpinMode,
  isMatchedPair,
  onClose,
  onSpinAgain,
}) => {
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [img1Failed, setImg1Failed] = useState(false);
  const [img2Failed, setImg2Failed] = useState(false);

  useEffect(() => {
    setImg1Failed(false);
    setImg2Failed(false);
  }, [winner1, winner2]);

  useEffect(() => {
    if (!winner1) return;
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const particles = Array.from({ length: 95 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 450,
      y: canvas.height / 2 - 80 + (Math.random() - 0.5) * 160,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 12 - 4,
      size: Math.random() * 9 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      opacity: 1,
    }));

    let frameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeCount = 0;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28;
        p.rotation += p.vRot;
        p.opacity -= 0.008;

        if (p.opacity > 0 && p.y < canvas.height + 30) {
          activeCount++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          ctx.restore();
        }
      }

      if (activeCount > 0) {
        frameId = requestAnimationFrame(render);
      }
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [winner1, winner2]);

  if (!winner1) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="winner-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8"
    >
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50"
      />

      <div className="relative z-50 w-full max-w-4xl max-h-[94vh] overflow-y-auto bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl border-4 sm:border-8 border-amber-400 p-6 sm:p-10 md:p-12 text-center animate-pop-in">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Winner Popup"
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
        </button>

        <p
          id="winner-modal-title"
          className="font-display text-xl sm:text-2xl md:text-3xl font-black tracking-wide text-amber-600 mb-2 uppercase"
        >
          {isDual && winner2 ? '🎉 YOUR COMBINATION IS:' : '🎉 YOUR TOPIC IS:'}
        </p>

        {isDual && winner2 && (
          <div className="flex items-center justify-center mb-3">
            {isMatchedPair || dualSpinMode === 'matched' ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-black tracking-wide shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>🔗 SẮP XẾP CẶP THEO Ý MUỐN (MATCHED PAIR)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-100 border border-blue-300 text-blue-800 text-xs sm:text-sm font-black tracking-wide shadow-2xs">
                <Shuffle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>🎲 QUAY NGẪU NHIÊN ĐỘC LẬP (RANDOM SPIN)</span>
              </span>
            )}
          </div>
        )}

        {/* Display Single vs Dual Winner Cards */}
        {isDual && winner2 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 my-5 sm:my-7">
            {/* Card 1 */}
            <div
              className="p-5 sm:p-8 rounded-3xl border-3 sm:border-4 flex flex-col items-center justify-center bg-slate-50/90 shadow-md transition-transform hover:scale-[1.01]"
              style={{ borderColor: winner1.color }}
            >
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-slate-600 mb-3 px-3.5 py-1 bg-white rounded-full shadow-xs border border-slate-200">
                {wheel1Title}
              </span>
              {winner1.image && !img1Failed ? (
                <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden mb-3 bg-white border-2 border-slate-200 p-2 shadow-inner">
                  <img
                    src={winner1.image}
                    alt={winner1.text}
                    referrerPolicy="no-referrer"
                    onError={() => setImg1Failed(true)}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl md:text-7xl mb-3 text-white shadow-md"
                  style={{ backgroundColor: winner1.color }}
                >
                  <span>{winner1.emoji || '⭐'}</span>
                </div>
              )}
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 break-words leading-tight">
                {winner1.text}
              </h3>
            </div>

            {/* Card 2 */}
            <div
              className="p-5 sm:p-8 rounded-3xl border-3 sm:border-4 flex flex-col items-center justify-center bg-slate-50/90 shadow-md transition-transform hover:scale-[1.01]"
              style={{ borderColor: winner2.color }}
            >
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-slate-600 mb-3 px-3.5 py-1 bg-white rounded-full shadow-xs border border-slate-200">
                {wheel2Title}
              </span>
              {winner2.image && !img2Failed ? (
                <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-2xl overflow-hidden mb-3 bg-white border-2 border-slate-200 p-2 shadow-inner">
                  <img
                    src={winner2.image}
                    alt={winner2.text}
                    referrerPolicy="no-referrer"
                    onError={() => setImg2Failed(true)}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl md:text-7xl mb-3 text-white shadow-md"
                  style={{ backgroundColor: winner2.color }}
                >
                  <span>{winner2.emoji || '🎯'}</span>
                </div>
              )}
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 break-words leading-tight">
                {winner2.text}
              </h3>
            </div>
          </div>
        ) : (
          <div className="my-6 sm:my-8 flex flex-col items-center justify-center">
            {winner1.image && !img1Failed ? (
              <div
                className="w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 rounded-3xl p-3 bg-slate-50 border-4 sm:border-6 shadow-lg flex items-center justify-center overflow-hidden mb-4"
                style={{ borderColor: winner1.color }}
              >
                <img
                  src={winner1.image}
                  alt={winner1.text}
                  referrerPolicy="no-referrer"
                  onError={() => setImg1Failed(true)}
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>
            ) : (
              <div
                className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-3xl flex items-center justify-center text-7xl sm:text-8xl md:text-9xl shadow-lg border-4 border-white mb-4"
                style={{ backgroundColor: winner1.color }}
              >
                <span>{winner1.emoji || '⭐'}</span>
              </div>
            )}
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 break-words">
              {winner1.text.toUpperCase()}
            </h2>
          </div>
        )}

        {/* Classroom Speaking Prompt Box */}
        <div className="mt-5 mb-8 p-5 sm:p-7 md:p-8 rounded-3xl bg-amber-50/90 border-2 sm:border-3 border-amber-300 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="flex items-center justify-center gap-2.5 text-base sm:text-lg md:text-xl font-black text-amber-700 tracking-wide uppercase">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-amber-600" />
            <span>Classroom Speaking Challenge</span>
          </div>
          <p className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-snug sm:leading-tight break-words max-w-3xl whitespace-pre-line text-center">
            {question.trim() ? question : 'Speak about your selected topic!'}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-extrabold text-lg sm:text-xl transition-all active:scale-95 cursor-pointer whitespace-nowrap shadow-sm"
          >
            CLOSE
          </button>

          <button
            type="button"
            onClick={onSpinAgain}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-3.5 sm:px-12 sm:py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-display font-black text-lg sm:text-xl shadow-lg hover:shadow-orange-500/25 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <RotateCw className="w-6 h-6 stroke-[2.5]" />
            <span>{isDual ? 'SPIN BOTH AGAIN' : 'SPIN AGAIN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
