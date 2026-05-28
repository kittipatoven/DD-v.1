'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Eye, Flame, Sparkles, Recycle, MessageCircle, Share2 } from 'lucide-react';
import { Product } from '@/lib/product-api';
import { getImageUrl } from '@/lib/image';
import { settingsApi } from '@/lib/settings-api';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [lineId, setLineId] = useState<string>('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch LINE ID from settings
    console.log('[ProductCard] Fetching settings...');
    settingsApi.getPublic().then(settings => {
      console.log('[ProductCard] Settings received:', settings);
      console.log('[ProductCard] social_line value:', settings.social_line);
      setLineId(settings.social_line || '');
      console.log('[ProductCard] lineId set to:', settings.social_line || '');
    }).catch(err => {
      console.error('[ProductCard] Failed to fetch settings:', err);
    });
  }, []);

  useEffect(() => {
    setIsLoaded(true);
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
    console.log('[ProductCard] handleContact called');
    console.log('[ProductCard] Current lineId state:', lineId);
    console.log('[ProductCard] lineId type:', typeof lineId);
    console.log('[ProductCard] lineId length:', lineId.length);

    if (lineId) {
      const url = `https://line.me/ti/p/~${lineId}`;
      console.log('[ProductCard] Opening LINE URL:', url);
      window.open(url, '_blank');
    } else {
      console.error('[ProductCard] lineId is empty, showing alert');
      alert('กรุณาติดตั้ง LINE ID ใน Settings');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const shareUrl = `${siteUrl}/products/${product.id}`;
    const shareText = `ดูสินค้า: ${product.name} ราคา ฿${parseFloat(product.price).toLocaleString()} ${shareUrl}`;

    const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;
    console.log('[ProductCard] Sharing via LINE:', lineShareUrl);
    window.open(lineShareUrl, '_blank');
  };

  console.log('[ProductCard DEBUG] ProductCard component rendered');
  console.log('[ProductCard DEBUG] Product:', product);

  const getProductImage = (product: Product) => {
    console.log('[ProductCard DEBUG] Product:', product);
    console.log('[ProductCard DEBUG] Product.images:', product.images);
    console.log('[ProductCard DEBUG] Images length:', product.images?.length);
    
    if (product.images && product.images.length > 0) {
      const imageUrl = product.images[0].image_url;
      console.log('[ProductCard DEBUG] Image URL from DB:', imageUrl);
      const fullUrl = getImageUrl(imageUrl);
      console.log('[ProductCard DEBUG] Final image URL:', fullUrl);
      return fullUrl;
    }
    console.log('[ProductCard DEBUG] No images, will use placeholder');
    return null;
  };

  const getBadge = () => {
    console.log('[ProductCard DEBUG] Calculating badge for product:', product);
    if (product.stock <= 5 && product.stock > 0) {
      console.log('[ProductCard DEBUG] Product has low stock, displaying badge');
      return {
        text: 'เหลือน้อย',
        icon: <Flame className="w-3 h-3" />,
        color: 'bg-orange-500',
      };
    }
    // You can add more badge logic based on product properties
    return null;
  };

  const badge = getBadge();
  const imageUrl = getProductImage(product);

  return (
    <div
      ref={cardRef}
      className="group bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 tilt-card relative"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block relative h-48 overflow-hidden bg-slate-900">
        {imageUrl ? (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 animate-shimmer" />
            )}
            <img
              src={imageUrl}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                console.error('[ProductCard] Image failed to load:', imageUrl);
                e.currentTarget.src = '/placeholder.png';
                setIsLoaded(true);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-gray-600">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        )}
        
        {/* Badge */}
        {badge && (
          <div className={`absolute top-3 left-3 ${badge.color} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 animate-bounce shadow-lg shadow-${badge.color.replace('bg-', '')}/30`}>
            {badge.icon}
            {badge.text}
          </div>
        )}

        {/* Quick View Button */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleShare}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg hover:shadow-blue-500/30"
          >
            <Share2 className="w-4 h-4 text-slate-900" />
          </button>
          <Link
            href={`/products/${product.id}`}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg hover:shadow-blue-500/30"
          >
            <Eye className="w-4 h-4 text-slate-900" />
          </Link>
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
          {product.description}
        </p>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              ฿{parseFloat(product.price).toLocaleString()}
            </span>
            {product.category && (
              <span className="text-xs text-gray-500 ml-2">
                {product.category.name}
              </span>
            )}
          </div>
          {product.stock > 0 ? (
            <span className="text-green-400 text-sm">มีสินค้า</span>
          ) : (
            <span className="text-red-400 text-sm font-medium">หมด</span>
          )}
        </div>

        {/* Action Button */}
        {product.stock > 0 ? (
          <button
            onClick={handleContact}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
          >
            <MessageCircle className="w-4 h-4" />
            ติดต่อซื้อสินค้า
          </button>
        ) : (
          <button
            disabled
            className="w-full bg-slate-700 text-gray-500 py-2.5 rounded-xl font-semibold cursor-not-allowed"
          >
            หมดสินค้า
          </button>
        )}
      </div>
    </div>
  );
}
