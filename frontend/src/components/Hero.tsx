'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Star, Shield, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float stagger-2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float stagger-4"></div>
        
        {/* Particle Effect */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Mouse-following gradient */}
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/5 to-green-500/5 rounded-full blur-3xl transition-transform duration-300 ease-out"
          style={{
            left: `${mousePosition.x}%`,
            top: `${mousePosition.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-blue-500/30 rounded-full px-4 py-2 animate-fade-in-down">
            <Zap className="w-4 h-4 text-yellow-400 animate-glow-pulse" />
            <span className="text-sm text-gray-300">ร้านคอมพิวเตอร์ & โน้ตบุ๊ก ราคาคุ้มที่สุด</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight animate-fade-in-up stagger-1">
            <span className="text-gradient-animate">
              คอมพิวเตอร์
            </span>
            <br />
            <span className="text-gray-100">คุณภาพที่คุณไว้ใจ</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto animate-fade-in-up stagger-2">
            สินค้ามือ 1 และมือ 2 สภาพดี ราคาคุ้ม พร้อมรับประกัน และบริการหลังการขาย
          </p>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-6 animate-fade-in-up stagger-3">
            <div className="flex items-center gap-2 text-gray-300">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>สินค้าคุณภาพ</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Shield className="w-5 h-5 text-green-400" />
              <span>รับประกัน</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Truck className="w-5 h-5 text-blue-400" />
              <span>จัดส่งทั่วไทย</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up stagger-4">
            <Link
              href="/products"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full text-white font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-blue-500/25 animate-glow-pulse"
            >
              <span className="flex items-center gap-2">
                ดูสินค้าทั้งหมด
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-slow">
        <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gradient-to-b from-blue-400 to-green-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
