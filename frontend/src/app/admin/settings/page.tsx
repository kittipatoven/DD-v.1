'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/auth-store';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopbar from '@/components/AdminTopbar';
import Loading from '@/components/ui/Loading';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Settings, Save, Globe, DollarSign, Palette, Mail, Phone, MapPin, Facebook, Instagram, MessageSquare, Bell, Shield, ShoppingCart, Layout, Check } from 'lucide-react';
import { settingsApi } from '@/lib/settings-api';

interface SettingsForm {
  site_name: string;
  currency: string;
  tax_rate: string;
  theme: string;
  primary_color: string;
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  social_facebook: string;
  social_instagram: string;
  social_line: string;
  chat_auto_reply: boolean;
  chat_welcome_message: string;
  chat_keywords: string;
  commerce_enable_stock: boolean;
  commerce_low_stock_threshold: string;
  commerce_enable_preorder: boolean;
  orders_auto_confirm: boolean;
  orders_auto_cancel_hours: string;
  orders_enable_invoice: boolean;
  notifications_email_enabled: boolean;
  notifications_email_order: boolean;
  notifications_email_low_stock: boolean;
  notifications_sms_enabled: boolean;
  security_2fa_enabled: boolean;
  security_session_timeout: string;
  security_ip_whitelist: string;
}

type TabType = 'general' | 'commerce' | 'orders' | 'chat' | 'notifications' | 'theme' | 'security';

const tabs = [
  { id: 'general' as TabType, label: 'ทั่วไป', icon: Globe },
  { id: 'commerce' as TabType, label: 'พาณิชย์', icon: ShoppingCart },
  { id: 'orders' as TabType, label: 'คำสั่งซื้อ', icon: Layout },
  { id: 'chat' as TabType, label: 'แชท', icon: MessageSquare },
  { id: 'notifications' as TabType, label: 'การแจ้งเตือน', icon: Bell },
  { id: 'theme' as TabType, label: 'ธีม', icon: Palette },
  { id: 'security' as TabType, label: 'ความปลอดภัย', icon: Shield },
];

