'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

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
  const needMore = 50000 - total;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="text-3xl font-bold">🌿 발효홍삼 쇼핑몰</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">장바구니</h1>
          <button onClick={clearCart} className="text-red-600 hover:text-red-700 font-bold text-lg">전체 삭제</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.thumbnail_url || item.image_url ? (
                      <img 
                        src={item.thumbnail_url || item.image_url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl">🌿</span>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm text-green-600 font-semibold mb-1">{item.category_name}</div>
                    <h3 className="font-bold text-xl text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-green-600 font-bold text-lg">{item.price.toLocaleString()}원</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                      className="w-10 h-10 bg-gray-300 hover:bg-gray-400 rounded-full font-bold text-gray-800 text-2xl flex items-center justify-center border-2 border-gray-400 transition"
                    >
                      −
                    </button>
                    <span className="w-14 text-center font-bold text-2xl text-gray-800">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                      className="w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-2xl flex items-center justify-center border-2 border-green-700 transition"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right w-36">
                    <div className="text-sm text-gray-600 font-medium mb-1">소계</div>
                    <div className="font-bold text-2xl text-gray-900">{(item.price * item.quantity).toLocaleString()}원</div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="text-red-500 hover:text-red-700 text-3xl font-bold ml-2 transition"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-xl p-6 sticky top-6 border-t-4 border-green-600">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">주문 요약</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-800 text-lg">
                  <span className="font-medium">상품 금액</span>
                  <span className="font-bold">{total.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-gray-800 text-lg">
                  <span className="font-medium">배송비</span>
                  <span className="font-bold">{shipping === 0 ? '무료' : shipping.toLocaleString() + '원'}</span>
                </div>
                <div className="border-t-2 border-gray-300 pt-4 flex justify-between font-bold text-xl">
                  <span className="text-gray-900">총 결제금액</span>
                  <span className="text-green-600 text-2xl">{finalTotal.toLocaleString()}원</span>
                </div>
              </div>
              {needMore > 0 && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900 font-semibold">
                    💡 {needMore.toLocaleString()}원 더 구매하시면 무료배송!
                  </p>
                </div>
              )}
              <Link 
                href="/checkout" 
                className="block w-full text-center bg-green-600 text-white py-4 rounded-lg font-bold text-xl hover:bg-green-700 shadow-lg hover:shadow-xl transition mb-3"
              >
                주문하기
              </Link>
              <Link 
                href="/" 
                className="block w-full text-center bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold text-lg hover:bg-gray-200 border-2 border-gray-300 transition"
              >
                쇼핑 계속하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}