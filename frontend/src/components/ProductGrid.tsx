'use client';

import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { Product } from '@/lib/product-api';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700 animate-pulse"
          >
            <div className="h-48 bg-slate-700" />
            <div className="p-4 space-y-4">
              <div className="h-4 bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-700 rounded w-1/2" />
              <div className="h-8 bg-slate-700 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-500 text-6xl mb-4">📦</div>
        <h3 className="text-xl font-semibold text-gray-400 mb-2">ไม่พบสินค้า</h3>
        <p className="text-gray-500">ลองเปลี่ยนตัวกรองหรือค้นหาด้วยคำอื่น</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
