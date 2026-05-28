'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { orderApi, Order } from '@/lib/order-api';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopbar from '@/components/AdminTopbar';
import Table from '@/components/ui/Table';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { ShoppingBag, ChevronLeft, ChevronRight, Search, Filter, Package, User, Calendar, CheckCircle, XCircle, Clock, Truck, ArrowRight } from 'lucide-react';

export default function AdminOrdersPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (user?.role !== 'admin') {
      window.location.href = '/';
      return;
    }

    const fetchOrders = async () => {
      try {
        const data = await orderApi.getAllOrders(page, 20);
        setOrders(data.data);
        setTotal(data.total);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user, page]);

  const getStatusVariant = (status: string): 'default' | 'success' | 'danger' | 'warning' | 'info' | 'pending' | 'paid' | 'shipped' => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'confirmed':
        return 'info';
      case 'shipped':
        return 'shipped';
      case 'completed':
        return 'paid';
      case 'cancelled':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'รอดำเนินการ';
      case 'confirmed':
        return 'ยืนยันแล้ว';
      case 'shipped':
        return 'จัดส่งแล้ว';
      case 'completed':
        return 'สำเร็จ';
      case 'cancelled':
        return 'ยกเลิก';
      default:
        return status;
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await orderApi.updateOrder(selectedOrder.id, { status: newStatus });
      const data = await orderApi.getAllOrders(page, 20);
      setOrders(data.data);
      setTotal(data.total);
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNote('');
      alert('อัปเดตสถานะคำสั่งซื้อสำเร็จ!');
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่');
    }
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setShowStatusModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchQuery) ||
                         order.user_id.toString().includes(searchQuery);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loading text="กำลังโหลดคำสั่งซื้อ..." />
      </div>
    );
  }

  const columns = [
    {
      key: 'id' as keyof Order,
      label: 'คำสั่งซื้อ',
      render: (value: number) => (
        <span className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
          #{value}
        </span>
      ),
    },
    {
      key: 'user_id' as keyof Order,
      label: 'ลูกค้า',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <User className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-gray-300">User #{value}</span>
        </div>
      ),
    },
    {
      key: 'total_price' as keyof Order,
      label: 'ยอดรวม',
      render: (value: number) => (
        <span className="font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
          ฿{value.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status' as keyof Order,
      label: 'สถานะ',
      render: (value: string, row: Order) => (
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(value)} className="flex items-center gap-1">
            {getStatusIcon(value)}
            {getStatusLabel(value)}
          </Badge>
        </div>
      ),
    },
    {
      key: 'created_at' as keyof Order,
      label: 'วันที่',
      render: (value: string) => (
        <div className="flex items-center gap-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date(value).toLocaleDateString('th-TH')}</span>
        </div>
      ),
    },
    {
      key: 'actions' as keyof Order,
      label: 'การจัดการ',
      render: (_: any, row: Order) => (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openStatusModal(row)}
            className="px-3 py-1.5 bg-gradient-to-r from-neon-blue to-neon-green text-white rounded-lg text-sm font-medium hover:shadow-glow transition-all"
          >
            เปลี่ยนสถานะ
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedOrder(row);
              setShowDetailModal(true);
            }}
            className="px-3 py-1.5 glass-dark border border-slate-700/50 text-gray-300 rounded-lg text-sm font-medium hover:border-neon-purple/50 transition-all"
          >
            ดูรายละเอียด
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
              <ShoppingBag className="w-8 h-8 text-neon-blue" />
              จัดการคำสั่งซื้อ
            </h1>
            <p className="text-gray-400 mt-2">ดูแลและจัดการคำสั่งซื้อทั้งหมด</p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="ค้นหาคำสั่งซื้อ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 glass-dark border border-slate-700/50 rounded-xl text-gray-300 focus:outline-none focus:border-neon-blue/50 focus:shadow-glow-blue appearance-none cursor-pointer"
                >
                  <option value="">ทั้งหมด</option>
                  <option value="pending">รอดำเนินการ</option>
                  <option value="confirmed">ยืนยันแล้ว</option>
                  <option value="shipped">จัดส่งแล้ว</option>
                  <option value="completed">สำเร็จ</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Orders Table */}
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              data={filteredOrders}
              emptyMessage="ไม่มีคำสั่งซื้อ"
            />

            {/* Pagination */}
            {total > 20 && (
              <div className="px-6 py-4 border-t border-slate-700/50">
                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    ก่อนหน้า
                  </Button>
                  <span className="text-gray-400">
                    หน้า {page} จาก {Math.ceil(total / 20)}
                  </span>
                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={page * 20 >= total}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    ถัดไป
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="เปลี่ยนสถานะคำสั่งซื้อ"
      >
        <div className="space-y-4">
          <Card>
            <p className="text-sm text-gray-400 mb-1">คำสั่งซื้อ #{selectedOrder?.id}</p>
            <p className="text-lg font-bold text-white">฿{selectedOrder?.total_price?.toLocaleString()}</p>
          </Card>

          <form onSubmit={(e) => { e.preventDefault(); handleStatusUpdate(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                เปลี่ยนสถานะเป็น
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-3 glass-dark border border-slate-700/50 rounded-xl text-gray-300 focus:outline-none focus:border-neon-blue/50 focus:shadow-glow-blue"
                required
              >
                <option value="">เลือกสถานะใหม่</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="confirmed">ยืนยันแล้ว</option>
                <option value="shipped">จัดส่งแล้ว</option>
                <option value="completed">สำเร็จ</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                บันทึกหมายเหตุ (ถ้ามี)
              </label>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 glass-dark border border-slate-700/50 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 focus:shadow-glow-blue"
                placeholder="เพิ่มบันทึกหมายเหตุสำหรับการเปลี่ยนสถานะ..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
              >
                ยืนยันเปลี่ยนสถานะ
              </Button>
              <Button
                type="button"
                onClick={() => setShowStatusModal(false)}
                variant="secondary"
                className="flex-1"
              >
                ยกเลิก
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="รายละเอียดคำสั่งซื้อ"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <p className="text-sm text-gray-400 mb-1">คำสั่งซื้อ</p>
                <p className="font-bold text-white">#{selectedOrder.id}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-400 mb-1">สถานะ</p>
                <Badge variant={getStatusVariant(selectedOrder.status)}>
                  {getStatusLabel(selectedOrder.status)}
                </Badge>
              </Card>
              <Card>
                <p className="text-sm text-gray-400 mb-1">ยอดรวม</p>
                <p className="font-bold text-white">฿{selectedOrder.total_price.toLocaleString()}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-400 mb-1">วันที่สั่งซื้อ</p>
                <p className="font-bold text-white">{new Date(selectedOrder.created_at).toLocaleString('th-TH')}</p>
              </Card>
            </div>

            {selectedOrder.shipping_address && (
              <Card>
                <p className="text-sm text-gray-400 mb-2">ที่อยู่จัดส่ง</p>
                <p className="text-white">{selectedOrder.shipping_address}</p>
              </Card>
            )}

            {selectedOrder.phone && (
              <Card>
                <p className="text-sm text-gray-400 mb-2">เบอร์โทรศัพท์</p>
                <p className="text-white">{selectedOrder.phone}</p>
              </Card>
            )}

            {selectedOrder.notes && (
              <Card>
                <p className="text-sm text-gray-400 mb-2">หมายเหตุ</p>
                <p className="text-white">{selectedOrder.notes}</p>
              </Card>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  openStatusModal(selectedOrder);
                }}
                className="flex-1"
              >
                เปลี่ยนสถานะ
              </Button>
              <Button
                onClick={() => setShowDetailModal(false)}
                variant="secondary"
                className="flex-1"
              >
                ปิด
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
