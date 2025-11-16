
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
  name: '',
  phone: '',
  address: '',
  addressDetail: '',
  postalCode: '',  // 우편번호 추가
  message: '',
});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const total = getCartTotal();
    const shipping = total >= 50000 ? 0 : 3000;
    const finalTotal = total + shipping;
    
    try {
      console.log('🔄 주문 전송 시작...');
      
 const orderPayload = {
  recipient_name: formData.name,
  phone: formData.phone,
  address: `${formData.address} ${formData.addressDetail}`.trim(),
 postal_code: formData.postalCode,
  message: formData.message || '',
  subtotal: total,
  shipping_fee: shipping,
  total: finalTotal,
  status: 'pending',
  items: cart.map(item => ({
    product: item.id,
    quantity: item.quantity,
    price: item.price
  }))
};
      
      console.log('📦 주문 데이터:', orderPayload);
      
      const response = await fetch('http://localhost:8000/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      console.log('📡 응답 상태:', response.status);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = await response.text();
        }
        console.error('❌ 주문 실패 상태:', response.status);
        console.error('❌ 주문 실패 내용:', errorData);
        alert(`주문 실패!\n상태: ${response.status}\n내용: ${JSON.stringify(errorData, null, 2)}`);
        throw new Error('주문 실패');
      }

      const data = await response.json();
      console.log('✅ 주문 성공:', data);

      alert(`주문이 완료되었습니다!\n주문번호: ${data.id}\n\n주문자: ${formData.name}\n총 금액: ${finalTotal.toLocaleString()}원\n\n감사합니다!`);
      
      clearCart();
      router.push('/');
      
    } catch (error) {
      console.error('❌ 주문 오류:', error);
      if (!error.message.includes('주문 실패')) {
        alert('주문 처리 중 오류가 발생했습니다.\n다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Link href="/" className="text-3xl font-bold">🌿 발효홍삼 쇼핑몰</Link>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">장바구니가 비어있습니다</h2>
          <Link href="/" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 mt-6">
            쇼핑 계속하기
          </Link>
        </div>
      </div>
    );
  }

  const total = getCartTotal();
  const shipping = total >= 50000 ? 0 : 3000;
  const finalTotal = total + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="text-3xl font-bold">🌿 발효홍삼 쇼핑몰</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">주문/결제</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">배송 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">받는 분 이름 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="홍길동"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">연락처 *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="010-1234-5678"
                  />
                </div>

<div>
  <label className="block text-sm font-semibold mb-2 text-gray-700">배송지 주소 *</label>
  <input
    type="text"
    required
    value={formData.postalCode}
    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2 text-gray-900"
    placeholder="우편번호 (예: 06234)"
  />
  <input
    type="text"
    required
    value={formData.address}
    onChange={(e) => setFormData({...formData, address: e.target.value})}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2 text-gray-900"
    placeholder="서울시 강남구 테헤란로 123"
  />
  <input
    type="text"
    value={formData.addressDetail}
    onChange={(e) => setFormData({...formData, addressDetail: e.target.value})}
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
    placeholder="상세 주소 (선택)"
  />
</div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">배송 메시지</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="배송 시 요청사항을 입력해주세요"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg font-bold text-lg transition shadow-lg ${
                loading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading ? '주문 처리 중...' : `${finalTotal.toLocaleString()}원 결제하기`}
            </button>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-6 text-gray-800">주문 상품</h2>
              
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b">
                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.thumbnail_url || item.image_url ? (
                        <img 
                          src={item.thumbnail_url || item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">🌿</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category_name}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600">수량: {item.quantity}개</span>
                        <span className="font-bold text-green-600">{(item.price * item.quantity).toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pt-4 border-t">
                <div className="flex justify-between text-gray-800">
                  <span className="font-medium">상품 금액</span>
                  <span className="font-medium">{total.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-gray-800">
                  <span className="font-medium">배송비</span>
                  <span className="font-medium">{shipping === 0 ? '무료' : shipping.toLocaleString() + '원'}</span>
                </div>
                {total < 50000 && shipping > 0 && (
                  <p className="text-xs text-green-600">
                    {(50000 - total).toLocaleString()}원 더 구매하시면 무료배송!
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                  <span>총 결제금액</span>
                  <span className="text-green-600">{finalTotal.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}