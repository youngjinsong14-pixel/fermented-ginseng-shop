'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';

interface Product {
  id: number;
  name: string;
  slug?: string;
  description: string;
  price: number;
  category: number;
  category_name: string;
  stock: number;
  is_available: boolean;
  image_url?: string | null;
  thumbnail_url?: string | null;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedProducts, setAddedProducts] = useState<Set<number>>(new Set());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500000);
  const [ordering, setOrdering] = useState('-created_at');
  const [inStockOnly, setInStockOnly] = useState(false);
  
  const { addToCart, getCartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/products/categories/');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('카테고리 로딩 실패:', error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/products/');
      const data = await response.json();
      
      let productList: Product[] = [];
      if (Array.isArray(data)) {
        productList = data;
      } else if (data.results && Array.isArray(data.results)) {
        productList = data.results;
      }
      
      console.log('✅ 제품 로딩 완료:', productList.length, '개');
      setAllProducts(productList);
      setFilteredProducts(productList);
    } catch (error) {
      console.error('❌ 제품 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    console.log('🔍 필터 적용 시작...');
    let result = [...allProducts];

    if (searchQuery.trim()) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log(`검색어 "${searchQuery}" 필터 후:`, result.length, '개');
    }

    if (selectedCategory) {
      result = result.filter(product => product.category_name === selectedCategory);
      console.log(`카테고리 "${selectedCategory}" 필터 후:`, result.length, '개');
    }

    result = result.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );
    console.log(`가격 범위 ${minPrice}~${maxPrice} 필터 후:`, result.length, '개');

    if (inStockOnly) {
      result = result.filter(product => product.is_available && product.stock > 0);
      console.log('재고 있음 필터 후:', result.length, '개');
    }

    if (ordering === '-created_at') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (ordering === 'price') {
      result.sort((a, b) => a.price - b.price);
    } else if (ordering === '-price') {
      result.sort((a, b) => b.price - a.price);
    }
    console.log('정렬 후:', ordering);

    console.log('✅ 최종 필터 결과:', result.length, '개');
    setFilteredProducts(result);
  };

  const handleReset = () => {
    console.log('🔄 필터 초기화');
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice(0);
    setMaxPrice(500000);
    setOrdering('-created_at');
    setInStockOnly(false);
    setFilteredProducts(allProducts);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
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

  const categoryNames = Array.from(new Set(allProducts.map(p => p.category_name))).filter(Boolean);

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
          <h1 className="text-5xl font-bold mb-6">건강한 삶을 위한 최고의 선택</h1>
          <p className="text-2xl mb-8">프리미엄 6년근 발효홍삼</p>
          <a href="#products" className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 shadow-lg transition">
            제품 둘러보기
          </a>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-16" id="products">
        <div className="bg-white rounded-xl shadow-md p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            🔍 제품 검색 & 필터
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">검색</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  placeholder="제품명 또는 설명 검색..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                />
                <button
                  onClick={applyFilters}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2 transition"
                >
                  🔎 검색
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">카테고리</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              >
                <option value="">전체</option>
                {categoryNames.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">정렬</label>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
              >
                <option value="-created_at">최신순</option>
                <option value="price">가격 낮은순</option>
                <option value="-price">가격 높은순</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                가격 범위: {minPrice.toLocaleString()}원 ~ {maxPrice.toLocaleString()}원
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16">최소:</span>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="flex-1 accent-green-600"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16">최대:</span>
                  <input
                    type="range"
                    min="0"
                    max="500000"
                    step="10000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="flex-1 accent-green-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500 accent-green-600"
              />
              <span className="text-sm font-semibold text-gray-700">재고 있는 것만</span>
            </label>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={applyFilters}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2 transition shadow-md"
            >
              ✅ 필터 적용
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500 font-bold flex items-center justify-center gap-2 transition shadow-md"
            >
              🔄 초기화
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">인기 제품</h2>
          <p className="text-gray-600 mb-6">{filteredProducts.length}개의 제품</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-green-600"></div>
            <p className="mt-4 text-gray-600 font-semibold">제품을 불러오는 중...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <p className="text-2xl text-gray-400 mb-4">😢 검색 결과가 없습니다</p>
            <button
              onClick={handleReset}
              className="text-green-600 hover:text-green-700 font-semibold hover:underline"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <Link 
                key={product.id} 
                href={`/products/${product.slug || product.id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                <div className="h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {product.thumbnail_url || product.image_url ? (
                    <img 
                      src={product.thumbnail_url || product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-8xl">🌿</span>
                  )}
                </div>
                <div className="p-6">
                  <div className="text-sm text-green-600 font-semibold mb-2">{product.category_name}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{product.name}</h3>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      {Math.floor(product.price).toLocaleString()}원
                    </span>
                    <span className="text-xs text-gray-500">재고: {product.stock}개</span>
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={!product.is_available || product.stock === 0}
                    className={`w-full py-3 rounded-lg font-bold transition ${
                      addedProducts.has(product.id)
                        ? 'bg-gray-400 text-white'
                        : product.is_available && product.stock > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {addedProducts.has(product.id) 
                      ? '✓ 담김' 
                      : product.is_available && product.stock > 0 
                      ? '장바구니에 담기' 
                      : '품절'}
                  </button>
                </div>
              </Link>
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