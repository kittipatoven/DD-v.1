'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { repairApi, Repair } from '@/lib/repair-api';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopbar from '@/components/AdminTopbar';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Wrench, Plus, Edit, Trash2, Search, Eye, Upload, X, CheckCircle, Clock, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/lib/image';

export default function AdminRepairsPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    device_type: '',
    status: 'completed',
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      window.location.href = '/login';
      return;
    }

    fetchData();
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      const data = await repairApi.getAll({ limit: 100 });
      setRepairs(data.repairs);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRepairs = repairs.filter(repair =>
    repair.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repair.device_type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRepair) {
        // For editing, use the old approach with image URLs
        const data: any = {
          title: formData.title,
          description: formData.description,
          device_type: formData.device_type,
          status: formData.status,
        };
        await repairApi.update(editingRepair.id, data);
      } else {
        // For creating new, use the new createWithImages with File[]
        if (uploadedImages.length === 0) {
          alert('กรุณาอัปโหลดอย่างน้อย 1 รูปภาพ');
          return;
        }
        await repairApi.createWithImages({
          title: formData.title,
          description: formData.description,
          device_type: formData.device_type,
          status: formData.status as 'completed' | 'in_progress' | 'pending',
          images: uploadedImages,
        });
      }

      setShowModal(false);
      setEditingRepair(null);
      setFormData({
        title: '',
        description: '',
        device_type: '',
        status: 'completed',
      });
      setUploadedImages([]);
      setImagePreviews([]);
      fetchData();
    } catch (error: any) {
      console.error('Failed to save repair:', error);
      alert(error.message || 'ไม่สามารถบันทึกรายการซ่อมได้');
    }
  };

  const handleEdit = (repair: Repair) => {
    setEditingRepair(repair);
    setFormData({
      title: repair.title,
      description: repair.description || '',
      device_type: repair.device_type || '',
      status: repair.status,
    });
    
    // For editing, just show previews without storing files
    if (repair.images && repair.images.length > 0) {
      setImagePreviews(repair.images.map(img => getImageUrl(img.image_url) as string));
    }
    
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('คุณแน่ใจหรือที่จะลบรายการซ่อมนี้?')) {
      try {
        await repairApi.delete(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete repair:', error);
        alert('ไม่สามารถลบรายการซ่อมได้');
      }
    }
  };

  const handleAddNew = () => {
    setEditingRepair(null);
    setFormData({
      title: '',
      description: '',
      device_type: '',
      status: 'completed',
    });
    setUploadedImages([]);
    setImagePreviews([]);
    setShowModal(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleImageUpload(files);
  };

  const handleImageUpload = async (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    for (const file of imageFiles) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreviews(prev => [...prev, previewUrl]);
      setUploadedImages(prev => [...prev, file]);
    }
  };

  const handleRemoveImage = (index: number) => {
    // Revoke object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'เสร็จสิ้น';
      case 'in_progress':
        return 'กำลังดำเนินการ';
      case 'pending':
        return 'รอดำเนินการ';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loading text="กำลังโหลดรายการซ่อม..." />
      </div>
    );
  }

  const columns = [
    {
      key: 'title' as keyof Repair,
      label: 'หัวข้อ',
      render: (value: string, row: Repair) => {
        const imageUrl = getImageUrl((row as any)?.images?.[0]?.image_url);
        return (
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={value}
                className="w-12 h-12 rounded-lg object-contain border border-slate-700"
              />
            ) : (
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-700">
                <Wrench className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div>
              <span className="font-medium text-white block">{value}</span>
              {row.device_type && (
                <span className="text-gray-400 text-sm">{row.device_type}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'status' as keyof Repair,
      label: 'สถานะ',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <span className="text-gray-300">{getStatusText(value)}</span>
        </div>
      ),
    },
    {
      key: 'created_at' as keyof Repair,
      label: 'วันที่',
      render: (value: string) => (
        <span className="text-gray-400">
          {new Date(value).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'images' as keyof Repair,
      label: 'รูปภาพ',
      render: (_: any, row: Repair) => (
        <div className="flex items-center gap-1">
          <ImageIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{row.images?.length || 0}</span>
        </div>
      ),
    },
    {
      key: 'actions' as keyof Repair,
      label: 'การจัดการ',
      render: (_: any, row: Repair) => (
        <div className="flex items-center gap-2">
          <Link href="/repairs" target="_blank">
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
              <Wrench className="w-8 h-8 text-neon-green" />
              จัดการรายการซ่อม
            </h1>
            <p className="text-gray-400 mt-2">ดูแลและจัดการรายการซ่อมทั้งหมด - DD Computer</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card hover glow className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 rounded-full blur-3xl group-hover:bg-neon-green/10 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-400 text-sm mb-1">รายการทั้งหมด</p>
                  <motion.p 
                    whileHover={{ scale: 1.1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {repairs.length}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-neon-green/20 p-4 rounded-xl border border-neon-green/30 shadow-glow"
                >
                  <Wrench className="w-8 h-8 text-neon-green" />
                </motion.div>
              </div>
            </Card>

            <Card hover className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-400 text-sm mb-1">เสร็จสิ้น</p>
                  <motion.p 
                    whileHover={{ scale: 1.1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {repairs.filter(r => r.status === 'completed').length}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-green-500/20 p-4 rounded-xl border border-green-500/30"
                >
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </motion.div>
              </div>
            </Card>

            <Card hover className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-400 text-sm mb-1">กำลังดำเนินการ</p>
                  <motion.p 
                    whileHover={{ scale: 1.1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {repairs.filter(r => r.status === 'in_progress').length}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-yellow-500/20 p-4 rounded-xl border border-yellow-500/30"
                >
                  <Clock className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </div>
            </Card>

            <Card hover className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-400 text-sm mb-1">รอดำเนินการ</p>
                  <motion.p 
                    whileHover={{ scale: 1.1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {repairs.filter(r => r.status === 'pending').length}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-red-500/20 p-4 rounded-xl border border-red-500/30"
                >
                  <AlertCircle className="w-8 h-8 text-red-400" />
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
                  placeholder="ค้นหารายการซ่อม..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-neon-green/50 focus:shadow-glow transition-all"
                />
              </div>
              <Button onClick={handleAddNew} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                เพิ่มรายการซ่อม
              </Button>
            </div>
          </Card>

          {/* Repairs Table */}
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              data={filteredRepairs}
              emptyMessage="ไม่มีรายการซ่อม"
            />
          </Card>
        </div>
      </main>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRepair ? 'แก้ไขรายการซ่อม' : 'เพิ่มรายการซ่อมใหม่'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-green-400" />
              รูปภาพ (ก่อน/หลัง/ระหว่างซ่อม)
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group glass-dark rounded-xl p-4 border border-slate-700/50">
                    <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900 p-2">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="max-h-full max-w-full object-contain object-center"
                      />
                    </div>
                    <p className="text-gray-400 text-sm truncate">{uploadedImages[index]?.name}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            label="หัวข้อ/ชื่ออุปกรณ์"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="เช่น ซ่อมคอมพิวเตอร์ Dell XPS 15"
            required
            className="focus:ring-green-500"
          />

          <Input
            label="ประเภทอุปกรณ์"
            type="text"
            value={formData.device_type}
            onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
            placeholder="เช่น โน๊ตบุ๊ค, คอมพิวเตอร์, เซิร์ฟเวอร์"
            className="focus:ring-green-500"
          />

          <Input
            label="รายละเอียดการซ่อม"
            as="textarea"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="อธิบายปัญหาและการแก้ไข..."
            className="focus:ring-green-500"
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              สถานะ
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 px-4 py-3 glass-dark border border-slate-700/50 rounded-xl cursor-pointer hover:border-green-500/50 transition-all">
                <input
                  type="radio"
                  value="completed"
                  checked={formData.status === 'completed'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-green-500 focus:ring-green-500"
                />
                <span className="text-gray-300">เสร็จสิ้น</span>
              </label>
              <label className="flex items-center gap-3 px-4 py-3 glass-dark border border-slate-700/50 rounded-xl cursor-pointer hover:border-yellow-500/50 transition-all">
                <input
                  type="radio"
                  value="in_progress"
                  checked={formData.status === 'in_progress'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-gray-300">กำลังดำเนินการ</span>
              </label>
              <label className="flex items-center gap-3 px-4 py-3 glass-dark border border-slate-700/50 rounded-xl cursor-pointer hover:border-red-500/50 transition-all">
                <input
                  type="radio"
                  value="pending"
                  checked={formData.status === 'pending'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-red-500 focus:ring-red-500"
                />
                <span className="text-gray-300">รอดำเนินการ</span>
              </label>
            </div>
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
              {editingRepair ? 'อัปเดตรายการซ่อม' : 'สร้างรายการซ่อม'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
