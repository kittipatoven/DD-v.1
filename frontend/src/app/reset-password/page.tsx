'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authApi } from '@/lib/auth-api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ');
      return;
    }

    if (!password || password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({ token, password });
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Card */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-green-500 to-blue-500 p-4 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white text-center mb-2">
              รีเซ็ตรหัสผ่านสำเร็จ
            </h2>
            <p className="text-gray-400 text-center mb-6">
              รหัสผ่านของคุณถูกเปลี่ยนเรียบร้อยแล้ว
            </p>

            <Button
              onClick={() => router.push('/login')}
              size="lg"
              className="w-full"
            >
              ไปเข้าสู่ระบบ
            </Button>
          </div>

          {/* Footer */}
          <p className="text-center mt-6 text-gray-500 text-sm">
            © 2025 DD Computer. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <Link href="/login" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          กลับไปเข้าสู่ระบบ
        </Link>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-green-500 p-4 rounded-2xl">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white text-center mb-2">
            ตั้งรหัสผ่านใหม่
          </h2>
          <p className="text-gray-400 text-center mb-6">
            กรอกรหัสผ่านใหม่ของคุณ
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                รหัสผ่านใหม่
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
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ยืนยันรหัสผ่านใหม่
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
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              size="lg"
              className="w-full"
            >
              ตั้งรหัสผ่านใหม่
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-500 text-sm">
          © 2025 DD Computer. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
