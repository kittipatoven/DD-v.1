'use client';

import { motion } from 'framer-motion';
import { User, ShoppingBag, Calendar, Mail, Phone, MapPin, Plus } from 'lucide-react';

interface CustomerPanelProps {
  customer?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    address?: string;
    created_at?: string;
  };
  orders?: {
    id: number;
    total_price: number;
    status: string;
    created_at: string;
  }[];
  onCreateOrder?: () => void;
}

export default function CustomerPanel({ customer, orders, onCreateOrder }: CustomerPanelProps) {
  if (!customer) {
    return (
      <div className="w-80 bg-[#0f172a]/80 backdrop-blur-xl border-l border-slate-700/50 p-6">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">เลือกแชทเพื่อดูข้อมูลลูกค้า</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 bg-[#0f172a]/80 backdrop-blur-xl border-l border-slate-700/50 flex flex-col"
    >
      {/* Customer Info */}
      <div className="p-6 border-b border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#2563eb]" />
          ข้อมูลลูกค้า
        </h3>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-4">
          {customer.avatar ? (
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#2563eb] shadow-lg shadow-[#2563eb]/30"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-[#2563eb] to-[#22c55e] rounded-full flex items-center justify-center shadow-lg shadow-[#2563eb]/30">
              <span className="text-white font-bold text-2xl">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <h4 className="mt-3 font-semibold text-white text-lg">{customer.name}</h4>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {customer.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{customer.email}</span>
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{customer.phone}</span>
            </div>
          )}
          {customer.address && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-gray-300">{customer.address}</span>
            </div>
          )}
          {customer.created_at && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">
                สมัครเมื่อ {new Date(customer.created_at).toLocaleDateString('th-TH')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Order History */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#22c55e]" />
          ประวัติการสั่งซื้อ
        </h3>

        {orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-[#2563eb]/50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-gray-400 text-sm">Order #{order.id}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'completed'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                        : order.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">
                    ฿{order.total_price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(order.created_at).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">ไม่มีประวัติการสั่งซื้อ</p>
          </div>
        )}

        {/* Create Order Button */}
        {customer && onCreateOrder && (
          <div className="mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateOrder}
              className="w-full bg-gradient-to-r from-[#2563eb] to-[#22c55e] text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/30"
            >
              <Plus className="w-5 h-5" />
              สร้างออเดอร์
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
