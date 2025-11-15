'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_name: string;
  stock: number;
  is_available: boolean;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set());
  const { addToCart, getCartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products/');
      const data = await response.json();
      
      // DRF 페이지네이션 확인
      if (data.results && Array.isArray(data.results)) {
        setProducts(data.results);
      } else if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedProducts(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <section className="bg-gradient-to-r from-green-500 to-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">프리미엄 6년근 발효홍삼</h1>
          <p className="text-2xl mb-8">건강한 삶을 위한 최고의 선택</p>
          <a href="#products" className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 shadow-lg">
            제품 둘러보기
          </a>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-16" id="products">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">인기 제품</h2>
        <p className="text-center text-gray-600 mb-12 text-lg">전통 발효 기술로 제조한 프리미엄 홍삼 제품</p>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
            <p className="mt-4 text-gray-600 text-lg">제품을 불러오는 중...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-lg">
            <p className="text-gray-600 text-xl mb-4">등록된 제품이 없습니다</p>
            <p className="text-gray-500 mb-6">관리자 페이지에서 제품을 추가해주세요</p>
            <a href="http://localhost:8000/admin" target="_blank" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700">
              관리자 페이지로 이동
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                <div className="h-64 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <span className="text-8xl">🌿</span>
                </div>
                <div className="p-6">
                  <div className="text-sm text-green-600 font-semibold mb-2">{product.category_name}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-green-600">{product.price.toLocaleString()}원</span>
                    <span className="text-xs text-gray-500">재고: {product.stock}개</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.is_available || product.stock === 0}
                    className={`w-full py-3 rounded-lg font-bold transition ${
                      addedProducts.has(product.id)
                        ? 'bg-gray-400 text-white'
                        : product.is_available && product.stock > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {addedProducts.has(product.id) ? '✓ 담김' : product.is_available && product.stock > 0 ? '장바구니에 담기' : '품절'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg mb-2">🌿 발효홍삼 쇼핑몰</p>
          <p className="text-gray-400">건강한 삶을 위한 프리미엄 발효홍삼</p>
        </div>
      </footer>
    </div>
  );
}