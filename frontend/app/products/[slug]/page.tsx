'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_name: string;
  stock: number;
  is_available: boolean;
  image_url?: string | null;
  thumbnail_url?: string | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  
  const { addToCart, getCartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/products/${slug}/`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        console.error('제품을 찾을 수 없습니다');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      window.location.href = '/cart';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Link href="/" className="text-3xl font-bold">🌿 발효홍삼 쇼핑몰</Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
          <p className="mt-4 text-gray-600 text-lg">제품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Link href="/" className="text-3xl font-bold">🌿 발효홍삼 쇼핑몰</Link>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">제품을 찾을 수 없습니다</h2>
          <Link href="/" className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-3xl font-bold flex items-center gap-2">
              🌿 발효홍삼 쇼핑몰
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="hover:text-green-200">홈</Link>
              <Link href="/products" className="hover:text-green-200">제품</Link>
              {isAuthenticated ? (
                <>
                  <span className="text-green-100">👤 {user?.username}님</span>
                  <button onClick={logout} className="hover:text-green-200">로그아웃</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-green-200">로그인</Link>
                  <Link href="/register" className="hover:text-green-200">회원가입</Link>
                </>
              )}
              <Link href="/cart" className="hover:text-green-200 relative">
                🛒 장바구니
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">홈</Link>
            <span className="mx-2">/</span>
            <Link href="/" className="hover:text-green-600">제품</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-9xl">🌿</span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="text-green-600 font-semibold text-lg mb-2">{product.category_name}</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
            </div>

            <div className="border-t border-b border-gray-200 py-6">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold text-green-600">{product.price.toLocaleString()}원</span>
                <span className="text-gray-500">재고: {product.stock}개</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-gray-50 rounded-xl p-6">
              <label className="block text-gray-700 font-semibold mb-3 text-lg">수량 선택</label>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 bg-gray-300 hover:bg-gray-400 rounded-lg font-bold text-2xl flex items-center justify-center transition"
                >
                  −
                </button>
                <span className="w-20 text-center font-bold text-3xl text-gray-800">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-2xl flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
              <div className="mt-4 text-right">
                <span className="text-gray-600 text-lg">총 금액: </span>
                <span className="text-3xl font-bold text-green-600">{(product.price * quantity).toLocaleString()}원</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_available || product.stock === 0}
                className={`py-4 rounded-xl font-bold text-lg transition ${
                  added
                    ? 'bg-gray-400 text-white'
                    : product.is_available && product.stock > 0
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {added ? '✓ 장바구니에 담김' : '🛒 장바구니 담기'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.is_available || product.stock === 0}
                className={`py-4 rounded-xl font-bold text-lg transition ${
                  product.is_available && product.stock > 0
                    ? 'bg-green-700 text-white hover:bg-green-800 shadow-lg hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                💳 바로 구매
              </button>
            </div>

            {/* Product Features */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-8">
              <h3 className="font-bold text-lg text-blue-900 mb-4">제품 특징</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>6년근 프리미엄 홍삼 사용</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>전통 발효 기술로 제조</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>무료배송 (50,000원 이상)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}