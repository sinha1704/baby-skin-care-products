'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Heart, Sparkles, Smile } from 'lucide-react';
import { Product, Category } from '../data/seed';
import { ProductCard } from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  const heroSlides = [
    {
      title: 'Lovingly Crafted for Delicate Skin',
      subtitle: 'Pure, organic botanicals designed to protect and nourish your baby\'s natural skin barrier.',
      image: '/banner1.png',
      cta: 'Shop Collections',
      link: '/shop'
    },
    {
      title: 'Tear-Free, Calming Bath Rituals',
      subtitle: 'Enriched with organic chamomile and calendula to soothe baby before bedtime.',
      image: '/banner2.png',
      cta: 'Explore Bath Wash',
      link: '/shop?category=baby-wash'
    },
    {
      title: 'Soothing Relief for Baby Eczema',
      subtitle: 'Steroid-free barrier repair creams containing 100% natural colloidal oatmeal.',
      image: '/banner3.png',
      cta: 'Shop Eczema Creams',
      link: '/shop?category=moisturising-cream'
    }
  ];

  useEffect(() => {
    // Fetch products
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFeaturedProducts(data.filter((p) => p.isFeatured).slice(0, 3));
        }
      })
      .catch((err) => console.error(err));

    // Fetch categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Auto transition hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Premium Hero Slider Section */}
      <section className="relative h-[650px] w-full bg-cream-dark overflow-hidden flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-black/10 z-10" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSlides[currentHeroSlide].image}
              alt="Baby Skin Care Hero Banner"
              className="object-cover w-full h-full"
            />

            {/* Slide Content */}
            <div className="absolute inset-0 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-start text-white">
              <motion.div
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="max-w-xl md:bg-white/10 md:backdrop-blur-sm md:p-8 md:rounded-3xl border border-white/10"
              >
                <h1 className="text-4xl md:text-5xl font-display font-semibold leading-tight text-white mb-4">
                  {heroSlides[currentHeroSlide].title}
                </h1>
                <p className="text-sm md:text-base font-sans leading-relaxed text-white/90 mb-8">
                  {heroSlides[currentHeroSlide].subtitle}
                </p>
                <Link
                  href={heroSlides[currentHeroSlide].link}
                  className="inline-flex items-center px-8 py-3.5 bg-white text-charcoal font-display font-medium text-sm tracking-wide uppercase rounded-full shadow-lg hover:bg-primary-50 transition-all duration-300 active:scale-98"
                >
                  {heroSlides[currentHeroSlide].cta}
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentHeroSlide ? 'bg-white w-6' : 'bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Brand Values / Philosophy Banner */}
      <section id="philosophy" className="bg-white py-16 border-y border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-pastel-pink flex items-center justify-center text-primary-600 mb-4">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-display font-medium text-primary-950 text-sm mb-1.5 uppercase tracking-wide">
                Dermatologist Tested
              </h3>
              <p className="text-xs text-primary-800/70 font-sans leading-relaxed">
                Hypoallergenic, clinically validated formulas safe for newborn skin.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-pastel-blue flex items-center justify-center text-primary-600 mb-4">
                <Heart size={24} />
              </div>
              <h3 className="font-display font-medium text-primary-950 text-sm mb-1.5 uppercase tracking-wide">
                100% Organic Extracts
              </h3>
              <p className="text-xs text-primary-800/70 font-sans leading-relaxed">
                Formulated exclusively with premium USDA-certified botanical extracts.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-pastel-green flex items-center justify-center text-primary-600 mb-4">
                <Sparkles size={24} />
              </div>
              <h3 className="font-display font-medium text-primary-950 text-sm mb-1.5 uppercase tracking-wide">
                pH-Balanced Formulas
              </h3>
              <p className="text-xs text-primary-800/70 font-sans leading-relaxed">
                Perfectly calibrated to match your baby's natural acid mantle layer.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-pastel-gold flex items-center justify-center text-primary-600 mb-4">
                <Smile size={24} />
              </div>
              <h3 className="font-display font-medium text-primary-950 text-sm mb-1.5 uppercase tracking-wide">
                Tear-Free Rituals
              </h3>
              <p className="text-xs text-primary-800/70 font-sans leading-relaxed">
                Gentle cleansers that guarantee bathtime is filled with smiles, not tears.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Categories Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl font-display font-semibold text-primary-950">
              Nurturing Collections
            </h2>
            <p className="text-sm text-primary-800/70 font-sans mt-2">
              Explore our range of premium, organic baby skin care products designed for your little one's everyday routines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group relative h-80 rounded-3xl overflow-hidden shadow-sm border border-primary-200/30 flex items-end p-6 bg-cream-dark transition-all duration-300 hover:shadow-md"
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />

                {/* Category Info */}
                <div className="relative z-20 text-white">
                  <h3 className="font-display font-medium text-lg text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-white/80 font-sans line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                  <span className="inline-flex items-center text-xs font-display font-medium mt-3 text-white group-hover:underline">
                    Shop Now <ArrowRight size={12} className="ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white border-t border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-display font-semibold text-primary-950">
                Highly Recommended
              </h2>
              <p className="text-sm text-primary-800/70 font-sans mt-2">
                Our bestselling daily skin care essentials loved by parents worldwide.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center text-sm font-display font-medium text-primary-600 hover:underline mt-4 sm:mt-0"
            >
              View All Products
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Callout Banner */}
      <section className="py-24 bg-cream-light border-t border-primary-200/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-pastel-pink/40 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-pastel-blue/40 blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-xs font-display tracking-widest uppercase font-semibold text-primary-600">
            Our Organic Promise
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-semibold text-primary-950 mt-4 leading-tight">
            Only what is good, nothing that is not.
          </h2>
          <p className="text-sm sm:text-base text-primary-800/80 leading-relaxed font-sans max-w-2xl mx-auto mt-6">
            We believe that baby skin care should be pure and simple. That is why we formulate our products without parabens, sulfates, silicones, synthetic colorants, or artificial fragrances. We test every single batch under strict pediatric supervision, ensuring it is safe enough for newborns.
          </p>
          <div className="flex justify-center space-x-6 mt-10">
            <div className="border-r border-primary-200 pr-6">
              <span className="block text-2xl font-display font-semibold text-primary-950">100%</span>
              <span className="text-[10px] uppercase font-display tracking-wider text-primary-700/60 font-medium">Cruelty Free</span>
            </div>
            <div className="border-r border-primary-200 pr-6">
              <span className="block text-2xl font-display font-semibold text-primary-950">Vegan</span>
              <span className="text-[10px] uppercase font-display tracking-wider text-primary-700/60 font-medium">Formulas</span>
            </div>
            <div>
              <span className="block text-2xl font-display font-semibold text-primary-950">Zero</span>
              <span className="text-[10px] uppercase font-display tracking-wider text-primary-700/60 font-medium">Synthetics</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
