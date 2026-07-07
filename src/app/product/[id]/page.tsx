'use client';

import React, { useState, useEffect, use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Product, Review } from '../../../data/seed';
import { useCartStore } from '../../../store/useCartStore';
import { useWishlistStore } from '../../../store/useWishlistStore';
import { formatCurrency } from '../../../utils/currency';
import { Star, Heart, ShoppingBag, CheckCircle, ShieldAlert, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetail({ params }: ProductPageProps) {
  const router = useRouter();
  const { id: productSlug } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [activeTab, setActiveTab] = useState<'benefits' | 'ingredients' | 'usage' | 'safety'>('benefits');
  const [quantity, setQuantity] = useState(1);

  // Review Form States
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, hasItem } = useWishlistStore();

  const fetchProductData = () => {
    fetch(`/api/products/${productSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data: Product) => {
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setActiveImage(data.images[0]);
        }
        // Fetch reviews
        return fetch(`/api/reviews?productId=${data.id}`);
      })
      .then((res) => res.json())
      .then((reviewsData: Review[]) => {
        setReviews(reviewsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProductData();
  }, [productSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-display text-primary-600 animate-pulse">
        Loading premium product detail...
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  const isWishlisted = hasItem(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity);
    // Trigger cart sidebar
    window.dispatchEvent(new CustomEvent('open-cart'));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          userName: reviewName,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });

      if (res.ok) {
        setReviewSuccess(true);
        setReviewName('');
        setReviewComment('');
        // Reload reviews and product stats
        fetchProductData();
        setTimeout(() => setReviewSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const tabContents = {
    benefits: (
      <div className="space-y-4">
        <h4 className="font-display font-medium text-primary-950 text-sm uppercase tracking-wide">Key Benefits</h4>
        <p className="text-sm font-sans text-primary-800/80 leading-relaxed">{product.benefits}</p>
        <div className="flex items-center space-x-2 text-emerald-700 text-xs font-display font-medium">
          <CheckCircle size={14} />
          <span>Dermatologist Approved</span>
          <span className="text-primary-300">•</span>
          <CheckCircle size={14} />
          <span>Hypoallergenic Formulas</span>
        </div>
      </div>
    ),
    ingredients: (
      <div className="space-y-4">
        <h4 className="font-display font-medium text-primary-950 text-sm uppercase tracking-wide font-semibold">Full Ingredients List</h4>
        <p className="text-xs font-mono bg-cream-light/60 p-4 rounded-2xl border border-primary-200/30 text-primary-800 leading-relaxed">
          {product.ingredients}
        </p>
        <p className="text-[10px] text-primary-700/60 font-sans italic">
          *Ingredients lists may change slightly over time. Refer to your physical product packaging for exact details.
        </p>
      </div>
    ),
    usage: (
      <div className="space-y-4">
        <h4 className="font-display font-medium text-primary-950 text-sm uppercase tracking-wide">Usage Instructions</h4>
        <p className="text-sm font-sans text-primary-800/80 leading-relaxed">{product.usage}</p>
        <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 flex items-start space-x-3">
          <Award size={18} className="text-primary-600 mt-0.5" />
          <div className="text-xs font-sans text-primary-800 leading-relaxed">
            <strong>Pro Tip:</strong> Apply immediately after bath time when baby's skin is slightly damp to lock in maximum hydration.
          </div>
        </div>
      </div>
    ),
    safety: (
      <div className="space-y-4">
        <h4 className="font-display font-medium text-primary-950 text-sm uppercase tracking-wide">Safety & Warnings</h4>
        <p className="text-sm font-sans text-primary-800/80 leading-relaxed">{product.safetyNotes}</p>
        <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 flex items-start space-x-3 text-red-700">
          <ShieldAlert size={18} className="mt-0.5 flex-shrink-0" />
          <div className="text-xs font-sans">
            <strong>Precautions:</strong> For external use only. Discontinue use if signs of redness or irritation occur. Keep out of reach of children to avoid accidental ingestion.
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="text-xs font-display uppercase tracking-wider text-primary-600 hover:text-primary-800 mb-8 inline-flex items-center"
      >
        ← Back to gallery
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-primary-200/40 p-4 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage}
              alt={product.name}
              className="object-cover w-full h-full rounded-2xl"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
                <span className="bg-red-500 text-white text-xs font-display font-medium uppercase tracking-wider px-5 py-2 rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 rounded-xl overflow-hidden bg-white border p-1 transition-all flex-shrink-0
                  ${activeImage === img ? 'border-primary-600 ring-2 ring-primary-100' : 'border-primary-200/50'}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`${product.name} thumbnail`} className="object-cover w-full h-full rounded-lg" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Order Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-display font-semibold uppercase tracking-widest text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                  Premium Quality
                </span>
                <button
                  onClick={() => toggleWishlist(product)}
                  className="text-primary-800 hover:text-red-500 transition-colors p-1"
                  aria-label="Toggle wishlist"
                >
                  <Heart
                    size={22}
                    className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-primary-800/80'}
                  />
                </button>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-semibold text-primary-950 leading-tight">
                {product.name}
              </h1>

              {/* Rating Summary */}
              <div className="flex items-center space-x-3 mt-3">
                <div className="flex items-center text-amber-500 text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}
                    />
                  ))}
                  <span className="font-semibold text-primary-950 ml-1.5">{product.rating}</span>
                </div>
                <span className="text-xs text-primary-700/60 font-sans border-l border-primary-200 pl-3">
                  {reviews.length} Parent Reviews
                </span>
              </div>
            </div>

            <div className="border-y border-primary-200/40 py-4 flex items-center justify-between">
              <span className="text-2xl font-display font-semibold text-primary-950">
                {formatCurrency(product.price)}
              </span>
              <span className={`text-xs font-display font-medium ${product.stock > 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            <p className="text-sm font-sans text-primary-800/90 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity controls */}
            {product.stock > 0 && (
              <div className="space-y-3">
                <span className="block text-xs font-display font-semibold text-primary-900 uppercase tracking-wider">
                  Select Quantity
                </span>
                <div className="flex items-center border border-primary-200 bg-white rounded-full w-32 px-3 py-1.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-primary-800 hover:text-primary-950 transition-colors p-1"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="flex-grow text-center font-display font-semibold text-sm text-primary-950">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="text-primary-800 hover:text-primary-950 transition-colors p-1"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full inline-flex items-center justify-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-display font-semibold text-sm tracking-widest uppercase shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              <ShoppingBag size={16} className="mr-2" />
              Add to Basket
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Panel */}
      <section className="mt-20 border-t border-primary-200/50 pt-16">
        <div className="max-w-3xl mx-auto">
          {/* Tab buttons */}
          <div className="flex justify-between border-b border-primary-200/50 pb-3 mb-8 overflow-x-auto gap-4">
            {(['benefits', 'ingredients', 'usage', 'safety'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-display uppercase tracking-widest font-medium pb-2 border-b-2 transition-all flex-shrink-0
                  ${activeTab === tab ? 'border-primary-600 text-primary-950 font-semibold' : 'border-transparent text-primary-700/60 hover:text-primary-800'}`}
              >
                {tab === 'benefits' ? 'Benefits' : 
                 tab === 'ingredients' ? 'Ingredients' : 
                 tab === 'usage' ? 'How to Use' : 'Safety & Warnings'}
              </button>
            ))}
          </div>

          {/* Tab content display */}
          <div className="bg-white/50 border border-primary-200/30 rounded-3xl p-6 sm:p-8">
            {tabContents[activeTab]}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mt-24 border-t border-primary-200/50 pt-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Review distribution */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl font-display font-semibold text-primary-950">
              Customer Feedback
            </h3>
            <div className="bg-white/60 p-6 rounded-3xl border border-primary-200/40 flex items-center justify-between">
              <div>
                <span className="block text-4xl font-display font-bold text-primary-950">{product.rating}</span>
                <span className="text-[10px] text-primary-700/60 font-sans uppercase font-medium">Out of 5 Stars</span>
              </div>
              <div className="text-right">
                <div className="flex text-amber-500 mb-1 justify-end">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-xs text-primary-800 font-sans">{reviews.length} Verified Purchases</span>
              </div>
            </div>

            {/* Write a review form */}
            <form onSubmit={handleReviewSubmit} className="bg-white/60 p-6 rounded-3xl border border-primary-200/40 space-y-4">
              <h4 className="font-display font-medium text-primary-950 text-sm uppercase tracking-wide pb-2 border-b border-primary-200/20">
                Write a Review
              </h4>
              
              <div>
                <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="w-full px-4 py-2 bg-cream-light/60 border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                  Rating Selection
                </label>
                <div className="flex space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-amber-500 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        size={18}
                        className={star <= reviewRating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your experience using this product..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-4 py-2 bg-cream-light/60 border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full px-6 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-full font-display font-medium text-xs tracking-wider uppercase shadow-sm transition-all"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>

              {reviewSuccess && (
                <p className="text-[10px] font-sans font-medium text-emerald-600 text-center animate-pulse">
                  Review submitted successfully! Thank you for sharing.
                </p>
              )}
            </form>
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-7 space-y-4 max-h-[600px] overflow-y-auto pr-2">
            <h4 className="font-display font-semibold text-primary-950 text-sm uppercase tracking-wide">
              Parent Reviews ({reviews.length})
            </h4>
            {reviews.length === 0 ? (
              <p className="text-xs text-primary-700/60 font-sans italic">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white/50 border border-primary-200/30 p-5 rounded-2xl space-y-2.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-display font-medium text-primary-950 text-xs uppercase tracking-wide">
                      {rev.userName}
                    </span>
                    <span className="text-[10px] text-primary-700/60 font-sans">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-sans text-primary-800/90 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
