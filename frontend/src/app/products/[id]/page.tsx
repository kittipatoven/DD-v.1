'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { productApi, Product } from '@/lib/product-api';
import { useAuthStore } from '@/store/auth-store';
import { settingsApi } from '@/lib/settings-api';
import { MessageCircle, ArrowLeft, Star, Share2, Copy, Facebook, Twitter, ZoomIn } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import ProductImage from '@/components/ProductImage';
import ImageLightbox from '@/components/ImageLightbox';
import { getImageUrl } from '@/lib/image';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [lineId, setLineId] = useState<string>('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchProduct();
    // Fetch LINE ID from settings
    console.log('[ProductDetail] Fetching settings...');
    settingsApi.getPublic().then(settings => {
      console.log('[ProductDetail] Settings received:', settings);
      console.log('[ProductDetail] social_line value:', settings.social_line);
      setLineId(settings.social_line || '');
      console.log('[ProductDetail] lineId set to:', settings.social_line || '');
    }).catch(err => {
      console.error('[ProductDetail] Failed to fetch settings:', err);
    });
  }, [params.id]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productApi.getById(Number(params.id));
      console.log('[DEBUG PRODUCT] Product data:', data);
      console.log('[DEBUG PRODUCT] Product images:', data.images);
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!product) return;

    console.log('[ProductDetail] handleContact called');
    console.log('[ProductDetail] Current lineId state:', lineId);
    console.log('[ProductDetail] lineId type:', typeof lineId);
    console.log('[ProductDetail] lineId length:', lineId.length);

    if (lineId) {
      const url = `https://line.me/ti/p/~${lineId}`;
      console.log('[ProductDetail] Opening LINE URL:', url);
      window.open(url, '_blank');
    } else {
      console.error('[ProductDetail] lineId is empty, showing alert');
      alert('กรุณาติดตั้ง LINE ID ใน Settings');
    }
  };

  const handleShare = async () => {
    if (!product) return;

    if (typeof window === 'undefined') return;

    const url = window.location.href;
    const shareText = `ดูสินค้า: ${product.name} ราคา ฿${parseFloat(product.price).toLocaleString()}`;

    // Mobile: Use Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: shareText,
          url,
        });
        setToast({ type: 'success', message: 'แชร์สำเร็จ!' });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.log('Share cancelled or failed:', err);
        }
      }
    } else {
      // Desktop: Show share menu
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyToClipboard = async () => {
    if (typeof window === 'undefined') return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ type: 'success', message: 'คัดลอกลิงก์แล้ว!' });
      setShowShareMenu(false);
    } catch (err) {
      console.error('Failed to copy:', err);
      setToast({ type: 'error', message: 'คัดลอกลิงก์ไม่สำเร็จ' });
    }
  };

  const shareToSocial = (platform: 'facebook' | 'twitter' | 'line') => {
    if (!product || typeof window === 'undefined') return;

    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`ดูสินค้า: ${product.name} ราคา ฿${parseFloat(product.price).toLocaleString()}`);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      line: `https://social-plugins.line.me/lineit/share?url=${url}`,
    };

    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };


  const getProductImage = (product: Product, index: number = 0) => {
    console.log('[DEBUG PRODUCT] getProductImage called with index:', index);
    console.log('[DEBUG PRODUCT] product.images:', product.images);
    console.log('[DEBUG PRODUCT] images length:', product.images?.length);
    
    if (product.images && product.images.length > 0 && product.images[index]) {
      const imageUrl = product.images[index].image_url;
      console.log('[DEBUG PRODUCT] imageUrl:', imageUrl);
      const fullUrl = getImageUrl(imageUrl);
      console.log('[DEBUG PRODUCT] fullUrl:', fullUrl);
      return fullUrl;
    }
    console.log('[DEBUG PRODUCT] No images found, returning null');
    return null;
  };

  // Parse specification from description
  const parseSpecification = (description: string) => {
    // Split the description by looking for patterns like "Label: Value"
    // This works for both Thai and English labels
    const parts = description.split(/(?=\s*[^\s:]+:)/);
    
    const specs: { label: string; value: string }[] = [];

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const label = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();
        if (label && value) {
          specs.push({ label, value });
        }
      }
    }

    return specs;
  };

  const openLightbox = (imageUrl: string) => {
    setLightboxSrc(imageUrl);
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handlePreviousImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setSelectedImageIndex((prev) => (prev === 0 ? product.images!.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product || !product.images || product.images.length === 0) return;
    setSelectedImageIndex((prev) => (prev === product.images!.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loading text="กำลังโหลด..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">ไม่พบสินค้า</div>
      </div>
    );
  }

  const imageUrl = getProductImage(product, selectedImageIndex);

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="bg-slate-800 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              กลับ
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="group relative rounded-2xl border border-slate-700 bg-slate-800">
                {imageUrl ? (
                  <>
                    {product.images && product.images.length > 1 && (
                      <button
                        type="button"
                        onClick={handlePreviousImage}
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-100 transition-all hover:bg-black/70 sm:left-4 sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="รูปก่อนหน้า"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    <ProductImage
                      src={product.images?.[selectedImageIndex]?.image_url}
                      alt={product.name}
                      aspect="auto"
                      priority
                      onClick={() => openLightbox(imageUrl)}
                      className="min-h-[min(400px,55vh)] w-full rounded-2xl p-4 sm:min-h-[min(500px,60vh)] lg:min-h-[min(560px,70vh)]"
                      imageClassName="max-h-[min(520px,calc(70vh-3rem))] w-auto max-w-full cursor-zoom-in"
                    />

                    {product.images && product.images.length > 1 && (
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white opacity-100 transition-all hover:bg-black/70 sm:right-4 sm:opacity-0 sm:group-hover:opacity-100"
                        aria-label="รูปถัดไป"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                      <ZoomIn className="h-12 w-12 text-white drop-shadow-lg" aria-hidden />
                    </div>
                  </>
                ) : (
                  <ProductImage src={null} alt={product.name} aspect="auto" className="min-h-[20rem] rounded-2xl" />
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => {
                    const thumbUrl = getImageUrl(image.image_url);
                    const isSelected = index === selectedImageIndex;
                    return (
                      <button
                        type="button"
                        key={index}
                        className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/50'
                            : 'border-slate-700 hover:border-blue-500'
                        }`}
                        onClick={() => handleThumbnailClick(index)}
                        onDoubleClick={() => openLightbox(thumbUrl)}
                        aria-label={`เลือกรูปที่ ${index + 1}`}
                        aria-current={isSelected ? 'true' : undefined}
                      >
                        <ProductImage
                          src={image.image_url}
                          alt={`${product.name} รูปที่ ${index + 1}`}
                          aspect="square"
                          className="rounded-none border-0 p-1"
                          imageClassName={isSelected ? 'opacity-100' : 'opacity-80'}
                          showShimmer={false}
                        />
                        {isSelected && (
                          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
                            {index + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category Badge */}
              {product.category && (
                <Badge variant="info">{product.category.name}</Badge>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                  ฿{parseFloat(product.price).toLocaleString()}
                </span>
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge variant="warning">เหลือน้อย</Badge>
                )}
              </div>

              {/* Description / Specification */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">รายละเอียดสินค้า</h3>
                {(() => {
                  console.log('[DEBUG] Description:', JSON.stringify(product.description));
                  const lines = product.description.split('\n');
                  return (
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <div className="text-gray-300 text-lg">
                        {lines.map((line, index) => (
                          <p key={index} className={line.trim() ? 'mb-2' : ''}>
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <label className="text-white font-semibold">จำนวน:</label>
                <div className="flex items-center gap-4 bg-slate-800 rounded-xl border border-slate-700 px-4 py-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-gray-400 hover:text-white text-2xl font-bold"
                  >
                    -
                  </button>
                  <span className="text-white text-xl font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="text-gray-400 hover:text-white text-2xl font-bold disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <span className="text-gray-400 text-sm">
                  มีสินค้า {product.stock} ชิ้น
                </span>
              </div>

              {/* Contact to Buy Button */}
              {product.stock > 0 ? (
                <div className="flex gap-3 relative">
                  <Button
                    onClick={handleContact}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    ติดต่อซื้อสินค้า
                  </Button>
                  <div className="relative" ref={shareMenuRef}>
                    <Button
                      onClick={handleShare}
                      size="lg"
                      variant="outline"
                      className="px-4 group relative"
                    >
                      <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Button>
                    
                    {/* Share Menu Dropdown */}
                    {showShareMenu && (
                      <div className="absolute right-0 top-full mt-2 w-56 glass-enhanced rounded-xl border border-slate-700 shadow-2xl z-50 animate-fade-in-up">
                        <div className="p-2 space-y-1">
                          <button
                            onClick={copyToClipboard}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            <span>คัดลอกลิงก์</span>
                          </button>
                          <button
                            onClick={() => shareToSocial('facebook')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                          >
                            <Facebook className="w-4 h-4" />
                            <span>แชร์ไป Facebook</span>
                          </button>
                          <button
                            onClick={() => shareToSocial('twitter')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                          >
                            <Twitter className="w-4 h-4" />
                            <span>แชร์ไป Twitter</span>
                          </button>
                          <button
                            onClick={() => shareToSocial('line')}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>แชร์ไป LINE</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Button
                  disabled
                  size="lg"
                  variant="secondary"
                  className="w-full"
                >
                  หมดสินค้า
                </Button>
              )}

              {/* Reviews */}
              <div className="pt-6 border-t border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">รีวิว</h3>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {product.reviews.map((review: any) => (
                      <div key={review.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'fill-none'}`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-400 text-sm">
                            {review.rating}/5
                          </span>
                        </div>
                        <p className="text-gray-300">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">ยังไม่มีรีวิว</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {lightboxSrc && (
        <ImageLightbox
          src={lightboxSrc}
          alt={product.name}
          isOpen={Boolean(lightboxSrc)}
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </div>
  );
}
