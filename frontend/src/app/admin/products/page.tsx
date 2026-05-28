'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { productApi, Product } from '@/lib/product-api';
import { categoryApi, Category } from '@/lib/category-api';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopbar from '@/components/AdminTopbar';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Package, Plus, Edit, Trash2, Search, Eye, Cpu, Upload, X, PlusCircle, Zap, Layers, TrendingUp } from 'lucide-react';
import { getImageUrl } from '@/lib/image';

export default function AdminProductsPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    type: 'pc',
    brand: '',
    stock: '',
    status: 'active',
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [variants, setVariants] = useState<{ name: string; price: string; stock: string }[]>([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      window.location.href = '/login';
      return;
    }

    fetchData();
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productApi.getAll({ limit: 100 }),
        categoryApi.getAll(),
      ]);
      setProducts(productsData.products);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[DEBUG] handleSubmit called');
    console.log('[DEBUG] uploadedImages:', uploadedImages);
    console.log('[DEBUG] uploadedImages length:', uploadedImages.length);
    
    try {
      // Images are already uploaded, use the URLs directly
      const imageUrls = uploadedImages;
      console.log('[DEBUG] Using uploaded image URLs:', imageUrls);

      const data: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        type: formData.type,
        brand: formData.type === 'notebook' ? formData.brand : null,
        stock: parseInt(formData.stock),
        status: formData.status,
      };

      // Add image URLs if any
      if (imageUrls.length > 0) {
        data.image_urls = imageUrls;
        console.log('[DEBUG] Adding image_urls to data:', data.image_urls);
      }

      console.log('[DEBUG] Creating/updating product with data:', data);
      
      if (editingProduct) {
        await productApi.update(editingProduct.id, data);
        console.log('[DEBUG] Product updated successfully');
      } else {
        await productApi.create(data);
        console.log('[DEBUG] Product created successfully');
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        type: 'pc',
        brand: '',
        stock: '',
        status: 'active',
      });
      setUploadedImages([]);
      setImagePreviews([]);
      fetchData();
    } catch (error) {
      console.error('[DEBUG] Failed to save product:', error);
      alert('ไม่สามารถบันทึกสินค้าได้');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id.toString(),
      type: (product as any).type || 'pc',
      brand: (product as any).brand || '',
      stock: product.stock.toString(),
      status: product.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('คุณแน่ใจหรือที่จะลบสินค้านี้?')) {
      try {
        await productApi.delete(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('ไม่สามารถลบสินค้าได้');
      }
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category_id: '',
      type: 'pc',
      brand: '',
      stock: '',
      status: 'active',
    });
    setUploadedImages([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('[DEBUG] Drag over triggered');
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('[DEBUG] Drag leave triggered');
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    console.log('[DEBUG] Drop triggered');
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('[DEBUG] Files dropped:', files);
    handleImageUpload(files);
  };

  const handleImageUpload = async (files: File[]) => {
    console.log('[DEBUG] handleImageUpload called with files:', files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    console.log('[DEBUG] Filtered image files:', imageFiles);

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    for (const file of imageFiles) {
      try {
        console.log('[DEBUG] Uploading file:', file.name);
        const res = await productApi.uploadImage(file);
        console.log('[DEBUG] Upload response:', res);

        const fullUrl = getImageUrl(res.url) as string;
        console.log('[DEBUG] Full URL:', fullUrl);

        // Set preview with full URL
        setImagePreviews(prev => [...prev, fullUrl]);

        // Set uploadedImages with full URL
        setUploadedImages(prev => [...prev, fullUrl]);
      } catch (error) {
        console.error('[DEBUG] Upload failed for file:', file.name, error);
        alert(`ไม่สามารถอัปโหลดรูป ${file.name} ได้`);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddVariant = () => {
    setVariants(prev => [...prev, { name: '', price: '', stock: '' }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const handleLogout = () => {
    logout(); // Fire-and-forget
    window.location.href = '/login';
  };

  const getImageUrl = (img?: string) => {
    if (!img) return null;

    // If already a full URL, return as-is
    if (img.startsWith('http')) {
      // Reject fake URLs
      if (img.includes('example.com') || img.includes('fake') || img.includes('test')) {
        console.warn('[DEBUG ADMIN] Rejecting fake URL:', img);
        return null;
      }
      return img;
    }

    // If it's a path, prepend BASE_URL
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const fullUrl = `${BASE_URL}${img}`;
    console.log('[DEBUG ADMIN] getImageUrl:', { img, fullUrl });
    return fullUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loading text="กำลังโหลดสินค้า..." />
      </div>
    );
  }

  const columns = [
    {
      key: 'name' as keyof Product,
      label: 'ชื่อสินค้า',
      render: (value: string, row: Product) => {
        const imageUrl = getImageUrl((row as any)?.images?.[0]?.image_url);
        return (
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={value}
                className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                onError={(e) => {
                  console.error('[DEBUG ADMIN] Image failed to load:', imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700">
                <Package className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <span className="font-medium text-white">{value}</span>
          </div>
        );
      },
    },
    {
      key: 'category' as keyof Product,
      label: 'หมวดหมู่',
      render: (_: any, row: Product) => (
        <Badge variant="default">{row.category?.name || '-'}</Badge>
      ),
    },
    {
      key: 'price' as keyof Product,
      label: 'ราคา',
      render: (value: string) => (
        <span className="font-semibold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          ฿{parseFloat(value).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'stock' as keyof Product,
      label: 'สต็อก',
      render: (value: number) => (
        <Badge variant={value <= 5 ? 'danger' : value <= 20 ? 'warning' : 'success'}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'status' as keyof Product,
      label: 'สถานะ',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'success' : 'danger'}>
          {value === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
        </Badge>
      ),
    },
    {
      key: 'actions' as keyof Product,
      label: 'การจัดการ',
      render: (_: any, row: Product) => (
        <div className="flex items-center gap-2">
          <Link href={`/products/${row.id}`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-neon-purple hover:text-purple-300 hover:bg-neon-purple/20 rounded-lg transition-all"
              title="ดูตัวอย่าง"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleEdit(row)}
            className="p-2 text-neon-blue hover:text-blue-300 hover:bg-neon-blue/20 rounded-lg transition-all"
            title="แก้ไข"
          >
            <Edit className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDelete(row.id)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
            title="ลบ"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <AdminSidebar />
      
      <main className="flex-1">
        <AdminTopbar />

        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Cpu className="w-8 h-8 text-neon-green" />
              จัดการสินค้า
            </h1>
            <p className="text-gray-400 mt-2">ดูแลและจัดการสินค้าทั้งหมด - DD Computer</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card hover glow className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 rounded-full blur-3xl group-hover:bg-neon-green/10 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-400 text-sm mb-1">สินค้าทั้งหมด</p>
                  <motion.p 
                    whileHover={{ scale: 1.1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {products.length}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-neon-green/20 p-4 rounded-xl border border-neon-green/30 shadow-glow"
                >
                  <Package className="w-8 h-8 text-neon-green" />
                </motion.div>
              </div>
            </Card>

            <Card hover className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl group-hover:bg-neon-blue/10 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-400 text-sm mb-1">สินค้าใช้งาน</p>
                  <motion.p 
                    whileHover={{ scale: 1.1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {products.filter(p => p.status === 'active').length}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-neon-blue/20 p-4 rounded-xl border border-neon-blue/30 shadow-glow-blue"
                >
                  <Zap className="w-8 h-8 text-neon-blue" />
                </motion.div>
              </div>
            </Card>

            <Card hover className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-400 text-sm mb-1">สต็อกต่ำ</p>
                  <motion.p 
                    whileHover={{ scale: 1.1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {products.filter(p => p.stock <= 10).length}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-yellow-500/20 p-4 rounded-xl border border-yellow-500/30"
                >
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </div>
            </Card>

            <Card hover className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 rounded-full blur-3xl group-hover:bg-neon-purple/10 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-400 text-sm mb-1">หมวดหมู่</p>
                  <motion.p 
                    whileHover={{ scale: 1.1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {categories.length}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-neon-purple/20 p-4 rounded-xl border border-neon-purple/30 shadow-glow-purple"
                >
                  <Layers className="w-8 h-8 text-neon-purple" />
                </motion.div>
              </div>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ค้นหาสินค้า..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:shadow-glow transition-all"
                />
              </div>
              <Button onClick={handleAddNew} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                เพิ่มสินค้า
              </Button>
            </div>
          </Card>

          {/* Products Table */}
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              data={filteredProducts}
              emptyMessage="ไม่มีสินค้า"
            />
          </Card>
        </div>
      </main>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-green-400" />
              รูปภาพสินค้า
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all relative overflow-hidden ${
                isDragging
                  ? 'border-neon-green bg-neon-green/10 shadow-glow'
                  : 'border-slate-700/50 hover:border-neon-green/50 hover:bg-slate-900/50'
              }`}
            >
              <div className={`transition-transform ${isDragging ? 'scale-110' : ''}`}>
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg font-medium mb-2">ลากและวางรูปภาพที่นี่</p>
                <p className="text-gray-500 text-sm mb-4">หรือ</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(Array.from(e.target.files || []))}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-neon-green to-green-600 text-white rounded-xl hover:shadow-glow transition-all cursor-pointer font-medium"
                >
                  เลือกไฟล์
                </label>
              </div>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-slate-700/50 group-hover:border-neon-green/50 transition-all">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="ชื่อสินค้า"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ชื่อสินค้า"
              required
              className="focus:ring-green-500"
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                หมวดหมู่
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-3 glass-dark border border-slate-700/50 rounded-xl text-gray-300 focus:outline-none focus:border-neon-green/50 focus:shadow-glow transition-all"
                required
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                ประเภทสินค้า
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, brand: '' })}
                className="w-full px-4 py-3 glass-dark border border-slate-700/50 rounded-xl text-gray-300 focus:outline-none focus:border-neon-green/50 focus:shadow-glow transition-all"
                required
              >
                <option value="pc">PC ประกอบ</option>
                <option value="notebook">Notebook</option>
              </select>
            </div>

            {formData.type === 'notebook' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  ยี่ห้อ
                </label>
                <select
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-3 glass-dark border border-slate-700/50 rounded-xl text-gray-300 focus:outline-none focus:border-neon-green/50 focus:shadow-glow transition-all"
                  required
                >
                  <option value="">เลือกยี่ห้อ</option>
                  <option value="ASUS">ASUS</option>
                  <option value="Acer">Acer</option>
                  <option value="MSI">MSI</option>
                  <option value="Lenovo">Lenovo</option>
                  <option value="HP">HP</option>
                  <option value="Dell">Dell</option>
                </select>
              </div>
            )}
          </div>

          <Input
            label="รายละเอียด"
            as="textarea"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="รายละเอียดสินค้า"
            required
            className="focus:ring-green-500"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="ราคา (฿)"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              required
              className="focus:ring-green-500"
            />

            <Input
              label="สต็อก"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="0"
              required
              className="focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              สถานะ
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 px-4 py-3 glass-dark border border-slate-700/50 rounded-xl cursor-pointer hover:border-neon-green/50 transition-all">
                <input
                  type="radio"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-neon-green focus:ring-neon-green"
                />
                <span className="text-gray-300">ใช้งาน</span>
              </label>
              <label className="flex items-center gap-3 px-4 py-3 glass-dark border border-slate-700/50 rounded-xl cursor-pointer hover:border-red-500/50 transition-all">
                <input
                  type="radio"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-red-500 focus:ring-red-500"
                />
                <span className="text-gray-300">ไม่ใช้งาน</span>
              </label>
            </div>
          </div>

          {/* Variants Section */}
          <div className="glass-dark rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                ตัวเลือกสินค้า (Variants)
              </label>
              <button
                type="button"
                onClick={handleAddVariant}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-purple to-pink-500 text-white rounded-xl hover:shadow-glow-purple transition-all text-sm font-medium"
              >
                <PlusCircle className="w-4 h-4" />
                เพิ่มตัวเลือก
              </button>
            </div>

            {variants.length > 0 && (
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={index} className="glass-dark rounded-xl p-5 border border-slate-700/50 hover:border-neon-purple/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400 font-medium">ตัวเลือก #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="ชื่อตัวเลือก"
                        type="text"
                        value={variant.name}
                        onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                        placeholder="เช่น สีแดง, 16GB"
                        className="text-sm"
                      />
                      <Input
                        label="ราคาเพิ่ม"
                        type="number"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        placeholder="0"
                        className="text-sm"
                      />
                      <Input
                        label="สต็อก"
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        placeholder="0"
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {variants.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-700/50 rounded-xl glass-dark">
                <Layers className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">ยังไม่มีตัวเลือกสินค้า</p>
                <p className="text-gray-600 text-xs mt-1">คลิกปุ่มเพิ่มตัวเลือกด้านบน</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              onClick={() => setShowModal(false)}
              variant="secondary"
              className="flex-1"
            >
              ยกเลิก
            </Button>
            <Button type="submit" className="flex-1">
              {editingProduct ? 'อัปเดตสินค้า' : 'สร้างสินค้า'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
