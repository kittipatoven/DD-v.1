'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { repairApi, Repair } from '@/lib/repair-api';
import { getImageUrl } from '@/lib/image';
import { Wrench, ChevronLeft, ChevronRight, Image as ImageIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);

  useEffect(() => {
    fetchRepairs();
  }, [page, selectedStatus]);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const data = await repairApi.getAll({
        page,
        limit,
        status: selectedStatus || undefined,
      });
      setRepairs(data.repairs);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch repairs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(total / limit);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'pending':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:3001${url}`;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      
      <main className="pt-20">
        {/* Header */}
        <div className="bg-slate-800 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 flex items-center gap-3">
              <Wrench className="w-10 h-10 text-blue-500" />
              รายการซ่อม
            </h1>
            <p className="text-gray-400 text-lg">
              ผลงานการซ่อมของเรา - สร้างความเชื่อถือให้คุณ
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter Bar */}
          <div className="bg-slate-800 rounded-2xl p-6 mb-8 border border-slate-700">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <label className="text-gray-300 font-medium">สถานะ:</label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">ทั้งหมด</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="in_progress">กำลังดำเนินการ</option>
                <option value="pending">รอดำเนินการ</option>
              </select>
            </div>

            <div className="text-sm text-gray-400 mt-4">
              แสดง {repairs.length} จาก {total} รายการ
            </div>
          </div>

          {/* Repairs Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-800 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repairs.map((repair) => (
                <div
                  key={repair.id}
                  className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-blue-500 transition-all cursor-pointer"
                  onClick={() => setSelectedRepair(repair)}
                >
                  {/* Images */}
                  {repair.images && repair.images.length > 0 ? (
                    <div className="relative h-48 bg-slate-900">
                      <img
                        src={getImageUrl(repair.images[0].image_url)}
                        alt={repair.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <ImageIcon className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">{repair.images.length}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-slate-900 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-slate-700" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-2">{repair.title}</h3>
                    {repair.device_type && (
                      <p className="text-gray-400 text-sm mb-3">{repair.device_type}</p>
                    )}
                    {repair.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {repair.description}
                      </p>
                    )}
                    
                    {/* Status */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(repair.status)}`}>
                      {getStatusIcon(repair.status)}
                      <span>{getStatusText(repair.status)}</span>
                    </div>

                    {/* Date */}
                    <p className="text-gray-500 text-xs mt-3">
                      {new Date(repair.created_at).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {repairs.length === 0 && !loading && (
            <div className="text-center py-16">
              <Wrench className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">ไม่พบรายการซ่อม</p>
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
                ก่อนหน้า
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
                ถัดไป
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedRepair && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRepair(null)}
        >
          <div
            className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">{selectedRepair.title}</h2>
                <button
                  onClick={() => setSelectedRepair(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {selectedRepair.device_type && (
                <p className="text-gray-400 mb-2">{selectedRepair.device_type}</p>
              )}

              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border mb-4 ${getStatusColor(selectedRepair.status)}`}>
                {getStatusIcon(selectedRepair.status)}
                <span>{getStatusText(selectedRepair.status)}</span>
              </div>

              {selectedRepair.description && (
                <p className="text-gray-300 mb-6">{selectedRepair.description}</p>
              )}

              {/* Images */}
              {selectedRepair.images && selectedRepair.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">รูปภาพ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRepair.images.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={getImageUrl(image.image_url)}
                          alt={image.caption || 'Repair image'}
                          className="w-full h-64 object-cover rounded-xl"
                        />
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            image.image_type === 'before' ? 'bg-red-500/20 text-red-400' :
                            image.image_type === 'during' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {image.image_type === 'before' ? 'ก่อนซ่อม' :
                             image.image_type === 'during' ? 'ระหว่างซ่อม' :
                             'หลังซ่อม'}
                          </span>
                          {image.caption && (
                            <span className="text-gray-400 text-sm ml-2">{image.caption}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-gray-500 text-sm">
                วันที่: {new Date(selectedRepair.created_at).toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
