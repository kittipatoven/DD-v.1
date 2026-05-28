'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSidebarProps {
  categories: { id: number; name: string }[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  inStockOnly: boolean;
  onInStockChange: (inStock: boolean) => void;
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  inStockOnly,
  onInStockChange,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    stock: true,
  });

  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceApply = () => {
    onPriceChange(localMinPrice, localMaxPrice);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">ตัวกรอง</h2>
        <button
          onClick={() => {
            onCategoryChange(null);
            onPriceChange(0, 100000);
            onInStockChange(false);
            setLocalMinPrice(0);
            setLocalMaxPrice(100000);
          }}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          รีเซ็ต
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h3 className="text-white font-semibold">หมวดหมู่</h3>
          {expandedSections.category ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        <AnimatePresence>
          {expandedSections.category && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-2">
                <button
                  onClick={() => onCategoryChange(null)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                      : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  ทั้งหมด
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                        : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h3 className="text-white font-semibold">ช่วงราคา</h3>
          {expandedSections.price ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">ราคาต่ำสุด</label>
                  <input
                    type="number"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">ราคาสูงสุด</label>
                  <input
                    type="number"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="100000"
                  />
                </div>
                <button
                  onClick={handlePriceApply}
                  className="w-full bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-lg px-4 py-2 font-semibold hover:bg-blue-500/30 transition-colors"
                >
                  ใช้ช่วงราคา
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stock Filter */}
      <div>
        <button
          onClick={() => toggleSection('stock')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <h3 className="text-white font-semibold">สถานะสินค้า</h3>
          {expandedSections.stock ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        <AnimatePresence>
          {expandedSections.stock && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => onInStockChange(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="text-gray-400">แสดงเฉพาะที่มีสินค้า</span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
