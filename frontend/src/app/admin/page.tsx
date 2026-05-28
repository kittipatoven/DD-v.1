'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { adminApi, DashboardStats, RecentActivity } from '@/lib/admin-api';
import { orderApi } from '@/lib/order-api';
import api from '@/lib/api';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopbar from '@/components/AdminTopbar';
import Card from '@/components/ui/Card';
import {
  Users,
  ShoppingBag,
  Eye,
  CreditCard,
  TrendingUp,
  LayoutDashboard,
  Package,
  ArrowRight,
  Activity,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboardPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orderStats, setOrderStats] = useState<any>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [topViewedProducts, setTopViewedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [dateRangeLabel, setDateRangeLabel] = useState<string>('ทั้งหมด');

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setDateRangeLabel('วันนี้');
  };

  const setLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setDateRangeLabel('7 วันล่าสุด');
  };

  const setAllTime = () => {
    setStartDate('');
    setEndDate('');
    setDateRangeLabel('ทั้งหมด');
  };

  const handleDateFilter = () => {
    if (startDate && endDate) {
      setDateRangeLabel(`${startDate} ถึง ${endDate}`);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (user?.role !== 'admin') {
      window.location.href = '/';
      return;
    }

    const fetchDashboard = async () => {
      try {
        const [dashboardData, orderData, activityData, topViewedData] =
          await Promise.all([
            adminApi.getDashboardStats(),
            orderApi.getOrderStats(),
            adminApi.getRecentActivity(),
            api.get('/products/top-viewed', {
              params: startDate && endDate ? {
                start: startDate,
                end: endDate,
              } : undefined,
            }),
          ]);
        setStats(dashboardData);
        setOrderStats(orderData);
        setActivity(activityData);
        setTopViewedProducts(topViewedData.data);
      } catch (error: any) {
        console.error('Failed to fetch dashboard data:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAuthenticated, user, startDate, endDate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loading text="กำลังโหลดแดชบอร์ด..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 py-2 rounded-xl hover:opacity-90"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 flex">
      <AdminSidebar />

      <main className="flex-1">
        <AdminTopbar />

        <div className="p-8">
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card hover glow className="group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">ผู้ใช้ทั้งหมด</p>
                  <motion.p 
                    whileHover={{ scale: 1.1 }}
                    className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-blue-400 bg-clip-text text-transparent"
                  >
                    {stats?.totalUsers || 0}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gradient-to-br from-neon-blue to-blue-600 p-4 rounded-xl shadow-glow-blue"
                >
                  <Users className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </Card>

            <Card hover glow className="group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">สินค้าทั้งหมด</p>
                  <motion.p 
                    whileHover={{ scale: 1.1 }}
                    className="text-4xl font-bold bg-gradient-to-r from-neon-green to-green-400 bg-clip-text text-transparent"
                  >
                    {stats?.totalProducts || 0}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gradient-to-br from-neon-green to-green-600 p-4 rounded-xl shadow-glow"
                >
                  <Package className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </Card>

            <Card hover className="group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">คำสั่งซื้อทั้งหมด</p>
                  <motion.p 
                    whileHover={{ scale: 1.1 }}
                    className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-purple-400 bg-clip-text text-transparent"
                  >
                    {orderStats?.totalOrders || 0}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gradient-to-br from-neon-purple to-purple-600 p-4 rounded-xl shadow-glow-purple"
                >
                  <ShoppingBag className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </Card>

            <Card hover className="group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">รายได้ทั้งหมด</p>
                  <motion.p 
                    whileHover={{ scale: 1.1 }}
                    className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
                  >
                    ฿{(orderStats?.totalRevenue || 0).toLocaleString()}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gradient-to-br from-yellow-500 to-orange-500 p-4 rounded-xl"
                >
                  <CreditCard className="w-8 h-8 text-white" />
                </motion.div>
              </div>
            </Card>
          </div>

          {/* Order Status Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card hover className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-400 text-sm mb-1">คำสั่งซื้อรอดำเนินการ</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {orderStats?.pendingOrders || 0}
                  </p>
                  {orderStats?.pendingOrders > 0 && (
                    <Badge variant="warning" className="mt-2">ต้องดำเนินการ</Badge>
                  )}
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-yellow-500/20 p-4 rounded-xl border border-yellow-500/30"
                >
                  <ShoppingBag className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </div>
            </Card>

            <Card hover className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-gray-400 text-sm mb-1">คำสั่งซื้อสำเร็จ</p>
                  <p className="text-3xl font-bold text-neon-green">
                    {orderStats?.completedOrders || 0}
                  </p>
                  <div className="flex items-center gap-1 text-neon-green text-sm mt-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>เติบโต</span>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-neon-green/20 p-4 rounded-xl border border-neon-green/30 shadow-glow"
                >
                  <Activity className="w-8 h-8 text-neon-green" />
                </motion.div>
              </div>
            </Card>

          </div>

          {/* Top Viewed Products Chart */}
          <Card className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-neon-blue" />
                สินค้าที่ถูกดูมากที่สุด
                <span className="text-sm font-normal text-gray-400">({dateRangeLabel})</span>
              </h2>
              
              {/* Date Filter Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={setAllTime}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    !startDate && !endDate
                      ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                      : 'bg-slate-800 text-gray-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={setToday}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    startDate === endDate && startDate === new Date().toISOString().split('T')[0]
                      ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                      : 'bg-slate-800 text-gray-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  วันนี้
                </button>
                <button
                  onClick={setLast7Days}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                    startDate && endDate && !startDate.includes(new Date().toISOString().split('T')[0])
                      ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                      : 'bg-slate-800 text-gray-400 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  7 วัน
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
                  />
                  <button
                    onClick={handleDateFilter}
                    className="bg-neon-blue/20 text-neon-blue border border-neon-blue/30 px-3 py-1.5 rounded-lg text-sm hover:bg-neon-blue/30 transition-all flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topViewedProducts}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any) => [`${value} views`, 'จำนวนการดู']}
                  />
                  <Bar dataKey="views" fill="url(#colorViews)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Activity Section */}
          <div className="grid grid-cols-1 gap-6">
            {/* Recent Views */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-neon-blue" />
                  การดูสินค้าล่าสุด
                </h2>
                {activity?.recentViews && activity.recentViews.length > 0 && (
                  <Link href="/admin/products" className="text-neon-blue hover:text-blue-300 text-sm flex items-center gap-1">
                    ดูทั้งหมด <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              {activity?.recentViews && activity.recentViews.length > 0 ? (
                <div className="space-y-3">
                  {activity.recentViews.slice(0, 5).map((view: any) => (
                    <motion.div
                      key={view.id}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="flex items-center justify-between p-4 glass-dark rounded-xl border border-slate-700/50 hover:border-neon-blue/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-neon-blue/20 p-2 rounded-lg group-hover:bg-neon-blue/30 transition-colors">
                          <Eye className="w-4 h-4 text-neon-blue" />
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-neon-blue transition-colors">
                            {view.product?.name}
                          </p>
                          <p className="text-sm text-gray-400">
                            ดูโดย {view.user?.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(view.created_at).toLocaleString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">ไม่มีการดูสินค้าล่าสุด</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