export default function AdminSettingsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [showToast, setShowToast] = useState(false);
  const [settings, setSettings] = useState<SettingsForm>({
    site_name: 'DD Computer',
    currency: 'THB',
    tax_rate: '7',
    theme: 'dark',
    primary_color: '#2563eb',
    secondary_color: '#22c55e',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    social_facebook: '',
    social_instagram: '',
    social_line: '',
    chat_auto_reply: true,
    chat_welcome_message: 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ',
    chat_keywords: '',
    commerce_enable_stock: true,
    commerce_low_stock_threshold: '10',
    commerce_enable_preorder: false,
    orders_auto_confirm: false,
    orders_auto_cancel_hours: '24',
    orders_enable_invoice: true,
    notifications_email_enabled: true,
    notifications_email_order: true,
    notifications_email_low_stock: true,
    notifications_sms_enabled: false,
    security_2fa_enabled: false,
    security_session_timeout: '60',
    security_ip_whitelist: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      window.location.href = '/login';
      return;
    }

    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getAsObject();
        const parseBoolean = (val: any): boolean => {
          if (typeof val === 'boolean') return val;
          if (typeof val === 'string') return val === 'true';
          return false;
        };

        setSettings({
          site_name: data.site_name || 'DD Computer',
          currency: data.currency || 'THB',
          tax_rate: data.tax_rate || '7',
          theme: data.theme || 'dark',
          primary_color: data.primary_color || '#2563eb',
          secondary_color: data.secondary_color || '#22c55e',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          contact_address: data.contact_address || '',
          social_facebook: data.social_facebook || '',
          social_instagram: data.social_instagram || '',
          social_line: data.social_line || '',
          chat_auto_reply: parseBoolean(data.chat_auto_reply),
          chat_welcome_message: data.chat_welcome_message || 'สวัสดีครับ! มีอะไรให้ช่วยไหมครับ',
          chat_keywords: data.chat_keywords || '',
          commerce_enable_stock: parseBoolean(data.commerce_enable_stock),
          commerce_low_stock_threshold: data.commerce_low_stock_threshold || '10',
          commerce_enable_preorder: parseBoolean(data.commerce_enable_preorder),
          orders_auto_confirm: parseBoolean(data.orders_auto_confirm),
          orders_auto_cancel_hours: data.orders_auto_cancel_hours || '24',
          orders_enable_invoice: parseBoolean(data.orders_enable_invoice),
          notifications_email_enabled: parseBoolean(data.notifications_email_enabled),
          notifications_email_order: parseBoolean(data.notifications_email_order),
          notifications_email_low_stock: parseBoolean(data.notifications_email_low_stock),
          notifications_sms_enabled: parseBoolean(data.notifications_sms_enabled),
          security_2fa_enabled: parseBoolean(data.security_2fa_enabled),
          security_session_timeout: data.security_session_timeout || '60',
          security_ip_whitelist: data.security_ip_whitelist || '',
        });
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [isAuthenticated, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = Object.keys(settings).map(key => {
        const value = settings[key as keyof SettingsForm];
        return {
          key,
          value: typeof value === 'boolean' ? String(value) : value,
        };
      });

      await settingsApi.update(payload);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('บันทึกการตั้งค่าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof SettingsForm, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) => (
    <div className="flex items-center justify-between">
      <span className="text-gray-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${checked ? 'bg-neon-blue' : 'bg-slate-700'}`}
      >
        <motion.div
          className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md"
          animate={{ x: checked ? 28 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </button>
    </div>
  );

  const ColorPicker = ({ value, onChange, label }: { value: string; onChange: (color: string) => void; label: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-600"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 bg-dark-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-neon-blue transition-colors"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loading text="กำลังโหลด..." />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="backdrop-blur-xl bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#2563eb]/20 rounded-xl">
                  <Globe className="w-6 h-6 text-[#2563eb]" />
                </div>
                <h2 className="text-xl font-semibold text-white">การตั้งค่าทั่วไป</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ชื่อเว็บไซต์</label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => handleChange('site_name', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">สกุลเงิน</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                  >
                    <option value="THB">THB (บาท)</option>
                    <option value="USD">USD (ดอลลาร์)</option>
                    <option value="EUR">EUR (ยูโร)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">อัตราภาษี (%)</label>
                  <input
                    type="number"
                    value={settings.tax_rate}
                    onChange={(e) => handleChange('tax_rate', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                  />
                </div>
              </div>
            </Card>
            <Card className="backdrop-blur-xl bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#22c55e]/20 rounded-xl">
                  <Mail className="w-6 h-6 text-[#22c55e]" />
                </div>
                <h2 className="text-xl font-semibold text-white">ข้อมูลติดต่อ</h2>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">อีเมล</label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    value={settings.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ที่อยู่</label>
                  <textarea
                    value={settings.contact_address}
                    onChange={(e) => handleChange('contact_address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all resize-none"
                  />
                </div>
              </div>
            </Card>
            <Card className="backdrop-blur-xl bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl shadow-2xl lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Facebook className="w-6 h-6 text-purple-500" />
                </div>
                <h2 className="text-xl font-semibold text-white">โซเชียลมีเดีย</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Facebook</label>
                  <input
                    type="url"
                    value={settings.social_facebook}
                    onChange={(e) => handleChange('social_facebook', e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={settings.social_instagram}
                    onChange={(e) => handleChange('social_instagram', e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LINE</label>
                  <input
                    type="text"
                    value={settings.social_line}
                    onChange={(e) => handleChange('social_line', e.target.value)}
                    placeholder="LINE ID"
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>
            </Card>
          </div>
        );
      case 'chat':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="backdrop-blur-xl bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#2563eb]/20 rounded-xl">
                  <MessageSquare className="w-6 h-6 text-[#2563eb]" />
                </div>
                <h2 className="text-xl font-semibold text-white">การตั้งค่าแชท</h2>
              </div>
              <div className="space-y-6">
                <ToggleSwitch
                  checked={settings.chat_auto_reply}
                  onChange={(checked) => handleChange('chat_auto_reply', checked)}
                  label="Auto Reply อัตโนมัติ"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ข้อความต้อนรับ</label>
                  <textarea
                    value={settings.chat_welcome_message}
                    onChange={(e) => handleChange('chat_welcome_message', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">คำสำคัญสำหรับ Auto Reply</label>
                  <textarea
                    value={settings.chat_keywords}
                    onChange={(e) => handleChange('chat_keywords', e.target.value)}
                    rows={4}
                    placeholder="ราคา, ส่ง, ประกัน, สวัสดี"
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">คั่นด้วยจุลภาค (,) เช่น: ราคา, ส่ง, ประกัน</p>
                </div>
              </div>
            </Card>
            <Card className="backdrop-blur-xl bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#22c55e]/20 rounded-xl">
                  <Check className="w-6 h-6 text-[#22c55e]" />
                </div>
                <h2 className="text-xl font-semibold text-white">ตัวอย่างข้อความ</h2>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-700">
                  <p className="text-xs text-gray-500 mb-2">ข้อความต้อนรับ</p>
                  <p className="text-white">{settings.chat_welcome_message}</p>
                </div>
                <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-700">
                  <p className="text-xs text-gray-500 mb-2">คำสำคัญ</p>
                  <p className="text-white">{settings.chat_keywords || 'ยังไม่ได้ตั้งค่า'}</p>
                </div>
              </div>
            </Card>
          </div>
        );
      case 'theme':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="backdrop-blur-xl bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#2563eb]/20 rounded-xl">
                  <Palette className="w-6 h-6 text-[#2563eb]" />
                </div>
                <h2 className="text-xl font-semibold text-white">ธีมและสี</h2>
              </div>
              <div className="space-y-6">
                <ColorPicker
                  value={settings.primary_color}
                  onChange={(color) => handleChange('primary_color', color)}
                  label="สีหลัก (Primary Color)"
                />
                <ColorPicker
                  value={settings.secondary_color}
                  onChange={(color) => handleChange('secondary_color', color)}
                  label="สีรอง (Secondary Color)"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">โหมดธีม</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleChange('theme', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                  >
                    <option value="dark">Dark Mode</option>
                    <option value="light">Light Mode</option>
                  </select>
                </div>
              </div>
            </Card>
            <Card className="backdrop-blur-xl bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#22c55e]/20 rounded-xl">
                  <Check className="w-6 h-6 text-[#22c55e]" />
                </div>
                <h2 className="text-xl font-semibold text-white">ตัวอย่างธีม</h2>
              </div>
              <div className="space-y-4">
                <div className="p-6 rounded-xl border-2" style={{ borderColor: settings.primary_color, backgroundColor: `${settings.primary_color}10` }}>
                  <p className="text-white font-semibold mb-2">Primary Color</p>
                  <div className="flex gap-2">
                    <div className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: settings.primary_color }}>Button</div>
                    <div className="px-4 py-2 rounded-lg border-2 text-white" style={{ borderColor: settings.primary_color }}>Border</div>
                  </div>
                </div>
                <div className="p-6 rounded-xl border-2" style={{ borderColor: settings.secondary_color, backgroundColor: `${settings.secondary_color}10` }}>
                  <p className="text-white font-semibold mb-2">Secondary Color</p>
                  <div className="flex gap-2">
                    <div className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: settings.secondary_color }}>Button</div>
                    <div className="px-4 py-2 rounded-lg border-2 text-white" style={{ borderColor: settings.secondary_color }}>Border</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      case 'commerce':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="backdrop-blur-xl bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#2563eb]/20 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-[#2563eb]" />
                </div>
                <h2 className="text-xl font-semibold text-white">การตั้งค่าพาณิชย์</h2>
              </div>
              <div className="space-y-6">
                <ToggleSwitch
                  checked={settings.commerce_enable_stock}
                  onChange={(checked) => handleChange('commerce_enable_stock', checked)}
                  label="เปิดใช้งานระบบคงคลัง"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">เกณฑ์สต็อกต่ำ</label>
                  <input
                    type="number"
                    value={settings.commerce_low_stock_threshold}
                    onChange={(e) => handleChange('commerce_low_stock_threshold', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">แจ้งเตือนเมื่อสต็อกต่ำกว่าจำนวนนี้</p>
                </div>
                <ToggleSwitch
                  checked={settings.commerce_enable_preorder}
                  onChange={(checked) => handleChange('commerce_enable_preorder', checked)}
                  label="เปิดใช้งาน Pre-order"
                />
              </div>
            </Card>
          </div>
        );
      case 'orders':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="backdrop-blur-xl bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#22c55e]/20 rounded-xl">
                  <Layout className="w-6 h-6 text-[#22c55e]" />
                </div>
                <h2 className="text-xl font-semibold text-white">การตั้งค่าคำสั่งซื้อ</h2>
              </div>
              <div className="space-y-6">
                <ToggleSwitch
                  checked={settings.orders_auto_confirm}
                  onChange={(checked) => handleChange('orders_auto_confirm', checked)}
                  label="ยืนยันคำสั่งซื้ออัตโนมัติ"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ยกเลิกคำสั่งซื้ออัตโนมัติ (ชั่วโมง)</label>
                  <input
                    type="number"
                    value={settings.orders_auto_cancel_hours}
                    onChange={(e) => handleChange('orders_auto_cancel_hours', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#22c55e] focus:ring-2 focus:ring-[#22c55e]/20 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">ยกเลิกคำสั่งซื้อที่ไม่ชำระเงินภายในระยะเวลาที่กำหนด</p>
                </div>
                <ToggleSwitch
                  checked={settings.orders_enable_invoice}
                  onChange={(checked) => handleChange('orders_enable_invoice', checked)}
                  label="เปิดใช้งานใบเสร็จ"
                />
              </div>
            </Card>
          </div>
        );
      case 'notifications':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="backdrop-blur-xl bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#2563eb]/20 rounded-xl">
                  <Bell className="w-6 h-6 text-[#2563eb]" />
                </div>
                <h2 className="text-xl font-semibold text-white">การแจ้งเตือนอีเมล</h2>
              </div>
              <div className="space-y-6">
                <ToggleSwitch
                  checked={settings.notifications_email_enabled}
                  onChange={(checked) => handleChange('notifications_email_enabled', checked)}
                  label="เปิดใช้งานการแจ้งเตือนอีเมล"
                />
                <ToggleSwitch
                  checked={settings.notifications_email_order}
                  onChange={(checked) => handleChange('notifications_email_order', checked)}
                  label="แจ้งเตือนเมื่อมีคำสั่งซื้อใหม่"
                />
                <ToggleSwitch
                  checked={settings.notifications_email_low_stock}
                  onChange={(checked) => handleChange('notifications_email_low_stock', checked)}
                  label="แจ้งเตือนเมื่อสต็อกต่ำ"
                />
              </div>
            </Card>
            <Card className="backdrop-blur-xl bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#22c55e]/20 rounded-xl">
                  <Bell className="w-6 h-6 text-[#22c55e]" />
                </div>
                <h2 className="text-xl font-semibold text-white">การแจ้งเตือน SMS</h2>
              </div>
              <div className="space-y-6">
                <ToggleSwitch
                  checked={settings.notifications_sms_enabled}
                  onChange={(checked) => handleChange('notifications_sms_enabled', checked)}
                  label="เปิดใช้งานการแจ้งเตือน SMS"
                />
                <p className="text-xs text-gray-500">ต้องตั้งค่า API SMS ก่อนใช้งาน</p>
              </div>
            </Card>
          </div>
        );
      case 'security':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="backdrop-blur-xl bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#2563eb]/20 rounded-xl">
                  <Shield className="w-6 h-6 text-[#2563eb]" />
                </div>
                <h2 className="text-xl font-semibold text-white">การตั้งค่าความปลอดภัย</h2>
              </div>
              <div className="space-y-6">
                <ToggleSwitch
                  checked={settings.security_2fa_enabled}
                  onChange={(checked) => handleChange('security_2fa_enabled', checked)}
                  label="เปิดใช้งาน 2-Factor Authentication"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timeout เซสชัน (นาที)</label>
                  <input
                    type="number"
                    value={settings.security_session_timeout}
                    onChange={(e) => handleChange('security_session_timeout', e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">ออกจากระบบอัตโนมัติเมื่อไม่มีกิจกรรม</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">IP Whitelist</label>
                  <textarea
                    value={settings.security_ip_whitelist}
                    onChange={(e) => handleChange('security_ip_whitelist', e.target.value)}
                    rows={3}
                    placeholder="192.168.1.1, 10.0.0.1"
                    className="w-full px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">คั่นด้วยจุลภาค (,) เช่น: 192.168.1.1, 10.0.0.1</p>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <AdminSidebar />

      <main className="flex-1 flex flex-col">
        <AdminTopbar />

        <div className="flex-1 flex">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-[#0f172a]/50 backdrop-blur-xl border-r border-slate-700/50 p-4">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              ตั้งค่าระบบ
            </h2>
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/30'
                        : 'text-gray-400 hover:bg-[#0f172a] hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto pb-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Fixed Save Button */}
        <div className="fixed bottom-0 right-0 left-64 bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-700/50 p-4 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2563eb] to-[#22c55e] text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-[#2563eb]/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                บันทึกการตั้งค่า
              </>
            )}
          </motion.button>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-20 right-6 bg-[#22c55e] text-white px-6 py-3 rounded-xl shadow-lg shadow-[#22c55e]/30 flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              บันทึกการตั้งค่าเรียบร้อย
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
