'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { productApi, Product } from '@/lib/product-api';
import { categoryApi } from '@/lib/category-api';
import { useAuthStore } from '@/store/auth-store';
import { Search, Filter, ChevronLeft, ChevronRight, Package, X } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  
  // Sort
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  
  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const { isAuthenticated } = useAuthStore();

  // Map category slugs to category names
  const categorySlugToName: Record<string, string> = {
    'pc-assembled': 'PC ประกอบ',
    'notebook': 'Notebook',
    'accessories': 'อุปกรณ์เสริม',
    'monitor': 'Monitor',
  };

  // Handle category from URL query parameter
  useEffect(() => {
    const categorySlug = searchParams.get('category');
    if (categorySlug && categorySlugToName[categorySlug]) {
      // Find the category ID from the fetched categories
      const category = categories.find(cat => cat.name === categorySlugToName[categorySlug]);
      if (category) {
        setSelectedCategory(category.id);
      }
    }
  }, [searchParams, categories]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [page, selectedCategory, selectedType, selectedBrand, minPrice, maxPrice, sortBy, sortOrder, search]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 500);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [search, selectedCategory, minPrice, maxPrice]);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getAll({
        page,
        limit,
        search: search || undefined,
        categoryId: selectedCategory,
        type: selectedType,
        brand: selectedBrand,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
      });
      setProducts(data.products);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / limit);

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedType(undefined);
    setSelectedBrand(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSortBy('created_at');
    setSortOrder('DESC');
    setSearch('');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      <main className="pt-20">
        {/* Header */}
        <div className="bg-slate-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              สินค้าทั้งหมด
            </h1>
            <p className="text-gray-400 text-lg">
              ค้นหาสินค้าที่คุณต้องการ
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter Bar */}
          <div className="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  showFilters
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ประเภทสินค้า
                    </label>
                    <select
                      value={selectedType || ''}
                      onChange={(e) => {
                        setSelectedType(e.target.value || undefined);
                        setSelectedBrand(undefined); // Reset brand when type changes
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">ทั้งหมด</option>
                      <option value="notebook">Notebook</option>
                      <option value="pc">PC ประกอบ</option>
                    </select>
                  </div>

                  {/* Brand Filter (only show when notebook is selected) */}
                  {selectedType === 'notebook' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ยี่ห้อ
                      </label>
                      <select
                        value={selectedBrand || ''}
                        onChange={(e) => setSelectedBrand(e.target.value || undefined)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">ทุกยี่ห้อ</option>
                        <option value="ASUS">ASUS</option>
                        <option value="Acer">Acer</option>
                        <option value="MSI">MSI</option>
                        <option value="Lenovo">Lenovo</option>
                        <option value="HP">HP</option>
                        <option value="Dell">Dell</option>
                      </select>
                    </div>
                  )}

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory || ''}
                      onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Min Price Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Min Price
                    </label>
                    <input
                      type="number"
                      placeholder="Min price"
                      value={minPrice || ''}
                      onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Max Price Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Price
                    </label>
                    <input
                      type="number"
                      placeholder="Max price"
                      value={maxPrice || ''}
                      onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sort by
                    </label>
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-');
                        setSortBy(sortBy);
                        setSortOrder(sortOrder as 'ASC' | 'DESC');
                      }}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="created_at-DESC">Newest First</option>
                      <option value="created_at-ASC">Oldest First</option>
                      <option value="price-ASC">Price: Low to High</option>
                      <option value="price-DESC">Price: High to Low</option>
                      <option value="name-ASC">Name: A to Z</option>
                      <option value="name-DESC">Name: Z to A</option>
                      <option value="stock-DESC">Stock: High to Low</option>
                      <option value="stock-ASC">Stock: Low to High</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 pt-4 border-t border-slate-700 flex gap-2">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              </div>
            )}

            {/* Results Count */}
            <div className="text-sm text-gray-400 mt-4">
              Showing {products.length} of {total} products
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-slate-800 rounded-2xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {products.length === 0 && !loading && (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">ไม่พบสินค้า</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-400 hover:text-blue-300 font-semibold"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                      : 'bg-slate-800 border border-slate-700 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-gray-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>}>
      <ProductsContent />
    </Suspense>
  );
}
