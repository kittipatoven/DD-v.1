'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User, ShoppingCart, Heart, Settings, Edit2, LogOut, Package, Calendar, MapPin } from 'lucide-react';

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setEditFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout(); // Fire-and-forget
    window.location.href = '/login';
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    alert('อัปเดตข้อมูลสำเร็จ!');
    setShowEditModal(false);
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const tabs = [
    {
      id: 'profile',
      label: 'ข้อมูลส่วนตัว',
      icon: <User className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-green-500 p-8 rounded-full">
                <span className="text-white font-bold text-4xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                <p className="text-gray-400">{user.email}</p>
                <div className="flex gap-2 mt-3 justify-center md:justify-start">
                  <Badge variant={user.role === 'admin' ? 'success' : 'default'}>
                    {user.role === 'admin' ? 'แอดมิน' : 'ผู้ใช้'}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                แก้ไขข้อมูล
              </Button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500/20 p-3 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">สมัครเมื่อ</p>
                  <p className="text-white font-semibold">ไม่ระบุ</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500/20 p-3 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">คำสั่งซื้อทั้งหมด</p>
                  <p className="text-white font-semibold">0 รายการ</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-500/20 p-3 rounded-xl">
                  <Heart className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">รายการโปรด</p>
                  <p className="text-white font-semibold">0 รายการ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'orders',
      label: 'ประวัติคำสั่งซื้อ',
      icon: <ShoppingCart className="w-4 h-4" />,
      content: (
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">ยังไม่มีประวัติคำสั่งซื้อ</p>
            <p className="text-gray-500">เริ่มช้อปปิ้งเพื่อดูประวัติคำสั่งซื้อของคุณ</p>
          </div>
        </div>
      ),
    },
    {
      id: 'wishlist',
      label: 'รายการโปรด',
      icon: <Heart className="w-4 h-4" />,
      content: (
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">รายการโปรดว่างเปล่า</p>
            <p className="text-gray-500">บันทึกสินค้าที่คุณชอบไว้ที่นี่</p>
          </div>
        </div>
      ),
    },
    {
      id: 'settings',
      label: 'ตั้งค่า',
      icon: <Settings className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-400" />
              ที่อยู่จัดส่ง
            </h3>
            <div className="space-y-4">
              <Input
                label="ชื่อ-นามสกุล"
                type="text"
                placeholder="ชื่อ-นามสกุล"
              />
              <Input
                label="เบอร์โทรศัพท์"
                type="tel"
                placeholder="0xx-xxx-xxxx"
              />
              <Input
                label="ที่อยู่"
                as="textarea"
                rows={3}
                placeholder="ที่อยู่จัดส่ง"
              />
              <Button className="w-full">บันทึกที่อยู่</Button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <LogOut className="w-6 h-6 text-red-400" />
              ออกจากระบบ
            </h3>
            <p className="text-gray-400 mb-4">คุณต้องการออกจากระบบหรือไม่?</p>
            <Button onClick={handleLogout} variant="danger" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <User className="w-10 h-10 text-blue-400" />
              โปรไฟล์ของฉัน
            </h1>
            <p className="text-gray-400 mt-2">จัดการข้อมูลส่วนตัวและตั้งค่าบัญชีของคุณ</p>
          </div>

          {/* Tabs */}
          <Tabs tabs={tabs} defaultTab="profile" />
        </div>
      </main>

      <Footer />

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Edit2 className="w-6 h-6 text-blue-400" />
              แก้ไขข้อมูลส่วนตัว
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="ชื่อ"
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="ชื่อของคุณ"
                required
              />

              <Input
                label="อีเมล"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="อีเมลของคุณ"
                required
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  ยกเลิก
                </Button>
                <Button type="submit" className="flex-1">
                  บันทึก
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
