'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    addressDetail: '',
    message: ''
  });
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const total = getCartTotal();
  const shipping = total >= 50000 ? 0 : 3000;
  const finalTotal = total + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderNum = 'ORD' + Date.now();
    setOrderNumber(orderNum);
    
    try {
      const response = await fetch('http://localhost:8000/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_phone: formData.phone,
          shipping_address: formData.address + ' ' + formData.addressDetail,
          shipping_message: formData.message,
          items: cart.map(item => ({
            product: item.id,
            quantity: item.quantity,
            price: item.price
          })),
          total_amount: finalTotal
        })
      });

      if (response.ok) {
        setOrderComplete(true);
        clearCart();
      }
    } catch (error) {
      console.error('주문 실패:', error);
      alert('주문 중 오류가 발생했습니다.');
    }
  };

  if (cart.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Link href="/" className="text-3xl font-bold">🌿 발효홍삼 쇼핑몰</Link>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">장바구니가 비어있습니다</h2>
          <Link href="/" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700">
            쇼핑하러 가기
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Link href="/" className="text-3xl font-bold">🌿 발효홍삼 쇼핑몰</Link>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">주문이 완료되었습니다!</h2>
            <p className="text-gray-600 mb-2">주문번호: <span className="font-bold text-green-600">{orderNumber}</span></p>
            <p className="text-gray-600 mb-8">빠른 시일 내에 배송해드리겠습니다.</p>
            <Link href="/" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="text-3xl font-bold">🌿 발효홍삼 쇼핑몰</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">주문/결제</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">배송 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">받는 분 이름 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="홍길동"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">연락처 *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="010-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">배송지 주소 *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2"
                    placeholder="서울시 강남구 테헤란로 123"
                  />
                  <input
                    type="text"
                    value={formData.addressDetail}
                    onChange={(e) => setFormData({...formData, addressDetail: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="상세 주소"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">배송 메시지</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="배송 시 요청사항을 입력해주세요"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-8 bg-green-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-green-700 shadow-lg hover:shadow-xl transition"
              >
                {Math.floor(finalTotal).toLocaleString()}원 결제하기
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-xl p-6 sticky top-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">주문 상품</h2>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start border-b border-gray-200 pb-4">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                    </div>
                    <span className="font-bold text-gray-900">{Math.floor(item.price * item.quantity).toLocaleString()}원</span>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-gray-300 pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>상품 금액</span>
                  <span className="font-semibold">{Math.floor(total).toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>배송비</span>
                  <span className="font-semibold">{shipping === 0 ? '무료' : shipping.toLocaleString() + '원'}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-300">
                  <span>총 결제금액</span>
                  <span className="text-green-600">{Math.floor(finalTotal).toLocaleString()}원</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}