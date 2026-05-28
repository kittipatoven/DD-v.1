'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Cpu } from 'lucide-react';
import { settingsApi } from '@/lib/settings-api';

export default function Footer() {
  const [settings, setSettings] = useState({
    contact_address: '999 PS2 อาคารห้องอัมพีเรียล ถนนพระราม 9 แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
    contact_phone: '02-999-9999',
    contact_email: 'contact@ddcomputer.com',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getPublic();
        if (data) {
          setSettings({
            contact_address: data.contact_address || settings.contact_address,
            contact_phone: data.contact_phone || settings.contact_phone,
            contact_email: data.contact_email || settings.contact_email,
          });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    fetchSettings();
  }, []);
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-blue-500 to-green-500 p-2 rounded-lg">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                DD Computer
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
              ร้านคอมพิวเตอร์ & โน้ตบุ๊ก มือ 1 มือ 2 ราคาคุ้มที่สุด พร้อมรับประกันและบริการหลังการขาย
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-300 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">เมนูหลัก</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  หน้าแรก
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition-colors text-sm">
                  สินค้าทั้งหมด
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">หมวดหมู่</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=gaming-pc" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Gaming PC
                </Link>
              </li>
              <li>
                <Link href="/products?category=notebook" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Notebook
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="text-gray-400 hover:text-white transition-colors text-sm">
                  อุปกรณ์เสริม
                </Link>
              </li>
              <li>
                <Link href="/products?category=monitor" className="text-gray-400 hover:text-white transition-colors text-sm">
                  จอภาพ
                </Link>
              </li>
              <li>
                <Link href="/products?category=storage" className="text-gray-400 hover:text-white transition-colors text-sm">
                  ฮาร์ดดิสก์
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">ติดต่อเรา</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  {settings.contact_address}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">{settings.contact_phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">{settings.contact_email}</span>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="text-white font-semibold mb-4">เวลาทำการ</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between text-gray-400">
                <span>วันเสาร์-อาทิตย์</span>
                <span>10:30–20:30</span>
              </li>
              <li className="flex justify-between text-gray-400">
                <span>วันจันทร์-ศุกร์</span>
                <span>10:30–20:30</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 DD Computer. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm">
              <Link href="#" className="text-gray-500 hover:text-white transition-colors">
                นโยบายความเป็นส่วนตัว
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white transition-colors">
                เงื่อนไขการใช้งาน
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
