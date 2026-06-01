'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Eye, Flame, MessageCircle, Share2 } from 'lucide-react';
import { Product } from '@/lib/product-api';
import { settingsApi } from '@/lib/settings-api';
import ProductImage from '@/components/ProductImage';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [lineId, setLineId] = useState<string>('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    settingsApi.getPublic().then((settings) => {
      setLineId(settings.social_line || '');
    }).catch(() => {});
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleContact = () => {
    if (lineId) {
      window.open(`https://line.me/ti/p/~${lineId}`, '_blank');
    } else {
      alert('กรุณาติดตั้ง LINE ID ใน Settings');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '');
    const shareUrl = `${siteUrl}/products/${product.id}`;
    const shareText = `ดูสินค้า: ${product.name} ราคา ฿${parseFloat(product.price).toLocaleString()} ${shareUrl}`;
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`, '_blank');
  };

  const imageSrc =
    product.images && product.images.length > 0 ? product.images[0].image_url : null;

  const getBadge = () => {
    if (product.stock <= 5 && product.stock > 0) {
      return {
        text: 'เหลือน้อย',
        icon: <Flame className="w-3 h-3" />,
        color: 'bg-orange-500',
      };
    }
    return null;
  };

  const badge = getBadge();

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 transition-all duration-300 hover:scale-105 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 tilt-card"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-green-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative border-b border-slate-700/50">
        <Link href={`/products/${product.id}`} className="block">
          <ProductImage
            src={imageSrc}
            alt={product.name}
            aspect="4/3"
            className="rounded-none border-0 p-3 sm:aspect-square sm:p-4"
            imageClassName="h-full w-full max-h-full max-w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>

        {badge && (
          <div
            className={`absolute left-3 top-3 ${badge.color} z-10 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg`}
          >
            {badge.icon}
            {badge.text}
          </div>
        )}

        <div className="absolute right-3 top-3 z-10 flex translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
            aria-label={`แชร์ ${product.name}`}
          >
            <Share2 className="h-4 w-4 text-slate-900" />
          </button>
          <Link
            href={`/products/${product.id}`}
            className="rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
            aria-label={`ดู ${product.name}`}
          >
            <Eye className="h-4 w-4 text-slate-900" />
          </Link>
        </div>
      </div>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-white transition-colors group-hover:text-blue-400">
            {product.name}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 h-10 text-sm text-gray-400">{product.description}</p>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-2xl font-bold text-transparent">
              ฿{parseFloat(product.price).toLocaleString()}
            </span>
            {product.category && (
              <span className="ml-2 text-xs text-gray-500">{product.category.name}</span>
            )}
          </div>
          {product.stock > 0 ? (
            <span className="text-sm text-green-400">มีสินค้า</span>
          ) : (
            <span className="text-sm font-medium text-red-400">หมด</span>
          )}
        </div>

        {product.stock > 0 ? (
          <button
            type="button"
            onClick={handleContact}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 py-2.5 font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:scale-105 hover:opacity-90 hover:shadow-green-500/40 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            ติดต่อซื้อสินค้า
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-xl bg-slate-700 py-2.5 font-semibold text-gray-500"
          >
            หมดสินค้า
          </button>
        )}
      </div>
    </div>
  );
}
