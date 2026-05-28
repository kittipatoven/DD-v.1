'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useCartStore } from '@/store/cart-store';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function CartPage() {
  const { user } = useAuthStore();
  const { cart, isLoading, loadCart, updateCartItem, removeCartItem, clearCart, getCartTotal } = useCartStore();
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (user) {
      loadCart(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (cart) {
      const qtyMap: { [key: number]: number } = {};
      cart.items.forEach((item) => {
        qtyMap[item.id] = item.quantity;
      });
      setQuantities(qtyMap);
    }
  }, [cart]);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantities({ ...quantities, [itemId]: newQuantity });
    updateCartItem(itemId, { product_id: cart?.items.find(i => i.id === itemId)?.product_id || 0, quantity: newQuantity });
  };

  const handleRemoveItem = async (itemId: number) => {
    if (confirm('ต้องการลบสินค้านี้ออกจากตะกร้า?')) {
      await removeCartItem(itemId);
    }
  };

  const handleClearCart = async () => {
    if (confirm('ต้องการล้างตะกร้าสินค้าทั้งหมด?')) {
      if (user) {
        await clearCart(user.id);
      }
    }
  };

  const total = getCartTotal();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShoppingCart className="w-8 h-8" />
            ตะกร้าสินค้า
          </h1>
          {cart && cart.items.length > 0 && (
            <button
              onClick={handleClearCart}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ล้างตะกร้า
            </button>
          )}
        </div>

        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 mx-auto mb-4 text-gray-500" />
            <h2 className="text-2xl font-semibold mb-4">ตะกร้าสินค้าว่างเปล่า</h2>
            <p className="text-gray-400 mb-8">ยังไม่มีสินค้าในตะกร้าของคุณ</p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              ไปเลือกซื้อสินค้า
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800 rounded-lg p-4 flex gap-4 items-center"
                >
                  {item.product?.images && item.product.images.length > 0 ? (
                    <div className="w-24 h-24 relative flex-shrink-0">
                      <Image
                        src={item.product.images[0].image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-8 h-8 text-gray-500" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.product?.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{item.product?.description}</p>
                    <p className="text-blue-400 font-bold">
                      ฿{item.product?.price?.toLocaleString('th-TH')}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, quantities[item.id] - 1)}
                        className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors"
                        disabled={quantities[item.id] <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{quantities[item.id]}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, quantities[item.id] + 1)}
                        className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-slate-800 rounded-lg p-6 h-fit sticky top-4">
              <h2 className="text-xl font-bold mb-4">สรุปคำสั่งซื้อ</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">จำนวนสินค้า</span>
                  <span>{cart.items.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ราคารวม</span>
                  <span>฿{total.toLocaleString('th-TH')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">ภาษี (7%)</span>
                  <span>฿{(total * 0.07).toLocaleString('th-TH')}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between font-bold text-lg">
                  <span>ยอดสุทธิ</span>
                  <span className="text-blue-400">
                    ฿{(total * 1.07).toLocaleString('th-TH')}
                  </span>
                </div>
              </div>

              <Link
                href="/orders/create"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-center font-semibold transition-colors"
              >
                ดำเนินการชำระเงิน
              </Link>

              <Link
                href="/products"
                className="block w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg text-center font-semibold transition-colors mt-3"
              >
                เลือกซื้อสินค้าเพิ่ม
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
