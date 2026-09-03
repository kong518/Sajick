import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool, Trash2, Sparkles, Check, CheckCircle2 } from 'lucide-react';

interface SignaturePadProps {
  value: string;
  onChange: (signatureDataUrl: string) => void;
  title?: string;
  required?: boolean;
  showReuseOption?: boolean;
  onReuseExisting?: () => void;
  existingSignaturePreview?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  value,
  onChange,
  title = '직접 자필 서명',
  required = true,
  showReuseOption = false,
  onReuseExisting,
  existingSignaturePreview,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const penColor = '#000000'; // Fixed Pure Black Ink
  const penWidth = 4.2; // Uniform bold thickness (선명하고 굵은 검정 잉크 통일)
  const historyRef = useRef<ImageData[]>([]);

  // Setup canvas resolution and DPI
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get display size
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = Math.max(window.devicePixelRatio || 2, 2);

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

    // Clear background to transparent
    ctx.clearRect(0, 0, rect.width, rect.height);
    historyRef.current = [];
    setHasDrawn(false);
  };

  useEffect(() => {
    if (!value) {
      const timer = setTimeout(() => {
        initCanvas();
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [value]);

  useEffect(() => {
    const handleResize = () => {
      if (!value) initCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [value]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save state for undo before drawing new stroke
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current.push(imgData);
    } catch {
      // ignore
    }

    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getCanvasCoordinates(e);

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // prevent scrolling on touch devices
    if ('touches' in e && e.cancelable) {
      e.preventDefault();
    }

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    // User can continue drawing subsequent strokes without automatically locking
  };

  // Complete signature and emit trimmed data URL so signature renders boldly without large margins
  const handleCompleteSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      alert('서명을 작성한 후 [서명 완료] 버튼을 눌러주세요.');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onChange(canvas.toDataURL('image/png'));
      return;
    }

    // Calculate bounding box of drawn pixels
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 10) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          found = true;
        }
      }
    }

    if (!found) {
      onChange(canvas.toDataURL('image/png'));
      return;
    }

    // Add natural padding around bounding box so stroke edges breathe
    const padding = 24;
    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const cropWidth = Math.min(width - cropX, maxX - minX + padding * 2);
    const cropHeight = Math.min(height - cropY, maxY - minY + padding * 2);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cropWidth;
    tempCanvas.height = cropHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      tempCtx.drawImage(
        canvas,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );
      onChange(tempCanvas.toDataURL('image/png'));
    } else {
      onChange(canvas.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    }
    historyRef.current = [];
    setHasDrawn(false);
    onChange('');
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || historyRef.current.length === 0) return;

    const prev = historyRef.current.pop();
    if (prev) {
      ctx.putImageData(prev, 0, 0);
      if (historyRef.current.length === 0) {
        setHasDrawn(false);
      }
    }
  };

  return (
    <div id="signature-pad-container" className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded bg-blue-700"></div>
          <span className="font-bold text-slate-800 text-sm">{title}</span>
          {required && <span className="text-xs text-rose-500 font-bold">* 필수</span>}
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
          <PenTool className="w-3.5 h-3.5 text-blue-700" />
          <span>직접 자필 서명</span>
        </div>
      </div>

      {/* Reuse option button if available */}
      {showReuseOption && onReuseExisting && existingSignaturePreview && (
        <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-blue-900 font-medium">
            <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
            <span>앞서 작성한 서명이 있습니다. 동일하게 적용할까요?</span>
          </div>
          <button
            type="button"
            id="reuse-sig-btn"
            onClick={onReuseExisting}
            className="shrink-0 px-3 py-1 bg-blue-700 text-white rounded text-xs font-bold hover:bg-blue-800 transition shadow-xs"
          >
            동일 서명 적용
          </button>
        </div>
      )}

      {/* When a valid signature exists, show current preview with re-sign option */}
      {value ? (
        <div className="relative border-2 border-emerald-300 border-dashed rounded-xl p-4 bg-emerald-50/30 flex flex-col items-center justify-center min-h-[140px]">
          <div className="text-xs text-emerald-800 mb-2 font-bold flex items-center gap-1.5 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>서명 입력 완료</span>
          </div>
          <div className="h-24 w-full max-w-sm flex items-center justify-center bg-white rounded-lg border border-slate-300 p-2 shadow-inner">
            <img
              src={value}
              alt="직접 서명"
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              id="clear-existing-sig-btn"
              onClick={handleClear}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              서명 다시 작성하기
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Canvas toolbar */}
          <div className="flex items-center justify-end text-xs text-slate-600 px-1 gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyRef.current.length === 0}
                className="px-2.5 py-1 text-slate-600 hover:text-slate-900 rounded bg-slate-100 hover:bg-slate-200 transition text-xs font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                title="한 획 되돌리기"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>되돌리기</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 text-rose-600 hover:text-rose-800 rounded bg-rose-50 hover:bg-rose-100 transition text-xs font-medium flex items-center gap-1"
                title="모두 지우기"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>지우기</span>
              </button>
            </div>
          </div>

          {/* Touch Canvas */}
          <div className="relative border-2 border-slate-300 border-dashed rounded-xl bg-white overflow-hidden shadow-inner touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-44 cursor-crosshair block"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs">
                <PenTool className="w-6 h-6 mb-1 stroke-1 opacity-50 text-blue-700" />
                <span className="font-medium text-slate-600">여기에 손가락이나 마우스로 서명해 주세요</span>
              </div>
            )}
          </div>

          {/* Bottom Actions: Signature Complete Button horizontally aligned without text wrapping */}
          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              id="confirm-signature-btn"
              onClick={handleCompleteSignature}
              disabled={!hasDrawn}
              className={`w-full py-2 px-5 rounded-lg text-xs font-bold flex flex-row items-center justify-center gap-1.5 transition shadow-sm whitespace-nowrap ${
                hasDrawn
                  ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap font-bold tracking-wide">서명 완료</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


