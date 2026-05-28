'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authApi } from '@/lib/auth-api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setResetLink('');

    if (!email || !validateEmail(email)) {
      setError('กรุณากรอกอีเมลที่ถูกต้อง');
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.forgotPassword({ email });
      setSuccess(true);
      setResetLink(result.resetLink || '');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
        <Link href="/login" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          กลับไปเข้าสู่ระบบ
        </Link>

        {/* Card */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-green-500 p-4 rounded-2xl">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white text-center mb-2">
            ลืมรหัสผ่าน
          </h2>
          <p className="text-gray-400 text-center mb-6">
            กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว</span>
            </div>
          )}

          {/* Reset Link (Development Only) */}
          {success && resetLink && (
            <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-3 rounded-xl mb-6">
              <p className="text-sm mb-2">ลิงก์รีเซ็ตรหัสผ่าน (สำหรับการทดสอบ):</p>
              <a
                href={resetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs break-all hover:underline"
              >
                {resetLink}
              </a>
            </div>
          )}

          {/* Form */}
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="อีเมล"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
              />

              <Button
                type="submit"
                isLoading={loading}
                size="lg"
                className="w-full"
              >
                ส่งลิงก์รีเซ็ตรหัสผ่าน
              </Button>
            </form>
          ) : (
            <Button
              onClick={() => router.push('/login')}
              size="lg"
              className="w-full"
            >
              กลับไปเข้าสู่ระบบ
            </Button>
          )}
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-500 text-sm">
          © 2025 DD Computer. All rights reserved.
        </p>
      </div>
    </div>
  );
}
