'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Search, Menu, X, User, LogOut, Monitor, Cpu, Wrench, ShoppingCart } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activePath, setActivePath] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setActivePath(window.location.pathname);
  }, []);


  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'glass-enhanced shadow-lg shadow-blue-500/20 py-2 bg-slate-900/90' 
        : 'bg-slate-900/60 backdrop-blur-md py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-blue-500 to-green-500 p-2 rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg shadow-blue-500/25">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-green-300 transition-all duration-300">
              DD Computer
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`text-sm font-medium transition-colors relative group ${activePath === '/' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              หน้าแรก
              <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300 ${activePath === '/' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link href="/products" className={`text-sm font-medium transition-colors relative group ${activePath === '/products' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              สินค้า
              <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300 ${activePath === '/products' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
            <Link href="/repairs" className={`text-sm font-medium transition-colors flex items-center gap-1 relative group ${activePath === '/repairs' ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
              <Wrench className="w-4 h-4" />
              รายการซ่อม
              <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300 ${activePath === '/repairs' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block relative group">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isSearchFocused ? 'text-blue-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`pl-10 pr-4 py-2 border rounded-full text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${isSearchFocused ? 'bg-slate-800/80 border-blue-500/50 ring-blue-500/50 w-72' : 'bg-slate-800/50 border-slate-700 ring-transparent w-48 hover:bg-slate-800/70'}`}
              />
            </div>


            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700 px-3 py-2 rounded-full hover:bg-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                  <User className="w-5 h-5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                  <span className="text-gray-300 text-sm">{user?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 glass-enhanced rounded-lg shadow-xl shadow-blue-500/10 border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-gray-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); window.location.href = '/login'; }}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 active:scale-95 shadow-lg shadow-blue-500/25"
              >
                เข้าสู่ระบบ
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden bg-slate-800/50 border border-slate-700 p-2 rounded-lg hover:bg-slate-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 active:scale-95"
            >
              {isMenuOpen ? <X className="w-5 h-5 text-gray-300" /> : <Menu className="w-5 h-5 text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-enhanced border-t border-slate-700 mt-4 py-4 space-y-2 animate-fade-in-down">
            <Link href="/" className={`block px-4 py-2 rounded-lg transition-colors ${activePath === '/' ? 'bg-slate-700/50 text-white' : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'}`}>
              หน้าแรก
            </Link>
            <Link href="/products" className={`block px-4 py-2 rounded-lg transition-colors ${activePath === '/products' ? 'bg-slate-700/50 text-white' : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'}`}>
              สินค้า
            </Link>
            <Link href="/repairs" className={`block px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${activePath === '/repairs' ? 'bg-slate-700/50 text-white' : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'}`}>
              <Wrench className="w-4 h-4" />
              รายการซ่อม
            </Link>
            {!isAuthenticated && (
              <Link href="/login" className="block px-4 py-2 text-center bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:opacity-90 transition-opacity active:scale-95">
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
