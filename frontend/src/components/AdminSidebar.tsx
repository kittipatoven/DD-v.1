'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Users, CreditCard, LogOut, Cpu, Settings, Wrench } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Products', href: '/admin/products', icon: <Package className="w-5 h-5" /> },
  { label: 'Repairs', href: '/admin/repairs', icon: <Wrench className="w-5 h-5" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout(); // Fire-and-forget
    window.location.href = '/login';
  };

  return (
    <div className="w-64 glass-dark border-r border-slate-700/50 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="bg-gradient-to-br from-neon-blue to-neon-green p-3 rounded-xl shadow-glow"
          >
            <Cpu className="w-6 h-6 text-white" />
          </motion.div>
          <span className="text-xl font-bold text-white group-hover:text-neon-green transition-colors">
            DD Computer
          </span>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-neon-blue/20 to-neon-green/20 text-white border border-neon-blue/30 shadow-glow-blue'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="mb-4 px-4 py-3 glass-dark rounded-xl">
          <p className="text-xs text-gray-400 mb-1">Admin</p>
          <p className="text-white font-semibold truncate">{user?.name}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/30"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </div>
  );
}
