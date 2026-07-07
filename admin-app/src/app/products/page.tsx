'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency } from '../../utils/currency';
import { Badge } from '../../components/ui/Badge';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { getApiBaseUrl } from '../../utils/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  stock: number;
  ingredients: string;
  benefits: string;
  usage: string;
  safetyNotes: string;
  isFeatured: boolean;
}

export default function AdminProducts() {
  const { token } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Field validation errors from Zod API response
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Inputs
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [benefits, setBenefits] = useState('');
  const [usage, setUsage] = useState('');
  const [safetyNotes, setSafetyNotes] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const apiBaseUrl = getApiBaseUrl();

  const fetchData = async () => {
    try {
      const pRes = await fetch(`${apiBaseUrl}/api/products?sort=newest`);
      const pData = await pRes.json();
      if (Array.isArray(pData)) setProducts(pData);

      const cRes = await fetch(`${apiBaseUrl}/api/categories`);
      const cData = await cRes.json();
      if (Array.isArray(cData)) {
        setCategories(cData);
        if (cData.length > 0) setCategoryId(cData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddForm = () => {
    setEditProduct(null);
    setName('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setPrice(0);
    setStock(0);
    setDescription('');
    setIngredients('');
    setBenefits('');
    setUsage('');
    setSafetyNotes('');
    setImagesText('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600');
    setIsFeatured(false);
    setFieldErrors({});
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (product: Product) => {
    setEditProduct(product);
    setName(product.name);
    setCategoryId(product.categoryId);
    setPrice(product.price);
    setStock(product.stock);
    setDescription(product.description);
    setIngredients(product.ingredients || '');
    setBenefits(product.benefits || '');
    setUsage(product.usage || '');
    setSafetyNotes(product.safetyNotes || '');
    setImagesText(product.images.join(', '));
    setIsFeatured(product.isFeatured);
    setFieldErrors({});
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg('');
    setFieldErrors({});

    const imageArray = imagesText
      .split(',')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    const payload = {
      name,
      categoryId,
      price: Number(price),
      stock: Number(stock),
      description,
      ingredients,
      benefits,
      usage,
      safetyNotes,
      images: imageArray,
      isFeatured,
    };

    try {
      const url = editProduct ? `${apiBaseUrl}/api/products/${editProduct.id}` : `${apiBaseUrl}/api/products`;
      const method = editProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error?.fieldErrors) {
          setFieldErrors(data.error.fieldErrors);
          throw new Error('We encountered some validation errors. Please check the highlighted inputs below.');
        }
        throw new Error(data.error || 'Failed to save product changes due to a system error.');
      }

      setIsFormOpen(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'We could not connect to the storefront services. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      const res = await fetch(`${apiBaseUrl}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Unable to delete the product record.');
      }
    } catch (err) {
      console.error(err);
      alert('A connection issue occurred while deleting the product.');
    }
  };

  // Helper component to render inline field errors
  const FieldError = ({ field }: { field: string }) => {
    if (!fieldErrors[field] || fieldErrors[field].length === 0) return null;
    return (
      <p className="text-[10px] text-red-500 font-sans mt-1 flex items-center">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 flex-shrink-0" />
        {fieldErrors[field][0]}
      </p>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-4 border-primary-200/50 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-primary-955">
            Manage Products
          </h1>
          <p className="text-xs text-primary-700/60 font-sans mt-1">
            Create, update, and remove products from the public skin care store catalog.
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="inline-flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-display font-medium text-xs tracking-wider uppercase shadow-sm transition-all focus:outline-none cursor-pointer"
        >
          <Plus size={14} className="mr-1.5" />
          Add Product
        </button>
      </div>

      {/* Table list */}
      <div className="bg-white/70 backdrop-blur-sm border border-primary-200/40 rounded-3xl p-6 shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <p className="text-xs text-primary-700/60 font-sans italic py-4">No products in catalog.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-primary-200/30 text-primary-900 font-display font-medium uppercase tracking-wider">
                  <th className="pb-3">Item</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3 text-center">Featured</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {products.map((p) => (
                  <tr key={p.id} className="text-primary-850 hover:bg-cream-light/30 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.images[0]?.startsWith('/') ? `${getApiBaseUrl()}${p.images[0]}` : p.images[0]} alt={p.name} className="object-cover w-full h-full" />
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-primary-955 block">{p.name}</span>
                          <span className="text-[10px] text-primary-755 font-mono">{p.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5">
                      {categories.find((c) => c.id === p.categoryId)?.name || p.categoryId}
                    </td>

                    <td className="py-3.5 font-semibold text-primary-955">
                      {formatCurrency(p.price)}
                    </td>

                    <td className="py-3.5 font-mono">
                      <span className={p.stock === 0 ? 'text-red-500 font-semibold' : 'text-primary-850'}>
                        {p.stock}
                      </span>
                    </td>

                    <td className="py-3.5 text-center">
                      {p.isFeatured ? (
                        <Badge variant="success">Yes</Badge>
                      ) : (
                        <span className="text-primary-700/40">-</span>
                      )}
                    </td>

                    <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditForm(p)}
                        className="text-primary-800 hover:text-primary-650 p-1.5 hover:bg-primary-50 rounded-lg transition-all cursor-pointer"
                        title="Edit Item"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer Overlay Form */}
      {isFormOpen && (
        <>
          <div
            onClick={() => setIsFormOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40 cursor-pointer"
          />
          <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-2xl bg-cream-light z-50 shadow-2xl flex flex-col h-full border-l border-primary-200/50">
            <div className="p-6 border-b border-primary-200/40 flex items-center justify-between">
              <h3 className="font-display font-medium text-base text-primary-955">
                {editProduct ? `Edit: ${editProduct.name}` : 'Create New Product'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-primary-700 hover:text-primary-900 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kesar Lotion"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) {
                        const copy = { ...fieldErrors };
                        delete copy.name;
                        setFieldErrors(copy);
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs outline-none transition-all
                      ${fieldErrors.name ? 'border-red-400 ring-2 ring-red-100/50' : 'border-primary-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100'}`}
                  />
                  <FieldError field="name" />
                </div>

                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    Store Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      if (fieldErrors.categoryId) {
                        const copy = { ...fieldErrors };
                        delete copy.categoryId;
                        setFieldErrors(copy);
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs outline-none transition-all cursor-pointer
                      ${fieldErrors.categoryId ? 'border-red-400 ring-2 ring-red-100/50' : 'border-primary-200 focus:border-primary-600 focus:ring-2'}`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <FieldError field="categoryId" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => {
                      setPrice(Number(e.target.value));
                      if (fieldErrors.price) {
                        const copy = { ...fieldErrors };
                        delete copy.price;
                        setFieldErrors(copy);
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs outline-none transition-all
                      ${fieldErrors.price ? 'border-red-400 ring-2 ring-red-100/50' : 'border-primary-200 focus:border-primary-600 focus:ring-2'}`}
                  />
                  <FieldError field="price" />
                </div>

                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    Inventory Stock
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => {
                      setStock(Number(e.target.value));
                      if (fieldErrors.stock) {
                        const copy = { ...fieldErrors };
                        delete copy.stock;
                        setFieldErrors(copy);
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs outline-none transition-all
                      ${fieldErrors.stock ? 'border-red-400 ring-2 ring-red-100/50' : 'border-primary-200 focus:border-primary-600 focus:ring-2'}`}
                  />
                  <FieldError field="stock" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                  Product Description
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe this product..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (fieldErrors.description) {
                      const copy = { ...fieldErrors };
                      delete copy.description;
                      setFieldErrors(copy);
                    }
                  }}
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-xs outline-none transition-all resize-none
                    ${fieldErrors.description ? 'border-red-400 ring-2 ring-red-100/50' : 'border-primary-200 focus:border-primary-600 focus:ring-2'}`}
                />
                <FieldError field="description" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    Ingredients List
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Saffron, Almond oil, Aloe..."
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 resize-none"
                  />
                  <FieldError field="ingredients" />
                </div>

                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    Key Benefits
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Soothes rashes, locks in moisture..."
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 resize-none"
                  />
                  <FieldError field="benefits" />
                </div>

                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    Usage Instructions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Massage gently after bath time..."
                    value={usage}
                    onChange={(e) => setUsage(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 resize-none"
                  />
                  <FieldError field="usage" />
                </div>

                <div>
                  <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                    Safety Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Hypoallergenic, avoid eye area..."
                    value={safetyNotes}
                    onChange={(e) => setSafetyNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-white border border-primary-200 rounded-xl text-xs outline-none focus:border-primary-600 resize-none"
                  />
                  <FieldError field="safetyNotes" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                  Product Image URLs (Comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={imagesText}
                  onChange={(e) => {
                    setImagesText(e.target.value);
                    if (fieldErrors.images) {
                      const copy = { ...fieldErrors };
                      delete copy.images;
                      setFieldErrors(copy);
                    }
                  }}
                  className={`w-full px-4 py-2 bg-white border rounded-xl text-xs outline-none focus:border-primary-600 resize-none font-mono
                    ${fieldErrors.images ? 'border-red-400 ring-2 ring-red-100/50' : 'border-primary-200'}`}
                />
                <FieldError field="images" />
              </div>

              <div className="flex items-center space-x-2 bg-white/50 p-4 rounded-xl border border-primary-200/30">
                <input
                  type="checkbox"
                  id="feat"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-primary-655 focus:ring-primary-100 border-primary-200 rounded cursor-pointer"
                />
                <label htmlFor="feat" className="text-xs text-primary-900 font-medium cursor-pointer">
                  Feature this product on homepage sliders
                </label>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-650 text-xs rounded-xl p-4 border border-red-200 flex items-start space-x-2 animate-fade-in">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
                  <div>
                    <p className="font-semibold">{errorMsg}</p>
                    <p className="text-[10px] text-red-600/80 mt-0.5">Please review the highlighted details before submitting.</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-primary-200/30 flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-1/3 py-3 bg-cream border border-primary-200 rounded-full font-display font-medium text-xs text-primary-850 uppercase transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-2/3 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-display font-semibold text-xs uppercase shadow-sm transition-all cursor-pointer"
                >
                  {formLoading ? 'Saving Record...' : 'Save Product Details'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
