'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, User, ChevronDown, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function AdminTopbar() {
  const { user, logout } = useAuthStore();
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout(); // Fire-and-forget
    window.location.href = '/login';
  };

  return (
    <div className="glass-dark border-b border-slate-700/50 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหา..."
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue/50 focus:shadow-glow-blue transition-all"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-8">
          {/* Notification */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-3 glass-dark rounded-xl hover:bg-slate-700/50 transition-all"
          >
            <Bell className="w-5 h-5 text-gray-400 hover:text-white" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-neon-green rounded-full animate-pulse" />
          </motion.button>

          {/* Profile Dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-2 glass-dark rounded-xl hover:bg-slate-700/50 transition-all"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-green rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-white font-semibold text-sm">{user?.name}</p>
                <p className="text-gray-400 text-xs">Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 glass-dark rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-700/50">
                    <p className="text-white font-semibold">{user?.name}</p>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
