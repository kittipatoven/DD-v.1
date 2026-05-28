'use client';

import Link from 'next/link';
import { Monitor, Cpu, HardDrive, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const categories: Category[] = [
  {
    id: 'pc-assembled',
    name: 'PC ประกอบ',
    icon: <Monitor className="w-8 h-8" />,
    description: 'เครื่องเล่นเกมรุ่นใหม่',
    color: 'from-blue-500 to-purple-500',
  },
  {
    id: 'notebook',
    name: 'Notebook',
    icon: <Cpu className="w-8 h-8" />,
    description: 'โน้ตบุ๊กทุกรุ่น',
    color: 'from-green-500 to-teal-500',
  },
  {
    id: 'accessories',
    name: 'อุปกรณ์เสริม',
    icon: <HardDrive className="w-8 h-8" />,
    description: 'อุปกรณ์คอมพิวเตอร์',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'monitor',
    name: 'Monitor',
    icon: <Monitor className="w-8 h-8" />,
    description: 'จอภาพคอมพิวเตอร์',
    color: 'from-purple-500 to-pink-500',
  },
];

export default function CategoryCards() {
  return (
    <section className="py-16 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 animate-fade-in-up">
            หมวดหมู่สินค้า
          </h2>
          <p className="text-gray-400 text-lg animate-fade-in-up stagger-1">
            เลือกหมวดหมู่ที่คุณสนใจ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              animate={{
                y: [0, -8, 0],
              }}
              whileHover={{ y: -12 }}
            >
              <Link
                href={`/products?category=${category.id}`}
                className="group relative block h-full"
              >
                <div className={`bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 tilt-card h-full relative overflow-hidden`}>
                  {/* Gradient border effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 blur-xl`} />
                  
                  <div className={`inline-flex bg-gradient-to-br ${category.color} p-4 rounded-2xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-${category.color.split('-')[1]}-500/30`}>
                    <div className="text-white">
                      {category.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {category.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
