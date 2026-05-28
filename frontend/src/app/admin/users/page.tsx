'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import { userApi, User } from '@/lib/user-api';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopbar from '@/components/AdminTopbar';
import Table from '@/components/ui/Table';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import { Users as UsersIcon, Shield, Ban, ChevronLeft, ChevronRight, Eye, Edit, User as UserIcon, ShoppingCart, Activity, Clock } from 'lucide-react';

export default function AdminUsersPage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      window.location.href = '/login';
      return;
    }

    const fetchUsers = async () => {
      try {
        const data = await userApi.getAllUsers(page, 20);
        setUsers(data.data);
        setTotal(data.total);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, user, page]);

  const filteredUsers = (users || []).filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBan = async (userId: number) => {
    if (confirm('คุณแน่ใจหรือที่จะแบนผู้ใช้นี้?')) {
      try {
        await userApi.banUser(userId);
        const data = await userApi.getAllUsers(page, 20);
        setUsers(data.data);
        setTotal(data.total);
        alert('แบนผู้ใช้สำเร็จ');
      } catch (error) {
        console.error('Failed to ban user:', error);
        alert('ไม่สามารถแบนผู้ใช้ได้');
      }
    }
  };

  const handleUnban = async (userId: number) => {
    try {
      await userApi.unbanUser(userId);
      const data = await userApi.getAllUsers(page, 20);
      setUsers(data.data);
      setTotal(data.total);
      alert('ปลดแบนผู้ใช้สำเร็จ');
    } catch (error) {
      console.error('Failed to unban user:', error);
      alert('ไม่สามารถปลดแบนผู้ใช้ได้');
    }
  };

  const handleRoleChange = async (userId: number, newRole: 'admin' | 'user') => {
    try {
      await userApi.updateRole(userId, newRole);
      const data = await userApi.getAllUsers(page, 20);
      setUsers(data.data);
      setTotal(data.total);
      alert(newRole === 'admin' ? 'เลื่อนขั้นเป็น Admin สำเร็จ' : 'ลดขั้นเป็น User สำเร็จ');
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('ไม่สามารถเปลี่ยนบทบาทได้');
    }
  };

  const handleLogout = () => {
    logout(); // Fire-and-forget
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Loading text="กำลังโหลดผู้ใช้..." />
      </div>
    );
  }

  const columns = [
    {
      key: 'id' as keyof User,
      label: 'ID',
      render: (value: number) => `#${value}`,
      className: 'text-gray-400',
    },
    {
      key: 'name' as keyof User,
      label: 'ชื่อ',
      render: (value: string, row: User) => (
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="bg-gradient-to-br from-neon-blue to-neon-green p-2 rounded-full shadow-glow"
          >
            <span className="text-white font-semibold text-sm">
              {value.charAt(0).toUpperCase()}
            </span>
          </motion.div>
          <div>
            <p className="font-medium text-white group-hover:text-neon-blue transition-colors">{value}</p>
            <p className="text-sm text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role' as keyof User,
      label: 'บทบาท',
      render: (value: string) => (
        <Badge variant={value === 'admin' ? 'success' : 'default'}>
          {value === 'admin' ? 'แอดมิน' : 'ผู้ใช้'}
        </Badge>
      ),
    },
    {
      key: 'status' as keyof User,
      label: 'สถานะ',
      render: (value: string) => (
        <Badge variant={value === 'active' ? 'success' : 'danger'}>
          {value === 'active' ? 'ใช้งาน' : 'แบน'}
        </Badge>
      ),
    },
    {
      key: 'created_at' as keyof User,
      label: 'วันที่สมัคร',
      render: (value: string) => new Date(value).toLocaleDateString('th-TH'),
      className: 'text-gray-400',
    },
    {
      key: 'actions' as keyof User,
      label: 'การจัดการ',
      render: (_: any, row: User) => (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedUser(row)}
            className="p-2 text-neon-purple hover:text-purple-300 hover:bg-neon-purple/20 rounded-lg transition-all"
            title="ดูข้อมูล"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
          <select
            value={row.role}
            onChange={(e) => handleRoleChange(row.id, e.target.value as 'admin' | 'user')}
            disabled={row.id === user?.id}
            className="px-3 py-1 text-sm bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-neon-purple focus:outline-none focus:ring-1 focus:ring-neon-purple disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {row.status === 'active' ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleBan(row.id)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all"
              title="แบน"
            >
              <Ban className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleUnban(row.id)}
              className="p-2 text-neon-green hover:text-green-300 hover:bg-neon-green/20 rounded-lg transition-all"
              title="ปลดแบน"
            >
              <Shield className="w-4 h-4" />
            </motion.button>
          )}
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <UsersIcon className="w-8 h-8 text-neon-purple" />
                จัดการผู้ใช้
              </h1>
              <p className="text-gray-400 mt-2">ดูแลและจัดการผู้ใช้ทั้งหมด ({filteredUsers.length} คน)</p>
            </div>
            <div className="flex-1 max-w-md">
              <Input
                type="text"
                placeholder="ค้นหาผู้ใช้..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Users Table */}
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              data={filteredUsers}
              emptyMessage="ไม่มีผู้ใช้"
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

      {/* User Detail Modal */}
      <Modal
        isOpen={selectedUser !== null}
        onClose={() => setSelectedUser(null)}
        title="ข้อมูลผู้ใช้"
        size="xl"
      >
        {selectedUser && (
          <Tabs
            tabs={[
              {
                id: 'profile',
                label: 'ข้อมูลส่วนตัว',
                icon: <UserIcon className="w-4 h-4" />,
                content: (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="bg-gradient-to-br from-neon-blue to-neon-green p-6 rounded-full shadow-glow"
                      >
                        <span className="text-white font-bold text-3xl">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </span>
                      </motion.div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{selectedUser.name}</h3>
                        <p className="text-gray-400">{selectedUser.email}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={selectedUser.role === 'admin' ? 'success' : 'default'}>
                            {selectedUser.role === 'admin' ? 'แอดมิน' : 'ผู้ใช้'}
                          </Badge>
                          <Badge variant={selectedUser.status === 'active' ? 'success' : 'danger'}>
                            {selectedUser.status === 'active' ? 'ใช้งาน' : 'แบน'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <p className="text-gray-400 text-sm mb-1">ID</p>
                        <p className="text-white font-semibold">#{selectedUser.id}</p>
                      </Card>
                      <Card>
                        <p className="text-gray-400 text-sm mb-1">สมัครเมื่อ</p>
                        <p className="text-white font-semibold">
                          {new Date(selectedUser.created_at).toLocaleDateString('th-TH')}
                        </p>
                      </Card>
                    </div>
                  </div>
                ),
              },
              {
                id: 'orders',
                label: 'ประวัติคำสั่งซื้อ',
                icon: <ShoppingCart className="w-4 h-4" />,
                content: (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">ยังไม่มีประวัติคำสั่งซื้อ</p>
                  </div>
                ),
              },
              {
                id: 'activity',
                label: 'กิจกรรม',
                icon: <Activity className="w-4 h-4" />,
                content: (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">ยังไม่มีกิจกรรม</p>
                  </div>
                ),
              },
              {
                id: 'login',
                label: 'ประวัติเข้าสู่ระบบ',
                icon: <Clock className="w-4 h-4" />,
                content: (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">ยังไม่มีประวัติการเข้าสู่ระบบ</p>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
