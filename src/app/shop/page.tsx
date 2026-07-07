'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product, Category } from '../../data/seed';
import { ProductCard } from '../../components/ProductCard';
import { Search, SlidersHorizontal, Star } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Route parameters
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  // Client states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<number>(1000); // Max ₹1000 by default
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Fetch initial category list
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Fetch filtered products on param change
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (currentCategory) query.set('category', currentCategory);
    if (currentSearch) query.set('search', currentSearch);
    if (currentSort) query.set('sort', currentSort);

    fetch(`/api/products?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Client-side price filter on top of API filtering
          const filtered = data.filter((p) => p.price <= priceRange);
          setProducts(filtered);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [currentCategory, currentSearch, currentSort, priceRange]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/shop?${params.toString()}`);
  };

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateFilters('search', searchInput);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header title */}
      <div className="border-b border-primary-200/50 pb-8 mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-semibold text-primary-950">
            {currentCategory 
              ? categories.find(c => c.slug === currentCategory)?.name || 'Collections'
              : 'Shop All Products'}
          </h1>
          <p className="text-xs text-primary-700/60 font-sans mt-1">
            Pure organic skin care, free from synthetic chemicals. Safe for everyday baby care.
          </p>
        </div>

        {/* Sort drop-down */}
        <div className="flex items-center space-x-3 self-start md:self-auto">
          <span className="text-xs font-display font-medium text-primary-800 uppercase tracking-wide">
            Sort By:
          </span>
          <select
            value={currentSort}
            onChange={(e) => updateFilters('sort', e.target.value)}
            className="px-4 py-2 bg-white border border-primary-200 rounded-full text-xs font-medium text-primary-950 focus:outline-none focus:ring-2 focus:ring-primary-100 cursor-pointer"
          >
            <option value="newest">Newest Additions</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white/60 backdrop-blur-sm border border-primary-200/40 rounded-3xl p-6 space-y-6">
            <div className="flex items-center space-x-2 text-primary-950 font-display font-medium pb-4 border-b border-primary-200/40">
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </div>

            {/* Search filter input */}
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-cream-light/60 border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all duration-300"
              />
              <div className="absolute left-3.5 top-3.5 text-primary-600">
                <Search size={14} />
              </div>
            </div>

            {/* Category filter checklist */}
            <div className="space-y-3">
              <h4 className="text-xs font-display font-semibold text-primary-950 uppercase tracking-wider">
                Categories
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => updateFilters('category', '')}
                  className={`block text-xs font-sans text-left w-full py-1.5 px-3 rounded-lg transition-colors ${
                    !currentCategory 
                      ? 'bg-primary-100/70 text-primary-900 font-medium' 
                      : 'text-primary-800 hover:bg-primary-50/50'
                  }`}
                >
                  All Collections
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilters('category', cat.slug)}
                    className={`block text-xs font-sans text-left w-full py-1.5 px-3 rounded-lg transition-colors ${
                      currentCategory === cat.slug
                        ? 'bg-primary-100/70 text-primary-900 font-medium' 
                        : 'text-primary-800 hover:bg-primary-50/50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider filter */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-display font-semibold text-primary-955 uppercase tracking-wider">
                  Max Price
                </h4>
                <span className="text-xs font-semibold text-primary-955">
                  {formatCurrency(priceRange)}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="10"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-primary-600 cursor-pointer h-1.5 bg-primary-100 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] text-primary-700/60 font-medium">
                <span>{formatCurrency(100)}</span>
                <span>{formatCurrency(1000)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="bg-white/60 rounded-3xl p-4 border border-primary-200/30 space-y-4 h-[380px]">
                  <div className="aspect-square bg-primary-100/50 rounded-2xl" />
                  <div className="h-4 bg-primary-100/50 rounded w-2/3" />
                  <div className="h-4 bg-primary-100/50 rounded w-1/2" />
                  <div className="flex justify-between pt-4">
                    <div className="h-6 bg-primary-100/50 rounded w-1/4" />
                    <div className="h-8 bg-primary-100/50 rounded-full w-8" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="bg-white/50 border border-primary-200/40 rounded-3xl p-16 text-center">
              <h3 className="font-display font-medium text-lg text-primary-900">
                No products found
              </h3>
              <p className="text-xs text-primary-700/70 font-sans mt-2 max-w-sm mx-auto">
                Try widening your price range, updating your search text, or checking other collections.
              </p>
              <button
                onClick={() => {
                  setPriceRange(1000);
                  router.push('/shop');
                }}
                className="mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-full text-xs font-display font-medium uppercase tracking-wide hover:bg-primary-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Display Products Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-primary-600 font-display">
        Loading Shop Catalog...
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
