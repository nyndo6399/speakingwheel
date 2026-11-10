import React, { useEffect, useRef, useState } from 'react';
import { Plus, Sparkles, Play, Image as ImageIcon, Camera, Link2, FileSpreadsheet } from 'lucide-react';
import { WheelItem, DualSpinMode } from '../types/game';

interface SpinWheelCanvasProps {
  wheelId: 'wheel-1' | 'wheel-2';
  title: string;
  items: WheelItem[];
  rotationDeg: number;
  isSpinning: boolean;
  winningIndex: number | null;
  pointerKick: boolean;
  sizeVariant?: 'normal' | 'compact';
  onSpinClick: () => void;
  onAddFirstItem: () => void;
  showIndividualSpinButton?: boolean;
  onSlotClick?: (index: number) => void;
  onOpenChangeImages?: () => void;
  onOpenPairMatching?: () => void;
  onOpenCsvImport?: () => void;
  dualSpinMode?: DualSpinMode;
}

export const SpinWheelCanvas: React.FC<SpinWheelCanvasProps> = ({
  wheelId,
  title,
  items,
  rotationDeg,
  isSpinning,
  winningIndex,
  pointerKick,
  sizeVariant = 'normal',
  onSpinClick,
  onAddFirstItem,
  showIndividualSpinButton = false,
  onSlotClick,
  onOpenChangeImages,
  onOpenPairMatching,
  onOpenCsvImport,
  dualSpinMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [imagesVersion, setImagesVersion] = useState(0);

  useEffect(() => {
    let isMounted = true;
    items.forEach((item) => {
      if (item.image && !imageCacheRef.current.has(item.image)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imageCacheRef.current.set(item.image!, img);
          if (isMounted) {
            setImagesVersion((v) => v + 1);
          }
        };
        img.onerror = () => {};
        img.src = item.image;
      }
    });
    return () => {
      isMounted = false;
    };
  }, [items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = sizeVariant === 'compact' ? 640 : 720;
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const outerRadius = size / 2 - 14; // Outer gold ring edge
    const goldRimWidth = sizeVariant === 'compact' ? 10 : 12;
    const darkRimOuterRadius = outerRadius - goldRimWidth;
    const darkRimWidth = sizeVariant === 'compact' ? 24 : 28;
    const wheelRadius = darkRimOuterRadius - darkRimWidth; // Where slices sit
    const capR = sizeVariant === 'compact' ? 38 : 46;
    const hubOuterRadius = capR + (sizeVariant === 'compact' ? 12 : 14);
    const N = items.length;

    // 1. OUTER WHEEL DROP SHADOW
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.shadowColor = 'rgba(15, 23, 42, 0.35)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    ctx.fill();
    ctx.restore();

    // 2. OUTER GOLD TORUS RIM (Metallic bevel with top-left highlight and bottom-right shadow)
    const goldGrad = ctx.createLinearGradient(
      cx - outerRadius,
      cy - outerRadius,
      cx + outerRadius,
      cy + outerRadius
    );
    goldGrad.addColorStop(0, '#FFE875');
    goldGrad.addColorStop(0.25, '#F5BA38');
    goldGrad.addColorStop(0.65, '#E09B16');
    goldGrad.addColorStop(1, '#9C6207');

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = goldGrad;
    ctx.fill();

    // Subtle 3D specular highlight along top edge of gold rim
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius - 1.5, Math.PI * 0.8, Math.PI * 1.8);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // 3. DARK SLATE / GUNMETAL HOUSING RIM
    const darkRimGrad = ctx.createLinearGradient(
      cx,
      cy - darkRimOuterRadius,
      cx,
      cy + darkRimOuterRadius
    );
    darkRimGrad.addColorStop(0, '#424C5C');
    darkRimGrad.addColorStop(0.4, '#313945');
    darkRimGrad.addColorStop(1, '#202630');

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, darkRimOuterRadius, 0, Math.PI * 2);
    ctx.fillStyle = darkRimGrad;
    ctx.fill();

    // Outer highlight rim of dark housing
    ctx.beginPath();
    ctx.arc(cx, cy, darkRimOuterRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner shadow ring where wheel slices nest
    ctx.beginPath();
    ctx.arc(cx, cy, wheelRadius + 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(10, 15, 22, 0.65)';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // 4. 8 CHROME / SILVER RIVETS (BOLTS) ALONG THE DARK RIM
    const rivetDist = (darkRimOuterRadius + wheelRadius) / 2;
    const rivetRadius = sizeVariant === 'compact' ? 5 : 6.2;
    // Angles matching the reference image (top behind pointer, sides, bottom, diagonals)
    const rivetAnglesDeg = [-90, -45, 0, 45, 90, 135, 180, 225];

    for (let k = 0; k < rivetAnglesDeg.length; k++) {
      const angleRad = (rivetAnglesDeg[k] * Math.PI) / 180;
      const rx = cx + Math.cos(angleRad) * rivetDist;
      const ry = cy + Math.sin(angleRad) * rivetDist;

      ctx.save();
      // Drop shadow for rivet
      ctx.beginPath();
      ctx.arc(rx, ry + 1.2, rivetRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 15, 22, 0.55)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 3;
      ctx.fill();

      // Spherical Chrome Gradient
      const rivetGrad = ctx.createRadialGradient(
        rx - rivetRadius * 0.35,
        ry - rivetRadius * 0.35,
        rivetRadius * 0.08,
        rx,
        ry,
        rivetRadius
      );
      rivetGrad.addColorStop(0, '#FFFFFF');
      rivetGrad.addColorStop(0.3, '#E2E8F0');
      rivetGrad.addColorStop(0.65, '#94A3B8');
      rivetGrad.addColorStop(0.9, '#475569');
      rivetGrad.addColorStop(1, '#334155');

      ctx.beginPath();
      ctx.arc(rx, ry, rivetRadius, 0, Math.PI * 2);
      ctx.fillStyle = rivetGrad;
      ctx.fill();

      // Fine rim stroke
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }

    // 5. BASE RECESSED TRAY FOR SLICES
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, wheelRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#1A212B';
    ctx.fill();
    ctx.restore();

    if (N === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, wheelRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();
      ctx.restore();
      return;
    }

    const sectionAngleDeg = 360 / N;
    const degToRad = (deg: number) => (deg * Math.PI) / 180;

    // 6. WHEEL SLICES (3D CLAYMORPHIC / PILLOWY PUFFY WEDGES)
    for (let i = 0; i < N; i++) {
      const item = items[i];
      const centerAngleDeg = -90 + i * sectionAngleDeg + rotationDeg;
      const startAngleRad = degToRad(centerAngleDeg - sectionAngleDeg / 2);
      const endAngleRad = degToRad(centerAngleDeg + sectionAngleDeg / 2);
      const isWinner = !isSpinning && winningIndex === i;

      const cachedImg = item.image ? imageCacheRef.current.get(item.image) : undefined;
      const hasImage = Boolean(cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0);

      ctx.save();

      // Main slice wedge
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, wheelRadius, startAngleRad, endAngleRad);
      ctx.closePath();

      // Base vibrant color
      ctx.fillStyle = item.color || '#3B82F6';
      ctx.fill();

      // 3D Pillowy / Claymorphic lighting overlay
      // Light source positioned towards the top of the wheel
      const midAngleRad = (startAngleRad + endAngleRad) / 2;
      const midX = cx + Math.cos(midAngleRad) * (wheelRadius * 0.55);
      const midY = cy + Math.sin(midAngleRad) * (wheelRadius * 0.55);

      const sliceShineGrad = ctx.createRadialGradient(
        midX,
        midY - wheelRadius * 0.15,
        10,
        midX,
        midY,
        wheelRadius * 0.65
      );
      sliceShineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      sliceShineGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
      sliceShineGrad.addColorStop(1, 'rgba(0, 0, 0, 0.18)');

      ctx.fillStyle = sliceShineGrad;
      ctx.fill();

      // Winner highlight glow
      if (isWinner) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
      }

      // Outer rim ambient shadow on wedge edge
      ctx.beginPath();
      ctx.arc(cx, cy, wheelRadius - 1, startAngleRad, endAngleRad);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.restore();

      // Content inside slice: Image / Emoji Badge & Large Bold Text Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(degToRad(centerAngleDeg));

      const badgeRadius =
        sizeVariant === 'compact'
          ? N <= 4
            ? 46
            : N <= 6
            ? 38
            : N <= 8
            ? 30
            : 23
          : N <= 4
          ? 58
          : N <= 6
          ? 48
          : N <= 8
          ? 38
          : 28;

      const badgeCenterDist = wheelRadius - badgeRadius - (sizeVariant === 'compact' ? 12 : 16);

      // Draw Image Badge if item has an image
      if (hasImage && cachedImg) {
        ctx.save();
        // 3D White Badge Base with soft shadow
        ctx.beginPath();
        ctx.arc(badgeCenterDist, 0, badgeRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        ctx.fill();

        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(badgeCenterDist, 0, badgeRadius - 1, 0, Math.PI * 2);
        ctx.clip();

        ctx.translate(badgeCenterDist, 0);
        ctx.rotate(Math.PI / 2); // Orient upright relative to the slice

        const drawDiameter = (badgeRadius - 1) * 2;
        const imgAspect = (cachedImg.naturalWidth || 1) / (cachedImg.naturalHeight || 1);
        let drawW = drawDiameter;
        let drawH = drawDiameter;
        if (imgAspect >= 1) {
          drawW = drawDiameter * imgAspect;
          drawH = drawDiameter;
        } else {
          drawW = drawDiameter;
          drawH = drawDiameter / imgAspect;
        }
        ctx.drawImage(cachedImg, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();
      } else if (item.emoji) {
        // Draw large emoji if no image
        ctx.save();
        ctx.beginPath();
        ctx.arc(badgeCenterDist, 0, badgeRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        ctx.fill();

        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.translate(badgeCenterDist, 0);
        ctx.rotate(Math.PI / 2);
        const emojiSize = Math.round(badgeRadius * 1.35);
        ctx.font = `${emojiSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, 0, 2);
        ctx.restore();
      }

      // Large bold text label designed for classroom projectors
      const labelText = (item.text || `Item ${i + 1}`).trim();
      const capBoundary = hubOuterRadius + (sizeVariant === 'compact' ? 4 : 8);

      // Position text along the wedge with optimal space
      const textAnchorX = hasImage || item.emoji
        ? badgeCenterDist - badgeRadius - (sizeVariant === 'compact' ? 8 : 12)
        : wheelRadius - 20;

      const maxTextWidth = Math.max(30, textAnchorX - capBoundary);

      const baseFont = sizeVariant === 'compact' ? 16 : 21;
      const initialFontSize =
        N <= 4
          ? baseFont + 5
          : N <= 6
          ? baseFont + 2
          : N <= 8
          ? baseFont
          : N <= 10
          ? baseFont - 1
          : N <= 12
          ? baseFont - 3
          : baseFont - 5;

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      let actualFontSize = initialFontSize;
      ctx.font = `800 ${actualFontSize}px 'Fredoka', 'Plus Jakarta Sans', system-ui, sans-serif`;

      while (actualFontSize > 12 && ctx.measureText(labelText).width > maxTextWidth) {
        actualFontSize -= 1;
        ctx.font = `800 ${actualFontSize}px 'Fredoka', 'Plus Jakarta Sans', system-ui, sans-serif`;
      }

      let displayLabel = labelText;
      if (ctx.measureText(displayLabel).width > maxTextWidth && maxTextWidth > 18) {
        while (
          displayLabel.length > 2 &&
          ctx.measureText(displayLabel + '…').width > maxTextWidth
        ) {
          displayLabel = displayLabel.slice(0, -1);
        }
        displayLabel += '…';
      }

      // High contrast label badge for maximum clarity
      if (hasImage) {
        const textMetrics = ctx.measureText(displayLabel);
        const padX = 10;
        const padY = 5;
        const badgeX = textAnchorX - textMetrics.width - padX;
        const badgeY = -actualFontSize / 2 - padY / 2;
        const badgeW = textMetrics.width + padX * 2;
        const badgeH = actualFontSize + padY * 2;

        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }

      // Strong contrast stroke and fill
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.lineWidth = hasImage ? 3 : sizeVariant === 'compact' ? 3.5 : 4.5;
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeText(displayLabel, textAnchorX, 0);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(displayLabel, textAnchorX, 0);

      ctx.restore();
    }

    // 7. DEEP RECESSED GROOVES & HIGHLIGHTS BETWEEN SLICES (3D Molded Divider Seam)
    for (let i = 0; i < N; i++) {
      const boundaryAngleDeg = -90 + i * sectionAngleDeg - sectionAngleDeg / 2 + rotationDeg;
      const rad = degToRad(boundaryAngleDeg);
      const cosA = Math.cos(rad);
      const sinA = Math.sin(rad);

      const startX = cx + cosA * (hubOuterRadius - 2);
      const startY = cy + sinA * (hubOuterRadius - 2);
      const endX = cx + cosA * (wheelRadius + 1);
      const endY = cy + sinA * (wheelRadius + 1);

      ctx.save();
      // Deep dark recessed groove matching reference image
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = '#1A212B';
      ctx.lineWidth = N <= 4 ? 7 : N <= 8 ? 5.5 : 4;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Subtle 3D highlight edge along one side of the groove
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();
    }

    // Winner slice glowing border overlay
    if (!isSpinning && winningIndex !== null && items[winningIndex]) {
      const winCenterDeg = -90 + winningIndex * sectionAngleDeg + rotationDeg;
      const winStartRad = degToRad(winCenterDeg - sectionAngleDeg / 2);
      const winEndRad = degToRad(winCenterDeg + sectionAngleDeg / 2);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, wheelRadius, winStartRad, winEndRad);
      ctx.closePath();
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#FDE047';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.restore();
    }

    // 8. CENTER HUB / "SPIN" BUTTON (Matching reference asset: Dark rim + Gold ring + 3D Orange Dome + White SPIN)
    ctx.save();

    // Layer A: Dark Slate Outer Bezel
    ctx.beginPath();
    ctx.arc(cx, cy, hubOuterRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#2A3340';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.38)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.fill();

    // Layer B: Raised Metallic Gold Bevel Ring
    const goldHubRadius = capR + (sizeVariant === 'compact' ? 6 : 8);
    const hubGoldGrad = ctx.createLinearGradient(
      cx - goldHubRadius,
      cy - goldHubRadius,
      cx + goldHubRadius,
      cy + goldHubRadius
    );
    hubGoldGrad.addColorStop(0, '#FFE875');
    hubGoldGrad.addColorStop(0.3, '#F5BA38');
    hubGoldGrad.addColorStop(0.7, '#D99414');
    hubGoldGrad.addColorStop(1, '#9C6207');

    ctx.beginPath();
    ctx.arc(cx, cy, goldHubRadius, 0, Math.PI * 2);
    ctx.fillStyle = hubGoldGrad;
    ctx.fill();

    // Layer C: Recessed Dark Lip
    const darkLipRadius = capR + 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, darkLipRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#1A212B';
    ctx.fill();

    // Layer D: 3D Glossy Orange Bulbous Dome
    const domeGrad = ctx.createRadialGradient(
      cx,
      cy - capR * 0.38,
      capR * 0.08,
      cx,
      cy,
      capR
    );
    domeGrad.addColorStop(0, '#FFA854');
    domeGrad.addColorStop(0.35, '#FA8223');
    domeGrad.addColorStop(0.75, '#EA580C');
    domeGrad.addColorStop(1, '#C2410C');

    ctx.beginPath();
    ctx.arc(cx, cy, capR, 0, Math.PI * 2);
    ctx.fillStyle = domeGrad;
    ctx.fill();

    // Soft specular highlight curved crest on top of the dome
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy - capR * 0.42, capR * 0.52, capR * 0.22, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.fill();
    ctx.restore();

    // Layer E: 3D Embossed White "SPIN" Text
    const spinFontSize = sizeVariant === 'compact' ? 16 : 19;
    ctx.font = `900 ${spinFontSize}px 'Fredoka', 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 3D bottom extrusion / shadow for embossed letters
    ctx.fillStyle = '#9A3412';
    ctx.fillText('SPIN', cx, cy + (sizeVariant === 'compact' ? 2.5 : 3));

    // Pure white top face
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('SPIN', cx, cy + 0.5);

    ctx.restore();

    ctx.restore();
  }, [items, rotationDeg, isSpinning, winningIndex, imagesVersion, sizeVariant]);

  const canSpin = items.length >= 2 && !isSpinning;

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSpinning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const baseSize = sizeVariant === 'compact' ? 640 : 720;
    const scale = rect.width / baseSize;
    const capR = (sizeVariant === 'compact' ? 38 : 46) * scale;
    const outerR = (baseSize / 2 - 14) * scale;

    // Center button was clicked
    if (dist <= capR) {
      if (canSpin) onSpinClick();
      return;
    }

    // Outer wheel slice was clicked
    if (dist <= outerR && onSlotClick && items.length > 0) {
      const N = items.length;
      const sectionDeg = 360 / N;
      const angleRad = Math.atan2(dy, dx);
      let angleDeg = (angleRad * 180) / Math.PI;

      let relDeg = (angleDeg - rotationDeg + 90 + sectionDeg / 2) % 360;
      if (relDeg < 0) relDeg += 360;
      const sliceIdx = Math.floor(relDeg / sectionDeg) % N;
      onSlotClick(sliceIdx);
      return;
    }

    if (canSpin) onSpinClick();
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none max-w-full">
      {/* Title Label for Wheel */}
      <div className="mb-1 flex items-center gap-2">
        {title && (
          <span className="font-display text-xs sm:text-sm font-bold text-slate-800 bg-white/90 px-3 py-1 rounded-xl shadow-xs border border-slate-200">
            {title} ({items.length} ô)
          </span>
        )}
        {onOpenCsvImport && (
          <button
            type="button"
            onClick={onOpenCsvImport}
            title="Nhập từ và ảnh đồng loạt từ file CSV"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-display text-xs font-bold border border-emerald-300 shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nhập CSV</span>
          </button>
        )}
        {onOpenChangeImages && items.length > 0 && (
          <button
            type="button"
            onClick={onOpenChangeImages}
            title="Thay ảnh vào từng ô của vòng xoay này"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-display text-xs font-bold border border-blue-200 shadow-xs transition-colors cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Thay ảnh các ô</span>
          </button>
        )}
        {onOpenPairMatching && (
          <button
            type="button"
            onClick={onOpenPairMatching}
            title="Cài đặt ghép đôi hợp lý giữa 2 vòng xoay"
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-display text-xs font-bold border shadow-xs transition-all cursor-pointer ${
              dualSpinMode === 'matched'
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{dualSpinMode === 'matched' ? '🔗 Cặp hợp lý (BẬT)' : '🔗 Ghép cặp'}</span>
          </button>
        )}
      </div>

      {/* 3D Stylized Pointer (▼) - Matching reference asset: White rounded outer shell + Raised vibrant red inner triangle */}
      <div className="relative z-20 flex flex-col items-center -mb-5 sm:-mb-6 pointer-events-none">
        <div
          className="transition-transform duration-75 origin-top drop-shadow-lg"
          style={{
            transform: pointerKick ? 'rotate(-14deg) scale(1.06)' : 'rotate(0deg) scale(1)',
          }}
        >
          <svg
            width={sizeVariant === 'compact' ? 44 : 52}
            height={sizeVariant === 'compact' ? 44 : 52}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Wheel Pointer"
          >
            <defs>
              <filter id="pointerShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.4" />
              </filter>
              <linearGradient id="pointerRedGrad" x1="24" y1="10" x2="24" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FF4D55" />
                <stop offset="60%" stopColor="#EF333C" />
                <stop offset="100%" stopColor="#C91B24" />
              </linearGradient>
            </defs>

            {/* Outer 3D White Rounded Shell */}
            <path
              d="M 11 6 C 8.5 6 6.8 8.8 8 11.2 L 21.8 38.6 C 22.8 40.5 25.2 40.5 26.2 38.6 L 40 11.2 C 41.2 8.8 39.5 6 37 6 Z"
              fill="#FFFFFF"
              stroke="#E2E8F0"
              strokeWidth="1.5"
              strokeLinejoin="round"
              filter="url(#pointerShadow)"
            />

            {/* Inner Vibrant 3D Red Rounded Triangle */}
            <path
              d="M 15.5 9.5 C 14.2 9.5 13.2 11 13.9 12.3 L 22.9 31.8 C 23.4 32.8 24.6 32.8 25.1 31.8 L 34.1 12.3 C 34.8 11 33.8 9.5 32.5 9.5 Z"
              fill="url(#pointerRedGrad)"
            />

            {/* Subtle top bevel highlight on red triangle */}
            <path
              d="M 16 11 L 32 11"
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Wheel Canvas Container (Significantly enlarged for high classroom visibility) */}
      <div
        className={`relative flex items-center justify-center ${
          sizeVariant === 'compact'
            ? 'w-[320px] h-[320px] sm:w-[410px] sm:h-[410px] md:w-[440px] md:h-[440px] lg:w-[490px] lg:h-[490px] xl:w-[540px] xl:h-[540px]'
            : 'w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] lg:w-[620px] lg:h-[620px] xl:w-[680px] xl:h-[680px]'
        } ${!isSpinning && winningIndex !== null ? 'winner-wheel-glow' : ''}`}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          title={
            canSpin
              ? `Nhấp vào ô để thay ảnh, hoặc nhấn nút SPIN ở giữa để quay ${title || 'vòng'}`
              : undefined
          }
          className={`w-full h-full block ${canSpin ? 'cursor-pointer' : 'cursor-default'}`}
        />

        {/* Winner Highlight Badge */}
        {!isSpinning && winningIndex !== null && items[winningIndex] && (
          <div className="absolute top-4 right-2 sm:right-6 pointer-events-none animate-bounce bg-amber-400 text-slate-950 font-display font-bold text-xs sm:text-sm px-2.5 py-1 rounded-xl shadow-md border-2 border-white flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Winner: {items[winningIndex].text}</span>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && (
          <div className="absolute inset-6 rounded-full bg-white/95 border-3 border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center shadow-inner">
            <p className="font-display text-base sm:text-lg font-bold text-slate-700 mb-1">
              Chưa có ô nào
            </p>
            <button
              type="button"
              onClick={onAddFirstItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ THÊM Ô</span>
            </button>
          </div>
        )}
      </div>

      {/* Optional individual spin button in dual mode */}
      {showIndividualSpinButton && (
        <button
          type="button"
          disabled={!canSpin}
          onClick={onSpinClick}
          className={`mt-1.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-display text-xs font-bold transition-all shadow-xs ${
            canSpin
              ? 'bg-slate-800 hover:bg-slate-900 text-white active:scale-95 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Quay {title || (wheelId === 'wheel-1' ? 'Vòng 1' : 'Vòng 2')}</span>
        </button>
      )}
    </div>
  );
};
