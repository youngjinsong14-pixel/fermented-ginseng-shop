'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from './context/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  slug: string;
  category_name: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, getCartCount } = useCart();
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch('http://localhost:8000/api/products/')
      .then(res => res.json())
      .then(data => {
        setProducts(data.results || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setAddedProducts(prev => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* 헤더 */}
      <header className="bg-green-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">🌿 발효홍삼 쇼핑몰</h1>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="hover:text-green-200">홈</Link>
              <Link href="/products" className="hover:text-green-200">제품</Link>
              <Link href="/cart" className="hover:text-green-200 relative">
                장바구니
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 배너 */}
      <section className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">프리미엄 6년근 발효홍삼</h2>
          <p className="text-xl mb-8">건강한 삶을 위한 최고의 선택</p>
          <button className="bg-white text-green-600 px-8 py-3 rounded-full font-bold hover:bg-green-50 transition">
            제품 둘러보기
          </button>
        </div>
      </section>

      {/* 제품 목록 */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">인기 제품</h2>
        
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">로딩중...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-600 mb-4">등록된 제품이 없습니다</p>
            <p className="text-gray-500">관리자 페이지에서 제품을 추가해주세요</p>
            <a 
              href="http://localhost:8000/admin" 
              target="_blank"
              className="inline-block mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              관리자 페이지로 이동
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <span className="text-6xl">🌿</span>
                </div>
                <div className="p-4">
                  <div className="text-sm text-green-600 mb-1">{product.category_name}</div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">
                      {product.price.toLocaleString()}원
                    </span>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className={`px-4 py-2 rounded transition ${
                        addedProducts.has(product.id)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {addedProducts.has(product.id) ? '✓ 담김' : '담기'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-800 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg mb-2">🌿 발효홍삼 쇼핑몰</p>
          <p className="text-gray-400">프리미엄 건강식품으로 건강한 삶을</p>
        </div>
      </footer>
    </div>
  );
}