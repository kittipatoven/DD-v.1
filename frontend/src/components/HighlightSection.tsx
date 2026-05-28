'use client';

import Link from 'next/link';
import { Flame, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface Highlight {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  link: string;
}

const highlights: Highlight[] = [
  {
    id: 'best-sellers',
    title: 'สินค้าขายดี',
    description: 'สินค้าที่ลูกค้าชื่นชอบที่สุด',
    icon: <Flame className="w-8 h-8" />,
    color: 'from-orange-500 to-red-500',
    link: '/products?sort=best_seller',
  },
  {
    id: 'best-value',
    title: 'คุ้มที่สุด',
    description: 'ราคาดีที่สุดในตลาด',
    icon: <TrendingUp className="w-8 h-8" />,
    color: 'from-green-500 to-teal-500',
    link: '/products?sort=price_asc',
  },
  {
    id: 'new-arrival',
    title: 'สินค้าใหม่',
    description: 'สินค้าใหม่ล่าสุด',
    icon: <Award className="w-8 h-8" />,
    color: 'from-blue-500 to-purple-500',
    link: '/products?sort=newest',
  },
];

export default function HighlightSection() {
  return (
    <section className="py-16 bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-fade-in-up">
            สินค้าแนะนำ
          </h2>
          <p className="text-gray-400 text-lg animate-fade-in-up stagger-1">
            เลือกสินค้าที่ตรงใจคุณที่สุด
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              animate={{
                y: [0, -6, 0],
              }}
              whileHover={{ y: -10 }}
            >
              <Link
                href={highlight.link}
                className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 tilt-card block h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 opacity-90" />
                {/* Animated gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${highlight.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className={`absolute inset-0 bg-gradient-to-br ${highlight.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-xl`} />
                
                <div className="relative p-8 h-full flex flex-col items-center text-center">
                  <div className={`inline-flex bg-gradient-to-br ${highlight.color} p-4 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-${highlight.color.split('-')[1]}-500/30`}>
                    <div className="text-white">
                      {highlight.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {highlight.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {highlight.description}
                  </p>
                  <div className="text-blue-400 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    ดูสินค้า
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
