'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const resetView = useCallback(() => {
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
  }, []);

  const close = useCallback(() => {
    resetView();
    onClose();
  }, [onClose, resetView]);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const next = Math.max(z - ZOOM_STEP, MIN_ZOOM);
      if (next <= MIN_ZOOM) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === '+' || e.key === '=') zoomIn();
      else if (e.key === '-' || e.key === '_') zoomOut();
      else if (e.key === '0') resetView();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close, zoomIn, zoomOut, resetView]);

  useEffect(() => {
    if (!isOpen) resetView();
  }, [isOpen, src, resetView]);

  const getTouchDistance = (touches: { length: number; 0?: Touch; 1?: Touch }) => {
    if (touches.length < 2 || !touches[0] || !touches[1]) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom <= MIN_ZOOM) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || zoom <= MIN_ZOOM) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStart.current = {
        distance: getTouchDistance(e.touches),
        zoom,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStart.current) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      if (pinchStart.current.distance > 0) {
        const ratio = distance / pinchStart.current.distance;
        const next = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, pinchStart.current.zoom * ratio)
        );
        setZoom(next);
        if (next <= MIN_ZOOM) setPan({ x: 0, y: 0 });
      }
    }
  };

  const handleTouchEnd = () => {
    pinchStart.current = null;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 animate-fade-in-up"
      role="dialog"
      aria-modal="true"
      aria-label={`ขยายรูป: ${alt}`}
      onClick={close}
    >
      <button
        type="button"
        className="absolute top-3 right-3 z-20 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-400"
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        aria-label="ปิด"
      >
        <X className="h-8 w-8" />
      </button>

      <p className="absolute top-4 left-4 z-20 hidden rounded bg-black/50 px-2 py-1 text-xs text-white/60 sm:block">
        ESC ปิด | +/- ซูม | ลากเลื่อนเมื่อซูม | บีบนิ้วซูม (มือถือ)
      </p>

      <div
        ref={viewportRef}
        className="flex flex-1 items-center justify-center overflow-auto overscroll-contain touch-pan-y p-4 pt-14 pb-20 sm:p-8"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="max-h-[min(85dvh,85vh)] max-w-[min(100%,96vw)] select-none object-contain object-center transition-transform duration-150 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            cursor: zoom > MIN_ZOOM ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (zoom <= MIN_ZOOM) zoomIn();
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>

      <div
        className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-4 py-2 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={zoomOut}
          disabled={zoom <= MIN_ZOOM}
          className="rounded-full p-2 text-white hover:bg-white/10 disabled:opacity-40"
          aria-label="ซูมออก"
        >
          <span className="text-xl font-bold leading-none">−</span>
        </button>
        <span className="min-w-[3.5rem] text-center text-sm font-medium text-white">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={zoomIn}
          disabled={zoom >= MAX_ZOOM}
          className="rounded-full p-2 text-white hover:bg-white/10 disabled:opacity-40"
          aria-label="ซูมเข้า"
        >
          <span className="text-xl font-bold leading-none">+</span>
        </button>
        <button
          type="button"
          onClick={resetView}
          className="rounded-full px-3 py-2 text-xs text-white hover:bg-white/10"
          aria-label="รีเซ็ตการซูม"
        >
          รีเซ็ต
        </button>
      </div>
    </div>
  );
}
