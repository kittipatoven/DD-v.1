'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategoryCards from '@/components/CategoryCards';
import HighlightSection from '@/components/HighlightSection';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { productApi, Product } from '@/lib/product-api';
import { useAuthStore } from '@/store/auth-store';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const data = await productApi.getAll({ limit: 8 });
      setFeaturedProducts(data.products);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <Hero />
      <CategoryCards />
      <HighlightSection />
      
      {/* Featured Products */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-fade-in-up">
              สินค้าแนะนำ
            </h2>
            <p className="text-gray-400 text-lg animate-fade-in-up stagger-1">
              สินค้าที่คุณไม่ควรพลาด
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-slate-700 rounded-2xl h-80 animate-shimmer"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <div key={product.id} className={`animate-fade-in-up stagger-${Math.min(index + 1, 8)}`}>
                  <ProductCard
                    product={product}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12 animate-fade-in-up">
            <a
              href="/products"
              className="inline-block bg-gradient-to-r from-blue-500 to-green-500 text-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              ดูสินค้าทั้งหมด
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
