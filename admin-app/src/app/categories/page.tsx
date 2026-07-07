'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { getApiBaseUrl } from '../../utils/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export default function AdminCategories() {
  const { token } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Field validation errors from Zod API response
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Inputs
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const apiBaseUrl = getApiBaseUrl();

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/categories`);
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddForm = () => {
    setEditCategory(null);
    setName('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=400');
    setFieldErrors({});
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (category: Category) => {
    setEditCategory(category);
    setName(category.name);
    setDescription(category.description);
    setImage(category.image);
    setFieldErrors({});
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setErrorMsg('');
    setFieldErrors({});

    const payload = { name, description, image };

    try {
      const url = editCategory ? `${apiBaseUrl}/api/categories/${editCategory.id}` : `${apiBaseUrl}/api/categories`;
      const method = editCategory ? 'PUT' : 'POST';

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
        throw new Error(data.error || 'Failed to save category changes due to a system error.');
      }

      setIsFormOpen(false);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'We could not connect to storefront services. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? All associated products will lose their category association.')) return;

    try {
      const res = await fetch(`${apiBaseUrl}/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || 'Unable to delete the category record.');
      }
    } catch (err) {
      console.error(err);
      alert('A connection issue occurred while deleting the category.');
    }
  };

  // Helper component to render inline field errors
  const FieldError = ({ field }: { field: string }) => {
    if (!fieldErrors[field] || fieldErrors[field].length === 0) return null;
    return (
      <p className="text-[10px] text-red-500 font-sans mt-1 flex items-center animate-fade-in">
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
            Manage Categories
          </h1>
          <p className="text-xs text-primary-700/60 font-sans mt-1">
            Create, update, or delete category groups that classify shop products.
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="inline-flex items-center px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-display font-medium text-xs tracking-wider uppercase shadow-sm transition-all focus:outline-none cursor-pointer"
        >
          <Plus size={14} className="mr-1.5" />
          Add Category
        </button>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white/70 backdrop-blur-sm border border-primary-200/40 rounded-3xl p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-cream-light mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.image?.startsWith('/') ? `${getApiBaseUrl()}${cat.image}` : cat.image} alt={cat.name} className="object-cover w-full h-full" />
              </div>
              <span className="text-[10px] font-mono text-primary-755 font-semibold">{cat.id}</span>
              <h3 className="font-display font-medium text-primary-950 text-base mt-0.5 mb-1.5">
                {cat.name}
              </h3>
              <p className="text-xs font-sans text-primary-800/80 leading-relaxed line-clamp-3">
                {cat.description}
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-primary-100 mt-4">
              <button
                onClick={() => handleOpenEditForm(cat)}
                className="text-primary-800 hover:text-primary-650 p-1.5 hover:bg-primary-50 rounded-lg transition-all text-xs flex items-center cursor-pointer"
              >
                <Edit2 size={13} className="mr-1" /> Edit
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all text-xs flex items-center cursor-pointer"
              >
                <Trash2 size={13} className="mr-1" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide drawer form */}
      {isFormOpen && (
        <>
          <div
            onClick={() => setIsFormOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40 cursor-pointer"
          />
          <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-cream-light z-50 shadow-2xl flex flex-col h-full border-l border-primary-200/50">
            <div className="p-6 border-b border-primary-200/40 flex items-center justify-between">
              <h3 className="font-display font-medium text-base text-primary-955">
                {editCategory ? `Edit: ${editCategory.name}` : 'Create Category'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-primary-700 hover:text-primary-900 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Baby Lotion"
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
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe this category..."
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

              <div>
                <label className="block text-[10px] font-display font-semibold text-primary-900 uppercase tracking-wider mb-1">
                  Category Image URL
                </label>
                <textarea
                  rows={2}
                  required
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    if (fieldErrors.image) {
                      const copy = { ...fieldErrors };
                      delete copy.image;
                      setFieldErrors(copy);
                    }
                  }}
                  className={`w-full px-4 py-2 bg-white border rounded-xl text-xs outline-none focus:border-primary-600 resize-none font-mono
                    ${fieldErrors.image ? 'border-red-400 ring-2 ring-red-100/50' : 'border-primary-200'}`}
                />
                <FieldError field="image" />
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

              <div className="pt-6 border-t border-primary-200/30 flex space-x-4">
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
                  {formLoading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
