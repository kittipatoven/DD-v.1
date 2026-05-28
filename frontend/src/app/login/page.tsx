'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Eye, EyeOff, AlertCircle, Cpu, ArrowLeft } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isAuthenticated, user } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/products');
      }
    }
  }, [isAuthenticated, user, router]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !validateEmail(email)) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }

    if (!password || password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (isRegister) {
      if (!name || name.trim().length < 2) {
        setError('ชื่อต้องมีอย่างน้อย 2 ตัวอักษร');
        return;
      }

      if (password !== confirmPassword) {
        setError('รหัสผ่านไม่ตรงกัน');
        return;
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || (isRegister ? 'ลงทะเบียนไม่สำเร็จ' : 'เข้าสู่ระบบไม่สำเร็จ');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          กลับหน้าแรก
        </Link>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-green-500 p-3 rounded-2xl">
              <Cpu className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white text-center mb-2">
            {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </h2>
          <p className="text-gray-400 text-center mb-6">
            {isRegister ? 'สร้างบัญชีใหม่เพื่อเริ่มช้อปปิ้ง' : 'ยินดีต้อนรับกลับมา'}
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="ชื่อ"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อของคุณ"
                required
                disabled={loading}
              />
            )}

            <Input
              label="อีเมล"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!isRegister && (
                <div className="text-right mt-2">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    ลืมรหัสผ่าน?
                  </Link>
                </div>
              )}
            </div>

            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ยืนยันรหัสผ่าน
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <Button
              type="submit"
              isLoading={loading}
              size="lg"
              className="w-full"
            >
              {isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          {/* Toggle */}
          <p className="text-center mt-6 text-gray-400">
            {isRegister ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'}{' '}
            <button
              onClick={toggleMode}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              disabled={loading}
            >
              {isRegister ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-500 text-sm">
          © 2025 DD Computer. All rights reserved.
        </p>
      </div>
    </div>
  );
}
