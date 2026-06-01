'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { getImageUrl } from '@/lib/image';

type ProductImageAspect = 'square' | '4/3' | 'auto';

interface ProductImageProps {
  src: string | null | undefined;
  alt: string;
  /** กรอบรูป — square สำหรับการ์ด, 4/3 สำหรับแนวนอน, auto ไม่บังคับ aspect */
  aspect?: ProductImageAspect;
  priority?: boolean;
  onClick?: () => void;
  className?: string;
  imageClassName?: string;
  /** ขนาดสูงสุดของรูป (เช่น หน้ารายละเอียด) */
  maxHeightClass?: string;
  showShimmer?: boolean;
}

const aspectClasses: Record<ProductImageAspect, string> = {
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  auto: 'min-h-[12rem]',
};

export default function ProductImage({
  src,
  alt,
  aspect = 'square',
  priority = false,
  onClick,
  className,
  imageClassName,
  maxHeightClass,
  showShimmer = true,
}: ProductImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const resolved = src && !failed ? getImageUrl(src) : null;

  const frameClass = clsx(
    'product-image-frame relative flex w-full items-center justify-center overflow-hidden bg-slate-900/90',
    aspect !== 'auto' && aspectClasses[aspect],
    className
  );

  if (!resolved) {
    return (
      <div className={frameClass} role="img" aria-label={alt}>
        <div className="flex h-full min-h-[8rem] w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          <svg
            className="mx-auto h-16 w-16 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      className={frameClass}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `ขยายรูป ${alt}` : undefined}
    >
      {showShimmer && !loaded && (
        <div
          className="absolute inset-0 animate-shimmer bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
          aria-hidden
        />
      )}
      <img
        src={resolved}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={clsx(
          'product-image-contain block max-h-full max-w-full object-contain object-center transition-opacity duration-300',
          maxHeightClass,
          loaded ? 'opacity-100' : 'opacity-0',
          onClick && 'cursor-zoom-in',
          imageClassName
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setFailed(true);
          setLoaded(true);
        }}
      />
    </div>
  );
}
